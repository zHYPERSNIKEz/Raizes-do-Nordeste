'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function abrirCaixa(lojaId: string, valorAbertura: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autorizado' }

  const { error } = await supabase
    .from('caixas')
    .insert({
      loja_id: lojaId,
      usuario_id: user.id,
      status: 'ABERTO',
      valor_abertura: valorAbertura
    })

  if (error) {
    if (error.code === '42P01') {
      return { success: false, error: 'TABELA_INEXISTENTE' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/caixa')
  return { success: true }
}

export async function fecharCaixa(caixaId: string, valorSistema: number, valorReal: number, observacoes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('caixas')
    .update({
      status: 'FECHADO',
      valor_fechamento_sistema: valorSistema,
      valor_fechamento_real: valorReal,
      fechado_em: new Date().toISOString(),
      observacoes: observacoes
    })
    .eq('id', caixaId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/caixa')
  return { success: true }
}

export async function registrarMovimentacao(caixaId: string, tipo: 'SANGRIA' | 'SUPRIMENTO', valor: number, descricao: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('movimentacoes_caixa')
    .insert({
      caixa_id: caixaId,
      tipo,
      valor,
      descricao
    })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/caixa')
  return { success: true }
}
