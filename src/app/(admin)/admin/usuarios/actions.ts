'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarCargoUsuario(userId: string, novoCargo: string) {
  const supabase = await createClient()

  // Precisamos verificar se o usuário atual é admin antes de deixar ele alterar cargos
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, error: 'Não autorizado' }
  
  const { data: adminCheck } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', currentUser.id)
    .single()
    
  if (adminCheck?.cargo !== 'ADMIN') {
    return { success: false, error: 'Apenas administradores podem alterar cargos' }
  }

  // Se tudo OK, atualiza o cargo do alvo
  const { error } = await supabase
    .from('perfis')
    .update({ cargo: novoCargo })
    .eq('id', userId)

  if (error) {
    console.error('Erro ao atualizar cargo:', error)
    return { success: false, error: 'Erro ao atualizar cargo' }
  }

  revalidatePath('/admin/usuarios')
  return { success: true }
}
