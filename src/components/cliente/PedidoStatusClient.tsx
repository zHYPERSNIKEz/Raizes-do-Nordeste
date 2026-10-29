'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Check,
  Clock,
  ChefHat,
  MapPin,
  PackageCheck,
  Receipt,
  ChevronLeft,
  QrCode,
  Copy,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  FlaskConical,
  Lock,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const STATUS_STAGES = [
  { id: 'NA_FILA', label: 'Na Fila', icon: Clock },
  { id: 'PREPARANDO', label: 'Preparando', icon: ChefHat },
  { id: 'PRONTO', label: 'Pronto', icon: PackageCheck },
  { id: 'DESPACHADO', label: 'Saiu para Entrega', icon: MapPin },
  { id: 'FINALIZADO', label: 'Finalizado', icon: Check },
]

interface PixInfo {
  paymentId: number
  status: string
  qrCode: string
  qrCodeBase64: string
  ticketUrl?: string
  expirationDate?: string
  isSandboxFallback?: boolean
}

export function PedidoStatusClient({ pedidoInicial }: { pedidoInicial: any }) {
  const [pedido, setPedido] = useState(pedidoInicial)
  const supabase = createClient()

  const [abaPagamento, setAbaPagamento] = useState<'PIX' | 'CARTAO'>(
    pedidoInicial.forma_pagamento === 'PIX' ? 'PIX' : 'CARTAO'
  )
  const [pixData, setPixData] = useState<PixInfo | null>(null)
  const [loadingPix, setLoadingPix] = useState(false)
  const [loadingCartao, setLoadingCartao] = useState(false)
  const [verificandoPagto, setVerificandoPagto] = useState(false)
  const [simulandoPagto, setSimulandoPagto] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [mpConfigured, setMpConfigured] = useState(true)
  const [testMode, setTestMode] = useState(true)
  const [erroMp, setErroMp] = useState<string | null>(null)

  // Estados do formulário transparente de Cartão
  const [tipoCartao, setTipoCartao] = useState<'CREDITO' | 'DEBITO'>(
    pedidoInicial.forma_pagamento === 'CARTAO_DEBITO' ? 'DEBITO' : 'CREDITO'
  )
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState(pedidoInicial.cliente_nome || '')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardParcelas, setCardParcelas] = useState('1')

  const maskCardNumber = (val: string) => {
    const v = val.replace(/\D/g, '').slice(0, 16)
    return v.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const maskExpiry = (val: string) => {
    const v = val.replace(/\D/g, '').slice(0, 4)
    if (v.length <= 2) return v
    return `${v.slice(0, 2)}/${v.slice(2)}`
  }

  // Verifica status do pagamento na API do Mercado Pago
  const verificarStatusPagamento = useCallback(
    async (silencioso = true, paymentIdParam?: string | null) => {
      if (pedido.pago || pedido.status === 'CANCELADO') return
      if (!silencioso) setVerificandoPagto(true)

      try {
        const query = new URLSearchParams({ pedidoId: pedido.id })
        if (paymentIdParam) query.set('payment_id', paymentIdParam)

        const res = await fetch(`/api/mercadopago/pagamento?${query.toString()}`, {
          cache: 'no-store',
        })
        const data = await res.json()

        if (data?.configured === false) {
          setMpConfigured(false)
        }
        if (typeof data?.testMode === 'boolean') {
          setTestMode(data.testMode)
        }

        if (data?.pago) {
          setPedido((prev: any) => ({ ...prev, pago: true }))
          toast.success('Pagamento aprovado!', {
            description: 'Seu pedido já foi enviado para a cozinha.',
          })
        } else if (!silencioso) {
          toast.info('Pagamento ainda pendente', {
            description:
              'Assim que o banco compensar o pagamento, a tela atualizará automaticamente.',
          })
        }
      } catch {
        if (!silencioso) {
          toast.error('Não foi possível consultar o pagamento agora.')
        }
      } finally {
        if (!silencioso) setVerificandoPagto(false)
      }
    },
    [pedido.id, pedido.pago, pedido.status]
  )

  // Carrega ou gera o QR Code Pix
  const carregarPix = useCallback(async () => {
    if (pedido.pago || pedido.status === 'CANCELADO') return
    setLoadingPix(true)
    setErroMp(null)

    try {
      const res = await fetch('/api/mercadopago/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId: pedido.id, metodo: 'PIX' }),
      })
      const data = await res.json()

      if (typeof data?.testMode === 'boolean') {
        setTestMode(data.testMode)
      }

      if (data?.configured === false) {
        setMpConfigured(false)
        setErroMp(data.error)
        return
      }

      if (data?.pago) {
        setPedido((prev: any) => ({ ...prev, pago: true }))
        toast.success('Pagamento confirmado!')
        return
      }

      if (data?.success && data?.pix) {
        setPixData(data.pix)
      } else {
        setErroMp(data?.error || 'Erro ao gerar QR Code Pix.')
      }
    } catch {
      setErroMp('Erro de conexão ao gerar QR Code Pix.')
    } finally {
      setLoadingPix(false)
    }
  }, [pedido.id, pedido.pago, pedido.status])

  // Redireciona para o Checkout Pro (Cartão externo no Mercado Pago)
  const handlePagarComCartaoCheckoutPro = async () => {
    setLoadingCartao(true)
    setErroMp(null)
    try {
      const res = await fetch('/api/mercadopago/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId: pedido.id, metodo: 'CARTAO' }),
      })
      const data = await res.json()

      if (data?.configured === false) {
        setMpConfigured(false)
        setErroMp(data.error)
        return
      }

      if (data?.pago) {
        setPedido((prev: any) => ({ ...prev, pago: true }))
        toast.success('Pagamento já aprovado!')
        return
      }

      if (data?.success && data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setErroMp(data?.error || 'Erro ao abrir Checkout do Mercado Pago.')
      }
    } catch {
      setErroMp('Erro ao conectar com o Mercado Pago.')
    } finally {
      setLoadingCartao(false)
    }
  }

  // Processa formulário de cartão na própria tela
  const handleSubmeterCartaoNaTela = async (e: React.FormEvent) => {
    e.preventDefault()
    const numLimpo = cardNumber.replace(/\D/g, '')
    if (numLimpo.length < 13 || !cardName.trim() || cardExpiry.length < 5 || cardCvv.length < 3) {
      toast.error('Preencha todos os dados do cartão corretamente.')
      return
    }

    if (testMode) {
      await handleSimularAprovacaoTeste()
    } else {
      await handlePagarComCartaoCheckoutPro()
    }
  }

  // Simula aprovação quando em modo de teste (TEST-)
  const handleSimularAprovacaoTeste = async () => {
    setSimulandoPagto(true)
    try {
      const metodoFinal =
        abaPagamento === 'PIX'
          ? 'PIX'
          : tipoCartao === 'DEBITO'
            ? 'CARTAO_DEBITO'
            : 'CARTAO_CREDITO'

      const res = await fetch('/api/mercadopago/pagamento', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: pedido.id,
          metodo: metodoFinal,
        }),
      })
      const data = await res.json()
      if (data?.success && data?.pago) {
        setPedido((prev: any) => ({
          ...prev,
          pago: true,
          forma_pagamento: metodoFinal,
        }))
        toast.success('Pagamento Aprovado!', {
          description: 'Seu pedido foi enviado para a fila da cozinha em tempo real.',
        })
      } else {
        toast.error(data?.error || 'Não foi possível aprovar o pagamento.')
      }
    } catch {
      toast.error('Erro ao processar aprovação.')
    } finally {
      setSimulandoPagto(false)
    }
  }

  const handleCopiarPix = async () => {
    if (!pixData?.qrCode) return
    try {
      await navigator.clipboard.writeText(pixData.qrCode)
      setCopiado(true)
      toast.success('Código Pix copiado! Cole no aplicativo do seu banco.')
      setTimeout(() => setCopiado(false), 3000)
    } catch {
      toast.error('Não foi possível copiar automaticamente.')
    }
  }

  // Inscreve para ouvir alterações no Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`pedido-status-${pedido.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `id=eq.${pedido.id}`,
        },
        (payload) => {
          setPedido((prev: any) => {
            const atualizado = { ...prev, ...payload.new }
            if (!prev.pago && atualizado.pago) {
              toast.success('Pagamento aprovado!', {
                description: 'Seu pedido acabou de entrar na fila da cozinha.',
              })
            }
            return atualizado
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, pedido.id])

  // Ao abrir a tela: verifica parâmetros de retorno do Checkout Pro ou carrega o Pix
  useEffect(() => {
    if (pedido.pago || pedido.status === 'CANCELADO') return

    const params = new URLSearchParams(window.location.search)
    const paymentId = params.get('payment_id') || params.get('collection_id')
    const mpStatus = params.get('mp_status') || params.get('status')

    if (paymentId || mpStatus) {
      verificarStatusPagamento(false, paymentId)
    }

    if (abaPagamento === 'PIX' && !pixData) {
      carregarPix()
    }
  }, [
    abaPagamento,
    carregarPix,
    pedido.pago,
    pedido.status,
    pixData,
    verificarStatusPagamento,
  ])

  // Polling periódico a cada 5s enquanto aguarda o pagamento
  useEffect(() => {
    if (pedido.pago || pedido.status === 'CANCELADO' || !mpConfigured) return

    const interval = setInterval(() => {
      verificarStatusPagamento(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [pedido.pago, pedido.status, mpConfigured, verificarStatusPagamento])

  const visibleStages = STATUS_STAGES.filter(
    (stage) => !(pedido.tipo_consumo !== 'DELIVERY' && stage.id === 'DESPACHADO')
  )

  const visibleCurrentIndex = visibleStages.findIndex((s) => s.id === pedido.status)
  const safeCurrentIndex =
    pedido.status === 'FINALIZADO' || pedido.status === 'ENTREGUE'
      ? visibleStages.length - 1
      : visibleCurrentIndex

  return (
    <div className="bg-card text-card-foreground p-6 md:p-10 rounded-2xl shadow-sm border border-border">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-brand mb-6 transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        Voltar para Home
      </Link>

      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Pedido #{pedido.numero_pedido || pedido.id.split('-')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Realizado em{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
              .format(new Date(pedido.criado_em))
              .replace(',', ' às')}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${
            pedido.pago
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
          }`}
        >
          {pedido.pago ? (
            <>
              <CheckCircle2 size={16} /> PAGO
            </>
          ) : (
            <>
              <Clock size={16} /> AGUARDANDO PAGAMENTO
            </>
          )}
        </div>
      </div>

      {pedido.status === 'CANCELADO' ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl text-center mb-10">
          <h3 className="text-xl font-bold mb-2">Pedido Cancelado</h3>
          <p>
            Este pedido foi cancelado pela loja. Em caso de dúvidas, entre em contato
            conosco.
          </p>
        </div>
      ) : !pedido.pago ? (
        /* PAINEL DE PAGAMENTO MERCADO PAGO ENQUANTO NÃO ESTÁ PAGO */
        <div className="mb-10 bg-secondary/30 border-2 border-brand/30 rounded-2xl p-5 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3 py-1 rounded-full">
                  Mercado Pago
                </span>
                {testMode && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
                    <FlaskConical size={12} /> Ambiente de Teste
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Conclua o pagamento para enviarmos à cozinha
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Assim que o pagamento de{' '}
                <strong className="text-foreground">
                  R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                </strong>{' '}
                for aprovado, o preparo começa imediatamente.
              </p>
            </div>

            {/* Seletor para alternar entre Pix, Cartão de Crédito e Débito */}
            <div className="flex bg-muted p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setAbaPagamento('PIX')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  abaPagamento === 'PIX'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <QrCode size={14} /> Pix
              </button>
              <button
                type="button"
                onClick={() => {
                  setAbaPagamento('CARTAO')
                  setTipoCartao('CREDITO')
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  abaPagamento === 'CARTAO' && tipoCartao === 'CREDITO'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard size={14} /> Crédito
              </button>
              <button
                type="button"
                onClick={() => {
                  setAbaPagamento('CARTAO')
                  setTipoCartao('DEBITO')
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  abaPagamento === 'CARTAO' && tipoCartao === 'DEBITO'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard size={14} /> Débito
              </button>
            </div>
          </div>

          {erroMp && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold">Aviso no pagamento</p>
                <p className="mt-1">{erroMp}</p>
              </div>
            </div>
          )}

          {abaPagamento === 'PIX' ? (
            <div className="flex flex-col items-center text-center">
              {loadingPix ? (
                <div className="py-10 flex flex-col items-center gap-3">
                  <RefreshCw className="animate-spin text-brand" size={32} />
                  <p className="text-sm font-medium text-muted-foreground">
                    Gerando QR Code Pix no Mercado Pago...
                  </p>
                </div>
              ) : pixData ? (
                <div className="w-full max-w-md space-y-5">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mx-auto w-fit">
                    {pixData.qrCodeBase64 ? (
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code Pix Mercado Pago"
                        className="w-52 h-52 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-52 h-52 flex flex-col items-center justify-center text-slate-600 p-4">
                        <QrCode size={84} className="text-slate-800 mb-2" />
                        <span className="text-[11px] font-semibold text-slate-500">
                          QR Code Pix (Ambiente de Teste)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pix Copia e Cola
                    </p>
                    <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-2">
                      <input
                        type="text"
                        readOnly
                        value={pixData.qrCode}
                        className="w-full bg-transparent text-xs text-muted-foreground font-mono px-2 focus:outline-none truncate"
                      />
                      <Button
                        type="button"
                        onClick={handleCopiarPix}
                        className="shrink-0 bg-brand hover:bg-orange-700 text-white font-bold text-xs px-4"
                      >
                        {copiado ? (
                          <>
                            <Check size={14} className="mr-1.5" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="mr-1.5" /> Copiar Código
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => verificarStatusPagamento(false)}
                      disabled={verificandoPagto}
                      className="text-xs font-semibold"
                    >
                      <RefreshCw
                        size={14}
                        className={`mr-1.5 ${verificandoPagto ? 'animate-spin' : ''}`}
                      />
                      {verificandoPagto ? 'Verificando...' : 'Já paguei, verificar agora'}
                    </Button>

                    {testMode && (
                      <Button
                        type="button"
                        onClick={handleSimularAprovacaoTeste}
                        disabled={simulandoPagto}
                        className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <FlaskConical size={14} className="mr-1.5" />
                        {simulandoPagto
                          ? 'Aprovando...'
                          : 'Simular Pagamento Aprovado (Teste)'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <Button
                    type="button"
                    onClick={carregarPix}
                    disabled={loadingPix}
                    className="bg-brand hover:bg-orange-700 text-white font-bold px-6 h-12 rounded-xl"
                  >
                    <QrCode size={18} className="mr-2" />
                    Gerar QR Code Pix
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* ABA DE CARTÃO DE CRÉDITO / DÉBITO (FORMULÁRIO NA TELA + CHECKOUT PRO) */
            <div className="max-w-lg mx-auto">
              <form
                onSubmit={handleSubmeterCartaoNaTela}
                className="bg-background border border-border rounded-2xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={20} className="text-brand" />
                    <span className="font-bold text-sm text-foreground">
                      Dados do Cartão
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                    <Lock size={12} /> Criptografado
                  </span>
                </div>

                {/* Seletor entre Crédito e Débito */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Modalidade do Cartão
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border/50">
                    <button
                      type="button"
                      onClick={() => setTipoCartao('CREDITO')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                        tipoCartao === 'CREDITO'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Cartão de Crédito
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoCartao('DEBITO')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                        tipoCartao === 'DEBITO'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Cartão de Débito
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
                    className="w-full p-3 rounded-xl border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Nome impresso no cartão
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="COMO ESTÁ NO CARTÃO"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Validade (MM/AA)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="12/30"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(maskExpiry(e.target.value))}
                      className="w-full p-3 rounded-xl border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      CVV (Código de Segurança)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="123"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) =>
                        setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      className="w-full p-3 rounded-xl border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>

                {tipoCartao === 'CREDITO' ? (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Parcelamento
                    </label>
                    <select
                      value={cardParcelas}
                      onChange={(e) => setCardParcelas(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                      <option value="1">
                        1x de R$ {Number(pedido.total).toFixed(2).replace('.', ',')} (Sem
                        juros)
                      </option>
                      <option value="2">
                        2x de R$ {(Number(pedido.total) / 2).toFixed(2).replace('.', ',')}{' '}
                        (Sem juros)
                      </option>
                    </select>
                  </div>
                ) : (
                  <div className="p-3 bg-secondary/40 rounded-xl border border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Modalidade selecionada: <strong className="text-foreground">Débito à vista</strong></span>
                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Sem juros</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={simulandoPagto || loadingCartao}
                  className="w-full h-12 bg-brand hover:bg-orange-700 text-white font-bold rounded-xl text-base"
                >
                  {simulandoPagto || loadingCartao
                    ? 'Processando pagamento...'
                    : tipoCartao === 'DEBITO'
                      ? `Pagar R$ ${Number(pedido.total).toFixed(2).replace('.', ',')} no Débito`
                      : `Pagar R$ ${Number(pedido.total).toFixed(2).replace('.', ',')} no Crédito`}
                </Button>
              </form>

              {testMode && (
                <div className="flex justify-center mt-4">
                  <Button
                    type="button"
                    onClick={handleSimularAprovacaoTeste}
                    disabled={simulandoPagto}
                    className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <FlaskConical size={14} className="mr-1.5" />
                    {simulandoPagto
                      ? 'Aprovando...'
                      : 'Aprovar Teste Direto (1 Clique)'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* BARRA DE PROGRESSO DO PEDIDO (APÓS O PAGAMENTO SER APROVADO) */
        <div className="mb-12">
          <h3 className="text-lg font-bold text-foreground mb-6">Status do Pedido</h3>

          <div className="relative">
            {/* Barra de progresso base (fundo) */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-muted rounded-full" />

            {/* Barra de progresso preenchida */}
            <div
              className="absolute top-6 left-6 h-1 bg-brand rounded-full transition-all duration-500"
              style={{
                width: `calc(${
                  (Math.max(0, safeCurrentIndex) / (visibleStages.length - 1)) * 100
                }% - 3rem)`,
              }}
            />

            <div className="relative flex justify-between">
              {visibleStages.map((stage, idx) => {
                const isCompleted = idx <= safeCurrentIndex
                const isCurrent = idx === safeCurrentIndex
                const Icon = stage.icon

                return (
                  <div
                    key={stage.id}
                    className="flex flex-col items-center relative z-10 w-24"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm
                        ${
                          isCompleted
                            ? 'bg-brand border-card text-white'
                            : 'bg-card border-muted text-muted-foreground'
                        }
                        ${isCurrent ? 'ring-4 ring-brand/20 scale-110' : ''}
                      `}
                    >
                      <Icon size={20} />
                    </div>
                    <p
                      className={`mt-3 text-xs font-bold text-center ${
                        isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {stage.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t border-border pt-8">
        {/* Detalhes da Entrega */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            {pedido.tipo_consumo === 'DELIVERY' ? (
              <MapPin size={20} className="text-brand" />
            ) : (
              <Receipt size={20} className="text-brand" />
            )}
            {pedido.tipo_consumo === 'DELIVERY'
              ? 'Endereço de Entrega'
              : 'Detalhes do Pedido'}
          </h3>

          <div className="bg-secondary/40 p-4 rounded-xl border border-border">
            {pedido.tipo_consumo === 'DELIVERY' && pedido.endereco ? (
              <div className="text-muted-foreground text-sm leading-relaxed">
                <p className="font-semibold text-foreground mb-1">
                  {pedido.cliente_nome}
                </p>
                <p>
                  {pedido.endereco.rua}, {pedido.endereco.numero}
                </p>
                {pedido.endereco.complemento && <p>{pedido.endereco.complemento}</p>}
                <p>
                  {pedido.endereco.bairro}
                  {pedido.endereco.cidade ? ` - ${pedido.endereco.cidade}` : ''}
                </p>
                <p className="mt-2 text-muted-foreground">
                  Telefone: {pedido.telefone}
                </p>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                <p>
                  <span className="font-semibold text-foreground">Cliente:</span>{' '}
                  {pedido.cliente_nome}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-foreground">Tipo:</span>{' '}
                  {pedido.tipo_consumo === 'MESA' || pedido.tipo_consumo === 'LOCAL'
                    ? `Mesa ${pedido.mesa}`
                    : 'Retirada no Balcão'}
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-semibold text-foreground mb-1">
                Forma de Pagamento
              </p>
              <p className="text-muted-foreground text-sm uppercase">
                {pedido.forma_pagamento?.replace('_', ' ')} (Mercado Pago)
              </p>
            </div>
          </div>
        </div>

        {/* Resumo dos Itens */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Resumo do Pedido</h3>

          <div className="space-y-4 mb-6">
            {pedido.itens_pedido?.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden relative shrink-0">
                  {item.produtos?.imagem_url ? (
                    <img
                      src={item.produtos.imagem_url}
                      alt={item.produtos.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <PackageCheck size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-sm">
                    {item.quantidade}x {item.produtos?.nome}
                  </h4>
                  {item.observacao && (
                    <p className="text-xs text-brand mt-1">{item.observacao}</p>
                  )}
                  <p className="text-sm font-bold text-muted-foreground mt-1">
                    R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-secondary/40 rounded-xl border border-border">
            <span className="font-bold text-muted-foreground">Total</span>
            <span className="text-2xl font-display font-bold text-brand">
              R$ {Number(pedido.total).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
