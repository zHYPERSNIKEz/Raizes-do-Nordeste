'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'E-mail ou senha incorretos.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const aceitouLgpd = formData.get('aceitou_lgpd') === 'true'

  if (!aceitouLgpd) {
    return { error: 'É necessário aceitar a Política de Privacidade (LGPD) para criar a conta.' }
  }

  // Cria o usuário e manda o nome e o registro de consentimento LGPD como "metadado". 
  // O Gatilho (Trigger) no banco de dados vai ler esse nome e criar o Perfil automaticamente.
  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome: nome,
        lgpd_consentimento: true,
        lgpd_consentimento_em: new Date().toISOString(),
      }
    }
  })

  if (authError) {
    return { error: 'Erro ao criar conta. Tente outro e-mail.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
