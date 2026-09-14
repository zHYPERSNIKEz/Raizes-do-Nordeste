'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enviarPedidoCozinha(payload: any, items: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }
  
  if (!items || items.length === 0) return { success: false, error: 'Carrinho vazio' }

  // 1. Pega perfil do garçom para saber o nome
  const { data: perfil } = await supabase
    .from('perfis')
    .select('nome')
    .eq('id', user.id)
    .single()

  // Como é apenas uma loja, pega a primeira
  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  if (!loja) return { success: false, error: 'Loja não encontrada no sistema' }

  const total = items.reduce((acc, item) => acc + (item.precoTotal * item.quantidade), 0)

  // 2. Criar pedido na mesa
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      loja_id: loja.id,
      cliente_nome: `Mesa ${payload.mesa} (Garçom: ${perfil?.nome || 'Desconhecido'})`,
      tipo_consumo: 'LOCAL',
      mesa: payload.mesa,
      status: 'NA_FILA',
      total,
      pago: false, // Fica aguardando pagamento
    })
    .select('id')
    .single()

  if (pedidoError || !pedido) {
    return { success: false, error: 'Erro ao criar pedido' }
  }

  // 3. Inserir itens
  const itensInsert = items.map(item => {
    const obsArr = []
    if (item.removidos && item.removidos.length > 0) obsArr.push(`Sem: ${item.removidos.join(', ')}`)
    if (item.adicionais && item.adicionais.length > 0) {
      const addStr = item.adicionais.map((a: any) => `${a.quantidade}x ${a.nome}`).join(', ')
      obsArr.push(`Add: ${addStr}`)
    }

    return {
      pedido_id: pedido.id,
      produto_id: item.produtoId,
      quantidade: item.quantidade,
      preco_unitario: item.precoTotal,
      observacao: obsArr.length > 0 ? obsArr.join(' | ') : null
    }
  })

  const { error: itensError } = await supabase.from('itens_pedido').insert(itensInsert)

  if (itensError) return { success: false, error: 'Erro ao inserir itens' }

  revalidatePath('/garcom')
  return { success: true }
}

export async function fecharContaMesa(mesa: string, formaPagamento: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Não autenticado' }

  // Como é apenas uma loja, pega a primeira
  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  if (!loja) return { success: false, error: 'Loja não encontrada' }

  // Atualizar todos os pedidos dessa mesa (que não estão pagos) para pago = true
  const { error } = await supabase
    .from('pedidos')
    .update({ 
      pago: true, 
      forma_pagamento: formaPagamento,
      status: 'FINALIZADO' // Opcional: pode ser que queira manter o status de preparo, mas geralmente fechar a conta finaliza.
    })
    .eq('loja_id', loja.id)
    .eq('mesa', mesa)
    .eq('pago', false)

  if (error) return { success: false, error: 'Erro ao fechar conta' }

  revalidatePath('/garcom')
  return { success: true }
}
