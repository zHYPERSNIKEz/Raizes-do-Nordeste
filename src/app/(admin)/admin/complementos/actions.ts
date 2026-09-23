'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarGrupoComplemento(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Não autorizado' }

    const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
    if (!loja) return { success: false, error: 'Loja não encontrada' }

    const id = formData.get('id') as string
    const nome = formData.get('nome') as string
    const obrigatorio = formData.get('obrigatorio') === 'true'
    const min_escolhas = parseInt(formData.get('min_escolhas') as string || '0')
    const max_escolhas = parseInt(formData.get('max_escolhas') as string || '1')

    let grupoId = id

    if (id) {
      // Update
      const { error } = await supabase
        .from('complemento_grupos')
        .update({ nome, obrigatorio, min_escolhas, max_escolhas })
        .eq('id', id)
        .eq('loja_id', loja.id)
      
      if (error) throw error
    } else {
      // Insert
      const { data, error } = await supabase
        .from('complemento_grupos')
        .insert({ loja_id: loja.id, nome, obrigatorio, min_escolhas, max_escolhas })
        .select()
        .single()
        
      if (error) throw error
      grupoId = data.id
    }

    revalidatePath('/admin/complementos')
    return { success: true, id: grupoId }
  } catch (error: any) {
    console.error('Erro ao salvar grupo:', error)
    return { success: false, error: error.message }
  }
}

export async function excluirGrupoComplemento(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('complemento_grupos').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/complementos')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function salvarItemComplemento(formData: FormData) {
  try {
    const supabase = await createClient()
    
    const id = formData.get('id') as string
    const grupo_id = formData.get('grupo_id') as string
    const nome = formData.get('nome') as string
    const preco = parseFloat((formData.get('preco') as string).replace(',', '.')) || 0

    if (id) {
      const { error } = await supabase
        .from('complemento_itens')
        .update({ nome, preco })
        .eq('id', id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('complemento_itens')
        .insert({ grupo_id, nome, preco })
      if (error) throw error
    }

    revalidatePath('/admin/complementos')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function excluirItemComplemento(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('complemento_itens').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/complementos')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

