'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function criarFuncionario(formData: FormData) {
  const supabase = await createClient()

  // Precisamos usar a Service Role Key para contornar o RLS e criar o usuǭrio diretamente no Auth
  const supabaseAdmin = await createClient() // O createClient do servidor jǭ injeta cookies da sessǜo
  
  // Mas para usar admin auth precisamos passar a SERVICE_ROLE_KEY explicitamente
  const supabaseService = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nome = formData.get('nome') as string
  const cargo = formData.get('cargo') as string

  // Cria o usuário no Supabase Auth
  const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nome,
      full_name: nome,
      display_name: nome,
      name: nome,
      cargo
    }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  // Insere o perfil
  if (authData.user) {
    const { error: profileError } = await supabaseService
      .from('perfis')
      .upsert({
        id: authData.user.id,
        nome,
        cargo,
        permissoes: [] // Array inicial vazio
      })

    if (profileError) {
      // Tenta apagar o usuǭrio auth caso falhe a criaǜo do perfil
      await supabaseService.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: profileError.message }
    }
  }

  revalidatePath('/admin/equipe')
  return { success: true }
}

export async function excluirUsuario(userId: string) {
  const supabaseService = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Apaga do Auth (que vai cascatear e apagar o perfil pelo trigger ou ON DELETE CASCADE)
  const { error } = await supabaseService.auth.admin.deleteUser(userId)
  
  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/equipe')
  return { success: true }
}

export async function atualizarCargoUsuario(userId: string, novoCargo: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('perfis')
    .update({ cargo: novoCargo })
    .eq('id', userId)
    
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/equipe')
  return { success: true }
}

export async function atualizarPermissoesUsuario(userId: string, permissoes: string[]) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('perfis')
    .update({ permissoes })
    .eq('id', userId)
    
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/equipe')
  return { success: true }
}




export async function buscarDadosUsuarioAuth(userId: string) {
  const supabaseService = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await supabaseService.auth.admin.getUserById(userId)
  if (error) return { success: false, error: error.message }
  return { success: true, email: data.user.email }
}

export async function atualizarFuncionario(userId: string, dados: { nome: string, telefone: string, email: string, senha?: string }) {
  const supabaseService = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Atualizar no Auth (Email e Senha se fornecida)
  const authUpdates: any = {
    email: dados.email,
    email_confirm: true,
    user_metadata: { nome: dados.nome }
  }
  if (dados.senha && dados.senha.trim().length >= 6) {
    authUpdates.password = dados.senha
  }

  const { error: authError } = await supabaseService.auth.admin.updateUserById(userId, authUpdates)
  if (authError) return { success: false, error: authError.message }

  // 2. Atualizar no Perfil (Nome e Telefone)
  const { error: profileError } = await supabaseService
    .from('perfis')
    .update({ nome: dados.nome, telefone: dados.telefone })
    .eq('id', userId)

  if (profileError) return { success: false, error: profileError.message }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/admin/equipe')
  return { success: true }
}
