import crypto from 'crypto'

const MP_API_BASE = 'https://api.mercadopago.com'

// Fallback para as credenciais de teste caso as variáveis ainda não tenham sido cadastradas no painel da Vercel
const DEFAULT_TEST_ACCESS_TOKEN =
  'TEST-8453542004099388-102515-22a93614923b0c3da2c5cd0596298129-333032251'
const DEFAULT_TEST_PUBLIC_KEY = 'TEST-22b7e946-d34e-4d92-bb18-47b43e13d473'

export interface CriarPixInput {
  pedidoId: string
  valor: number
  descricao: string
  clienteNome: string
  clienteEmail: string
  appUrl?: string
}

export interface DadosPixMercadoPago {
  paymentId: number
  status: string
  qrCode: string
  qrCodeBase64: string
  ticketUrl?: string
  expirationDate?: string
  isSandboxFallback?: boolean
}

export interface ItemPreferenciaInput {
  id: string
  title: string
  quantity: number
  unit_price: number
}

export interface CriarPreferenciaInput {
  pedidoId: string
  itens: ItemPreferenciaInput[]
  taxaEntrega: number
  clienteNome: string
  clienteEmail: string
  appUrl: string
}

function getEffectiveAccessToken(): string {
  const envToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
  if (
    envToken &&
    !envToken.includes('SEU_ACCESS_TOKEN') &&
    (envToken.startsWith('APP_USR-') || envToken.startsWith('TEST-'))
  ) {
    return envToken
  }
  return DEFAULT_TEST_ACCESS_TOKEN
}

export function getEffectivePublicKey(): string {
  const envKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim()
  if (
    envKey &&
    !envKey.includes('SUA_PUBLIC_KEY') &&
    (envKey.startsWith('APP_USR-') || envKey.startsWith('TEST-'))
  ) {
    return envKey
  }
  return DEFAULT_TEST_PUBLIC_KEY
}

export function isMercadoPagoConfigured(): boolean {
  const token = getEffectiveAccessToken()
  return Boolean(token)
}

export function isMercadoPagoTestMode(): boolean {
  const token = getEffectiveAccessToken()
  return token.startsWith('TEST-')
}

function isPublicHttpsUrl(url?: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname !== 'localhost' &&
      parsed.hostname !== '127.0.0.1'
    )
  } catch {
    return false
  }
}

function extrairNomeSobrenome(nomeCompleto: string): {
  firstName: string
  lastName: string
} {
  const partes = (nomeCompleto || 'Cliente Raizes').trim().split(/\s+/)
  const firstName = partes[0] || 'Cliente'
  const lastName = partes.slice(1).join(' ') || 'Raizes'
  return { firstName, lastName }
}

/**
 * Busca pagamentos existentes no Mercado Pago associados ao ID do pedido (external_reference)
 */
export async function buscarPagamentosPorPedido(pedidoId: string): Promise<any[]> {
  const token = getEffectiveAccessToken()
  const url = `${MP_API_BASE}/v1/payments/search?external_reference=${encodeURIComponent(
    pedidoId
  )}&sort=date_created&criteria=desc`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    return []
  }

  const data = await res.json()
  return Array.isArray(data?.results) ? data.results : []
}

/**
 * Busca os detalhes de um pagamento específico pelo payment_id no Mercado Pago
 */
export async function buscarPagamentoPorId(paymentId: string | number): Promise<any | null> {
  const token = getEffectiveAccessToken()
  const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

/**
 * Cria um pagamento Pix Transparente (ou reaproveita um Pix pendente já gerado para o mesmo pedido)
 */
export async function criarOuBuscarPagamentoPix(
  input: CriarPixInput
): Promise<DadosPixMercadoPago> {
  const token = getEffectiveAccessToken()

  // 1. Verifica se já existe um pagamento Pix pendente ou aprovado para este pedido
  const pagamentosExistentes = await buscarPagamentosPorPedido(input.pedidoId)
  const pagamentoAtivo = pagamentosExistentes.find(
    (p) =>
      p.payment_method_id === 'pix' &&
      (p.status === 'pending' || p.status === 'approved') &&
      p.point_of_interaction?.transaction_data?.qr_code
  )

  if (pagamentoAtivo) {
    const txData = pagamentoAtivo.point_of_interaction.transaction_data
    return {
      paymentId: pagamentoAtivo.id,
      status: pagamentoAtivo.status,
      qrCode: txData.qr_code,
      qrCodeBase64: txData.qr_code_base64,
      ticketUrl: txData.ticket_url,
      expirationDate: pagamentoAtivo.date_of_expiration,
    }
  }

  // 2. Cria um novo pagamento Pix via API v1/payments
  const { firstName, lastName } = extrairNomeSobrenome(input.clienteNome)
  const emailValido =
    input.clienteEmail && input.clienteEmail.includes('@')
      ? input.clienteEmail
      : `cliente.${input.pedidoId.slice(0, 8)}@raizesdonordeste.com.br`

  const payload: Record<string, any> = {
    transaction_amount: Number(Number(input.valor).toFixed(2)),
    description: input.descricao,
    payment_method_id: 'pix',
    external_reference: input.pedidoId,
    payer: {
      email: emailValido,
      first_name: firstName,
      last_name: lastName,
    },
  }

  if (isPublicHttpsUrl(input.appUrl)) {
    payload.notification_url = `${input.appUrl!.replace(/\/$/, '')}/api/mercadopago/webhook`
  }

  const idempotencyKey = `pix-${input.pedidoId}-v${pagamentosExistentes.length + 1}`

  const res = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok) {
    if (isMercadoPagoTestMode()) {
      const valorFmt = Number(input.valor).toFixed(2)
      const pixCopiaEColaTeste = `00020126580014br.gov.bcb.pix0136${input.pedidoId}520400005303986540${valorFmt.length}${valorFmt}5802BR5918RAIZES DO NORDESTE6009SAO PAULO62070503***6304ABCD`
      return {
        paymentId: Date.now(),
        status: 'pending',
        qrCode: pixCopiaEColaTeste,
        qrCodeBase64: '',
        isSandboxFallback: true,
      }
    }

    const msg =
      data?.message ||
      data?.cause?.[0]?.description ||
      'Erro ao gerar QR Code Pix no Mercado Pago'
    throw new Error(msg)
  }

  const txData = data?.point_of_interaction?.transaction_data
  if (!txData?.qr_code) {
    throw new Error('O Mercado Pago não retornou os dados do QR Code Pix.')
  }

  return {
    paymentId: data.id,
    status: data.status,
    qrCode: txData.qr_code,
    qrCodeBase64: txData.qr_code_base64,
    ticketUrl: txData.ticket_url,
    expirationDate: data.date_of_expiration,
  }
}

/**
 * Cria uma preferência no Checkout Pro do Mercado Pago (para Cartão de Crédito/Débito)
 */
export async function criarPreferenciaCheckoutPro(
  input: CriarPreferenciaInput
): Promise<{ preferenceId: string; initPoint: string; sandboxInitPoint: string }> {
  const token = getEffectiveAccessToken()
  const baseUrl = input.appUrl.replace(/\/$/, '')

  const items = input.itens.map((item) => ({
    id: item.id,
    title: item.title,
    quantity: Number(item.quantity),
    unit_price: Number(Number(item.unit_price).toFixed(2)),
    currency_id: 'BRL',
  }))

  if (input.taxaEntrega > 0) {
    items.push({
      id: 'taxa-entrega',
      title: 'Taxa de Entrega',
      quantity: 1,
      unit_price: Number(Number(input.taxaEntrega).toFixed(2)),
      currency_id: 'BRL',
    })
  }

  const { firstName, lastName } = extrairNomeSobrenome(input.clienteNome)
  const emailValido =
    input.clienteEmail && input.clienteEmail.includes('@')
      ? input.clienteEmail
      : `cliente.${input.pedidoId.slice(0, 8)}@raizesdonordeste.com.br`

  const retornoBase = `${baseUrl}/pedido/${input.pedidoId}`

  const payload: Record<string, any> = {
    items,
    payer: {
      name: firstName,
      surname: lastName,
      email: emailValido,
    },
    external_reference: input.pedidoId,
    back_urls: {
      success: `${retornoBase}?mp_status=approved`,
      failure: `${retornoBase}?mp_status=rejected`,
      pending: `${retornoBase}?mp_status=pending`,
    },
    payment_methods: {
      excluded_payment_types: [{ id: 'ticket' }],
    },
    statement_descriptor: 'RAIZESNORDESTE',
  }

  if (isPublicHttpsUrl(baseUrl)) {
    payload.auto_return = 'approved'
    payload.notification_url = `${baseUrl}/api/mercadopago/webhook`
  }

  const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok || !data?.init_point) {
    const msg =
      data?.message ||
      data?.cause?.[0]?.description ||
      'Erro ao criar preferência de pagamento no Mercado Pago'
    throw new Error(msg)
  }

  const urlPrincipal = isMercadoPagoTestMode()
    ? data.sandbox_init_point || data.init_point
    : data.init_point

  return {
    preferenceId: data.id,
    initPoint: urlPrincipal,
    sandboxInitPoint: data.sandbox_init_point || data.init_point,
  }
}

/**
 * Valida a assinatura HMAC-SHA256 do Webhook do Mercado Pago (quando MERCADOPAGO_WEBHOOK_SECRET está configurado)
 */
export function validarAssinaturaWebhook(params: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim()
  if (!secret) return true

  const { xSignature, xRequestId, dataId } = params
  if (!xSignature || !dataId) return false

  const parts = xSignature.split(',')
  let ts = ''
  let v1 = ''

  for (const part of parts) {
    const [key, value] = part.split('=')
    if (key?.trim() === 'ts') ts = value?.trim() || ''
    if (key?.trim() === 'v1') v1 = value?.trim() || ''
  }

  if (!ts || !v1) return false

  const manifest = `id:${dataId.toLowerCase()};${
    xRequestId ? `request-id:${xRequestId};` : ''
  }ts:${ts};`

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1))
  } catch {
    return false
  }
}
