'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function atualizarCargoUsuario(userId: string, novoCargo: string) {
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, error: 'Não autorizado' }
  
  const { data: adminCheck } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', currentUser.id)
    .single()
    
  if (adminCheck?.cargo?.trim().toUpperCase() !== 'ADMIN') {
    return { success: false, error: 'Apenas administradores podem alterar cargos' }
  }

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

export async function criarFuncionario(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nome = formData.get('nome') as string
  const cargo = formData.get('cargo') as string

  if (!email || !password || !nome || !cargo) {
    return { success: false, error: 'Preencha todos os campos obrigatórios' }
  }

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  if (!currentUser) return { success: false, error: 'Não autorizado' }

  const { data: adminCheck } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', currentUser.id)
    .single()
    
  if (adminCheck?.cargo?.trim().toUpperCase() !== 'ADMIN') {
    return { success: false, error: 'Apenas administradores podem criar usuários' }
  }

  try {
    const adminAuthClient = createServiceRoleClient()
    
    // 1. Cria na tabela de autenticação
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome }
    })

    if (authError || !authData.user) {
      console.error('Erro ao criar user no Auth:', authError)
      return { success: false, error: `Erro ao criar: ${authError?.message || 'Desconhecido'}` }
    }

    // 2. Aguarda um milissegundo para garantir que o trigger do Supabase já inseriu a linha padrão
    await new Promise(resolve => setTimeout(resolve, 500))

    // 3. Atualiza explicitamente a linha já criada pelo trigger
    const { error: profileError } = await adminAuthClient
      .from('perfis')
      .update({ 
        nome: nome, 
        cargo: cargo 
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Erro ao atualizar cargo do novo user:', profileError)
      return { success: false, error: 'Usuário criado, mas erro ao definir cargo automático. Você pode alterar manualmente na lista.' }
    }

    revalidatePath('/admin/usuarios')
    return { success: true }

  } catch (err: any) {
    console.error('Erro geral ao criar funcionario:', err)
    return { success: false, error: err.message || 'Erro inesperado' }
  }
}
