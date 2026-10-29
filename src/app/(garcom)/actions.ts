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

  // 1. Pega perfil do garçom para saber o nome e validar o cargo
  const { data: perfil } = await supabase
    .from('perfis')
    .select('nome, cargo')
    .eq('id', user.id)
    .single()

  const cargo = perfil?.cargo?.trim().toUpperCase()
  if (cargo !== 'GARCOM' && cargo !== 'ADMIN' && cargo !== 'GERENTE') {
    return { success: false, error: 'Sem permissão para lançar pedidos de salão' }
  }

  // Como é apenas uma loja, pega a primeira
  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  if (!loja) return { success: false, error: 'Loja não encontrada no sistema' }

  const total = items.reduce((acc, item) => acc + (item.precoTotal * item.quantidade), 0)

  // 2. Criar pedido na mesa
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      loja_id: loja.id,
      user_id: user.id, // OBRIGATÓRIO no banco
      cliente_nome: `Mesa ${payload.mesa} (Garçom: ${perfil?.nome || 'Desconhecido'})`,
      tipo_consumo: 'LOCAL',
      mesa: payload.mesa,
      status: 'NA_FILA',
      total,
      pago: false,
    })
    .select('id')
    .single()

  if (pedidoError || !pedido) {
    console.error('Erro ao criar pedido garçom:', pedidoError)
    return { success: false, error: `Erro banco: ${pedidoError?.message}` }
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

  if (itensError) {
    console.error('Erro ao inserir itens garçom:', itensError)
    return { success: false, error: `Erro itens: ${itensError.message}` }
  }

  revalidatePath('/garcom')
  return { success: true }
}

export async function fecharContaMesa(mesa: string, formaPagamento: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Não autenticado' }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single()

  const cargo = perfil?.cargo?.trim().toUpperCase()
  if (cargo !== 'GARCOM' && cargo !== 'ADMIN' && cargo !== 'GERENTE') {
    return { success: false, error: 'Sem permissão para fechar conta de mesa' }
  }

  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  if (!loja) return { success: false, error: 'Loja não encontrada' }

  const { error } = await supabase
    .from('pedidos')
    .update({ 
      pago: true, 
      forma_pagamento: formaPagamento,
      status: 'FINALIZADO'
    })
    .eq('loja_id', loja.id)
    .eq('mesa', mesa)
    .eq('pago', false)

  if (error) return { success: false, error: 'Erro ao fechar conta' }

  revalidatePath('/garcom')
  return { success: true }
}
