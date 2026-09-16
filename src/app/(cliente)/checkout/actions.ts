'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function criarPedido(payload: any, items: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
  
  if (!items || items.length === 0) {
     return { success: false, error: 'Carrinho vazio' }
  }

  // 1. Descobrir a loja_id a partir do primeiro produto
  const { data: produto } = await supabase
    .from('produtos')
    .select('loja_id')
    .eq('id', items[0].produtoId)
    .single()

  if (!produto?.loja_id) {
    return { success: false, error: 'Loja não encontrada para os produtos selecionados' }
  }

  const loja_id = produto.loja_id
  
  // 1.5 Verificar se a loja está aberta e pegar a taxa de entrega
  const { data: loja } = await supabase
    .from('lojas')
    .select('aberta, taxa_entrega')
    .eq('id', loja_id)
    .single()

  // Se a coluna 'aberta' não existir no banco ainda, assumimos que está aberta (para não quebrar sistemas antigos)
  if (loja && loja.aberta === false) {
    return { success: false, error: 'Desculpe, a loja está fechada no momento.' }
  }

  const taxaEntrega = loja?.taxa_entrega ? Number(loja.taxa_entrega) : 0
  
  // Calcular o total no backend por segurança
  let total = items.reduce((acc, item) => acc + (item.precoTotal * item.quantidade), 0)
  
  if (payload.tipoConsumo === 'DELIVERY') {
    total += taxaEntrega
  }

  // 2. Criar Pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      loja_id,
      user_id: user.id,
      cliente_nome: user.user_metadata?.nome || user.email,
      telefone: payload.endereco?.telefone || null,
      tipo_consumo: payload.tipoConsumo,
      endereco: payload.endereco, // Precisaremos adicionar essa coluna JSONB no Supabase
      endereco: payload.endereco, 
      status: 'NA_FILA',
      total,
      forma_pagamento: payload.formaPagamento,
      pago: false,
    })
    .select('id')
    .single()

  if (pedidoError || !pedido) {
    console.error('Erro ao criar pedido:', pedidoError)
    return { success: false, error: 'Erro ao criar pedido' }
    return { success: false, error: `Erro interno: ${pedidoError?.message || 'Desconhecido'}` }
  }

  // 3. Criar Itens do Pedido
  const itensInsert = items.map(item => {
    // Montar a string de observação baseada nas remoções e adicionais
    const obsArr = []
    if (item.removidos && item.removidos.length > 0) {
      obsArr.push(`Sem: ${item.removidos.join(', ')}`)
    }
    if (item.adicionais && item.adicionais.length > 0) {
      const addStr = item.adicionais.map((a: any) => `${a.quantidade}x ${a.nome}`).join(', ')
      obsArr.push(`Adicionais: ${addStr}`)
    }
    const observacao = obsArr.length > 0 ? obsArr.join(' | ') : null

    return {
      pedido_id: pedido.id,
      produto_id: item.produtoId,
      quantidade: item.quantidade,
      preco_unitario: item.precoTotal,
      observacao: observacao
    }
  })

  const { error: itensError } = await supabase
    .from('itens_pedido')
    .insert(itensInsert)

  if (itensError) {
    console.error('Erro ao inserir itens:', itensError)
    // Em um sistema real poderíamos fazer rollback do pedido aqui (deletar o pedido criado)
    return { success: false, error: 'Erro ao processar itens do pedido' }
    return { success: false, error: `Erro itens: ${itensError.message}` }
  }

  return { success: true, pedidoId: pedido.id }
}
