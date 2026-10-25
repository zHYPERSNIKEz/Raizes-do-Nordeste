import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import {
  buscarPagamentoPorId,
  isMercadoPagoConfigured,
  validarAssinaturaWebhook,
} from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        { received: true, warning: 'MERCADOPAGO_ACCESS_TOKEN não configurado' },
        { status: 200 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const type =
      body?.type ||
      searchParams.get('type') ||
      searchParams.get('topic') ||
      body?.topic

    const dataId =
      body?.data?.id?.toString() ||
      searchParams.get('data.id') ||
      searchParams.get('id') ||
      body?.id?.toString()

    // Ignora notificações que não são de pagamento (ex: merchant_order)
    if (type !== 'payment' && !body?.action?.startsWith('payment.')) {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 })
    }

    if (!dataId) {
      return NextResponse.json(
        { received: true, error: 'Sem ID de pagamento na notificação' },
        { status: 200 }
      )
    }

    // Valida a assinatura HMAC-SHA256 se MERCADOPAGO_WEBHOOK_SECRET estiver configurado
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')
    const assinaturaValida = validarAssinaturaWebhook({
      xSignature,
      xRequestId,
      dataId,
    })

    if (!assinaturaValida) {
      console.warn('Webhook Mercado Pago rejeitado: assinatura inválida.')
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      )
    }

    // Busca os dados reais do pagamento diretamente na API do Mercado Pago
    const pagamento = await buscarPagamentoPorId(dataId)
    if (!pagamento) {
      return NextResponse.json(
        { received: true, warning: 'Pagamento não encontrado na API do MP' },
        { status: 200 }
      )
    }

    const pedidoId = pagamento.external_reference
    if (!pedidoId) {
      return NextResponse.json(
        { received: true, warning: 'Pagamento sem external_reference' },
        { status: 200 }
      )
    }

    if (pagamento.status === 'approved') {
      const metodoDetectado =
        pagamento.payment_method_id === 'pix'
          ? 'PIX'
          : pagamento.payment_type_id === 'debit_card'
            ? 'CARTAO_DEBITO'
            : 'CARTAO_CREDITO'

      const adminClient = createServiceRoleClient()
      const { error } = await adminClient
        .from('pedidos')
        .update({
          pago: true,
          forma_pagamento: metodoDetectado,
        })
        .eq('id', pedidoId)

      if (error) {
        console.error(
          `Erro ao atualizar pedido ${pedidoId} via Webhook Mercado Pago:`,
          error
        )
        return NextResponse.json(
          { error: 'Erro ao atualizar banco' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ received: true, status: pagamento.status }, { status: 200 })
  } catch (error: any) {
    console.error('Erro no Webhook do Mercado Pago:', error)
    return NextResponse.json(
      { error: 'Erro interno no processamento do webhook' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    webhook: 'Mercado Pago Webhook - Raízes do Nordeste',
  })
}

