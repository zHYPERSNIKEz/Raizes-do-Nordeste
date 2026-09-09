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

  // Cria o usuário e manda o nome como "metadado". 
  // O Gatilho (Trigger) no banco de dados vai ler esse nome e criar o Perfil automaticamente.
  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome: nome
      }
    }
  })

  if (authError) {
    return { error: 'Erro ao criar conta. Tente outro e-mail.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
