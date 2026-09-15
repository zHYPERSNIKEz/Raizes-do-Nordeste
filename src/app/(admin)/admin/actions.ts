'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarStatusPedido(pedidoId: string, novoStatus: string) {
  const supabase = await createClient()

  // Como é single-tenant, não precisamos validar a loja, mas é bom validar admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  // Atualiza o status
  const { error } = await supabase
    .from('pedidos')
    .update({ status: novoStatus })
    .eq('id', pedidoId)

  if (error) {
    console.error('Erro ao atualizar pedido:', error)
    return { success: false, error: 'Erro ao atualizar pedido' }
  }

  // O Supabase Realtime vai propagar isso para os clientes conectados
  return { success: true }
}
