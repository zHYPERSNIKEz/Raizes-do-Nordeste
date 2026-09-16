'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarStatusPedido(pedidoId: string, novoStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('pedidos')
    .update({ status: novoStatus })
    .eq('id', pedidoId)

  if (error) {
    console.error('Erro ao atualizar status:', error)
    return { success: false, error: 'Erro ao atualizar status' }
  }

  revalidatePath('/admin/pedidos')
  revalidatePath('/admin/cozinha')
  return { success: true }
}

export async function atualizarPagamentoPedido(pedidoId: string, pago: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('pedidos')
    .update({ pago: pago })
    .eq('id', pedidoId)

  if (error) {
    console.error('Erro ao atualizar pagamento:', error)
    return { success: false, error: 'Erro ao atualizar pagamento' }
  }

  revalidatePath('/admin/pedidos')
  return { success: true }
}
