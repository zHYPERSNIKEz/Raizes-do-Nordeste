'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarPerfil(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Usuário não autenticado' }

  const telefone = formData.get('telefone') as string
  const rua = formData.get('rua') as string
  const numero = formData.get('numero') as string
  const bairro = formData.get('bairro') as string
  const complemento = formData.get('complemento') as string

  const endereco_principal = { rua, numero, bairro, complemento }
  const novaSenha = formData.get('novaSenha') as string

  // Atualiza senha se preenchida
  if (novaSenha && novaSenha.trim().length >= 6) {
    const { error: authError } = await supabase.auth.updateUser({
      password: novaSenha
    })
    if (authError) return { error: 'Erro ao atualizar a senha.' }
  }

  const { error } = await supabase
    .from('perfis')
    .update({ 
      telefone, 
      endereco_principal 
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'Erro ao salvar os dados.' }
  }

  revalidatePath('/perfil')
  return { success: true }
}

export async function adicionarEndereco(novoEndereco: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Busca endereços atuais
  const { data: perfil } = await supabase.from('perfis').select('enderecos_salvos').eq('id', user.id).single()
  const enderecosAtuais = perfil?.enderecos_salvos || []
  
  const novosEnderecos = [...enderecosAtuais, novoEndereco]

  const { error } = await supabase.from('perfis').update({ enderecos_salvos: novosEnderecos }).eq('id', user.id)
  
  if (error) return { error: 'Erro ao salvar.' }
  revalidatePath('/perfil')
  return { success: true }
}

export async function removerEndereco(idEndereco: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: perfil } = await supabase.from('perfis').select('enderecos_salvos').eq('id', user.id).single()
  const enderecosAtuais = perfil?.enderecos_salvos || []
  
  const novosEnderecos = enderecosAtuais.filter((e: any) => e.id !== idEndereco)

  const { error } = await supabase.from('perfis').update({ enderecos_salvos: novosEnderecos }).eq('id', user.id)
  
  if (error) return { error: 'Erro ao remover.' }
  revalidatePath('/perfil')
  return { success: true }
}
