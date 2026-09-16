'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarConfiguracoesLoja(formData: FormData) {
  const supabase = await createClient()

  // Verificacao de admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }
  const { data: perfil } = await supabase.from('perfis').select('cargo').eq('id', user.id).single()
  if (perfil?.cargo !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  const id = formData.get('id') as string
  const nome = formData.get('nome') as string
  const aberta = formData.get('aberta') === 'true'
  const taxa_entrega = parseFloat(formData.get('taxa_entrega') as string || '0')

  const { error } = await supabase
    .from('lojas')
    .update({ 
      nome, 
      aberta, 
      taxa_entrega 
    })
    .eq('id', id)

  if (error) {
    if (error.code === 'PGRST205' || error.message.includes('column')) {
      return { success: false, error: 'COLUNAS_FALTANDO' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/configuracoes')
  revalidatePath('/checkout')
  return { success: true }
}
