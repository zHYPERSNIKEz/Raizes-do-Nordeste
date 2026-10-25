import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import {
  buscarPagamentoPorId,
  buscarPagamentosPorPedido,
  criarOuBuscarPagamentoPix,
  criarPreferenciaCheckoutPro,
  isMercadoPagoConfigured,
  isMercadoPagoTestMode,
} from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { pedidoId, metodo } = body as {
      pedidoId?: string
      metodo?: 'PIX' | 'CARTAO'
    }

    if (!pedidoId) {
      return NextResponse.json(
        { success: false, error: 'ID do pedido é obrigatório.' },
        { status: 400 }
      )
    }

    const adminClient = createServiceRoleClient()
    const { data: pedido, error: pedidoErr } = await adminClient
      .from('pedidos')
      .select(
        `
        id, numero_pedido, user_id, cliente_nome, total, forma_pagamento, pago, status,
        itens_pedido ( quantidade, preco_unitario, produto_id, produtos(nome) )
      `
      )
      .eq('id', pedidoId)
      .single()

    if (pedidoErr || !pedido) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado.' },
        { status: 404 }
      )
    }

    if (pedido.pago) {
      return NextResponse.json({
        success: true,
        configured: isMercadoPagoConfigured(),
        testMode: isMercadoPagoTestMode(),
        pago: true,
      })
    }

    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({
        success: false,
        configured: false,
        testMode: false,
        error:
          'Credenciais do Mercado Pago não configuradas. Adicione MERCADOPAGO_ACCESS_TOKEN no arquivo .env.local.',
      })
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || request.nextUrl.origin
    const metodoEscolhido =
      metodo || (pedido.forma_pagamento === 'PIX' ? 'PIX' : 'CARTAO')
    const numeroExibicao = pedido.numero_pedido || pedido.id.split('-')[0]

    if (metodoEscolhido === 'PIX') {
      const dadosPix = await criarOuBuscarPagamentoPix({
        pedidoId: pedido.id,
        valor: Number(pedido.total),
        descricao: `Pedido #${numeroExibicao} - Raízes do Nordeste`,
        clienteNome:
          pedido.cliente_nome || user.user_metadata?.nome || 'Cliente',
        clienteEmail: user.email || '',
        appUrl: origin,
      })

      if (dadosPix.status === 'approved') {
        await adminClient
          .from('pedidos')
          .update({ pago: true, forma_pagamento: 'PIX' })
          .eq('id', pedido.id)
      } else if (pedido.forma_pagamento !== 'PIX') {
        await adminClient
          .from('pedidos')
          .update({ forma_pagamento: 'PIX' })
          .eq('id', pedido.id)
      }

      return NextResponse.json({
        success: true,
        configured: true,
        testMode: isMercadoPagoTestMode(),
        tipo: 'PIX',
        pago: dadosPix.status === 'approved',
        pix: dadosPix,
      })
    }

    // Caso contrário: Checkout Pro (Cartão de Crédito / Débito)
    const itensPedido = Array.isArray(pedido.itens_pedido)
      ? pedido.itens_pedido
      : []

    const itensPreferencia = itensPedido.map((item: any, idx: number) => ({
      id: item.produto_id || `item-${idx + 1}`,
      title: item.produtos?.nome || `Item #${idx + 1}`,
      quantity: Number(item.quantidade) || 1,
      unit_price: Number(item.preco_unitario) || 0,
    }))

    const subtotalItens = itensPreferencia.reduce(
      (acc, i) => acc + i.unit_price * i.quantity,
      0
    )
    const taxaEntrega = Math.max(
      0,
      Number((Number(pedido.total) - subtotalItens).toFixed(2))
    )

    const itensFinais =
      itensPreferencia.length > 0
        ? itensPreferencia
        : [
            {
              id: pedido.id,
              title: `Pedido #${numeroExibicao} - Raízes do Nordeste`,
              quantity: 1,
              unit_price: Number(pedido.total),
            },
          ]

    const preferencia = await criarPreferenciaCheckoutPro({
      pedidoId: pedido.id,
      itens: itensFinais,
      taxaEntrega: itensPreferencia.length > 0 ? taxaEntrega : 0,
      clienteNome:
        pedido.cliente_nome || user.user_metadata?.nome || 'Cliente',
      clienteEmail: user.email || '',
      appUrl: origin,
    })

    return NextResponse.json({
      success: true,
      configured: true,
      testMode: isMercadoPagoTestMode(),
      tipo: 'CARTAO',
      preferenceId: preferencia.preferenceId,
      checkoutUrl: preferencia.initPoint,
      sandboxUrl: preferencia.sandboxInitPoint,
    })
  } catch (error: any) {
    console.error('Erro na rota /api/mercadopago/pagamento (POST):', error)
    return NextResponse.json(
      {
        success: false,
        configured: isMercadoPagoConfigured(),
        testMode: isMercadoPagoTestMode(),
        error: error?.message || 'Erro ao processar pagamento no Mercado Pago.',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const pedidoId = request.nextUrl.searchParams.get('pedidoId')
    const paymentId =
      request.nextUrl.searchParams.get('payment_id') ||
      request.nextUrl.searchParams.get('collection_id')

    if (!pedidoId) {
      return NextResponse.json(
        { success: false, error: 'pedidoId é obrigatório.' },
        { status: 400 }
      )
    }

    const adminClient = createServiceRoleClient()
    const { data: pedido, error } = await adminClient
      .from('pedidos')
      .select('id, pago, forma_pagamento, status')
      .eq('id', pedidoId)
      .single()

    if (error || !pedido) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado.' },
        { status: 404 }
      )
    }

    if (pedido.pago) {
      return NextResponse.json({
        success: true,
        pago: true,
        testMode: isMercadoPagoTestMode(),
        status: 'approved',
      })
    }

    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({
        success: true,
        configured: false,
        testMode: false,
        pago: false,
        status: 'unconfigured',
      })
    }

    // 1. Se veio payment_id no retorno do Checkout Pro, consulta diretamente
    if (paymentId && paymentId !== 'null') {
      const pagto = await buscarPagamentoPorId(paymentId)
      if (
        pagto &&
        pagto.external_reference === pedidoId &&
        pagto.status === 'approved'
      ) {
        const metodoDetectado =
          pagto.payment_method_id === 'pix'
            ? 'PIX'
            : pagto.payment_type_id === 'debit_card'
              ? 'CARTAO_DEBITO'
              : 'CARTAO_CREDITO'

        await adminClient
          .from('pedidos')
          .update({ pago: true, forma_pagamento: metodoDetectado })
          .eq('id', pedidoId)

        return NextResponse.json({
          success: true,
          pago: true,
          testMode: isMercadoPagoTestMode(),
          status: 'approved',
        })
      }
    }

    // 2. Consulta todos os pagamentos vinculados ao external_reference = pedidoId
    const pagamentos = await buscarPagamentosPorPedido(pedidoId)
    const aprovado = pagamentos.find((p) => p.status === 'approved')

    if (aprovado) {
      const metodoDetectado =
        aprovado.payment_method_id === 'pix'
          ? 'PIX'
          : aprovado.payment_type_id === 'debit_card'
            ? 'CARTAO_DEBITO'
            : 'CARTAO_CREDITO'

      await adminClient
        .from('pedidos')
        .update({ pago: true, forma_pagamento: metodoDetectado })
        .eq('id', pedidoId)

      return NextResponse.json({
        success: true,
        pago: true,
        testMode: isMercadoPagoTestMode(),
        status: 'approved',
      })
    }

    const ultimoStatus = pagamentos[0]?.status || 'pending'
    return NextResponse.json({
      success: true,
      pago: false,
      testMode: isMercadoPagoTestMode(),
      status: ultimoStatus,
    })
  } catch (error: any) {
    console.error('Erro na rota /api/mercadopago/pagamento (GET):', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erro ao verificar status do pagamento.',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH: Permite simular a aprovação do pagamento apenas quando em Ambiente de Teste (TEST-)
 */
export async function PATCH(request: NextRequest) {
  try {
    if (!isMercadoPagoTestMode()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Simulação permitida apenas com credenciais de teste (TEST-).',
        },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado.' },
        { status: 401 }
      )
    }

    const { pedidoId, metodo } = await request.json()
    if (!pedidoId) {
      return NextResponse.json(
        { success: false, error: 'pedidoId é obrigatório.' },
        { status: 400 }
      )
    }

    const adminClient = createServiceRoleClient()
    const { error } = await adminClient
      .from('pedidos')
      .update({
        pago: true,
        ...(metodo ? { forma_pagamento: metodo } : {}),
      })
      .eq('id', pedidoId)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, pago: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao simular aprovação.' },
      { status: 500 }
    )
  }
}
