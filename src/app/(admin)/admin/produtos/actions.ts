'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function salvarProduto(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const id = formData.get('id') as string
  const nome = formData.get('nome') as string
  const descricao = formData.get('descricao') as string
  const preco = parseFloat(formData.get('preco') as string)
  const categoria = formData.get('categoria') as string
  const imagem_url = formData.get('imagem_url') as string
  const ativo = formData.get('ativo') === 'true'
  
  // JSON strings vindo de campos hidden
  const ingredientes_base = JSON.parse((formData.get('ingredientes_base') as string) || '[]')
  const adicionais = JSON.parse((formData.get('adicionais') as string) || '[]')
  const gruposVinculados = JSON.parse((formData.get('grupos_vinculados') as string) || '[]')

  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  if (!loja) return { success: false, error: 'Loja não encontrada' }

  const payload = {
    nome,
    descricao,
    preco,
    categoria,
    imagem_url,
    ativo,
    ingredientes_base,
    adicionais,
    loja_id: loja.id
  }

  let produtoId = id

  if (id) {
    // Update
    const { error } = await supabase.from('produtos').update(payload).eq('id', id)
    if (error) return { success: false, error: 'Erro ao atualizar produto' }
  } else {
    // Insert
    const { data, error } = await supabase.from('produtos').insert(payload).select('id').single()
    if (error) return { success: false, error: 'Erro ao criar produto' }
    produtoId = data.id
  }

  // Atualizar vínculos de complementos
  if (produtoId) {
    await supabase.from('produto_complementos').delete().eq('produto_id', produtoId)
    if (gruposVinculados.length > 0) {
      const vinculos = gruposVinculados.map((grupo_id: string) => ({
        produto_id: produtoId,
        grupo_id
      }))
      await supabase.from('produto_complementos').insert(vinculos)
    }
  }

  revalidatePath('/admin/produtos')
  revalidatePath('/') // atualiza vitrine
  redirect('/admin/produtos')
}

export async function toggleAtivo(id: string, ativoAtual: boolean) {
  const supabase = await createClient()
  await supabase.from('produtos').update({ ativo: !ativoAtual }).eq('id', id)
  revalidatePath('/admin/produtos')
  revalidatePath('/')
}

export async function excluirProduto(id: string) {
  const supabase = await createClient()
  
  // Dependendo do banco (ON DELETE RESTRICT), pode dar erro se tiver pedido com esse produto
  // O ideal seria apenas desativar, mas se não tiver venda, pode excluir
  const { error } = await supabase.from('produtos').delete().eq('id', id)
  
  if (error) {
    if (error.code === '23503') {
      return { success: false, error: 'Este produto já foi vendido. Em vez de excluir, apenas desative-o.' }
    }
    return { success: false, error: 'Erro ao excluir produto' }
  }

  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { success: true }
}

export async function vincularGrupoEmMassa(produtoIds: string[], grupoId: string) {
  const supabase = await createClient();
  const vinculos = produtoIds.map(pid => ({ produto_id: pid, grupo_id: grupoId }));
  const { error } = await supabase.from('produto_complementos').upsert(vinculos, { onConflict: 'produto_id,grupo_id' });
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/produtos');
  return { success: true };
}
