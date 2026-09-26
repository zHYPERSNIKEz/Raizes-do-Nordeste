const fs = require('fs');

let code = fs.readFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/app/(admin)/admin/produtos/actions.ts', 'utf8');

code = code.replace(
  /export async function excluirProduto\(id: string\) \{\s*const supabase = await createClient\(\)[\s\S]*?return \{ success: true \}\s*\}/,
  `export async function excluirProduto(id: string) {
  const supabase = await createClient()
  
  // MODO TESTE: Apagar dependências primeiro para forçar a exclusão
  await supabase.from('produto_complementos').delete().eq('produto_id', id)
  await supabase.from('itens_pedido').delete().eq('produto_id', id)
  
  const { error } = await supabase.from('produtos').delete().eq('id', id)
  
  if (error) {
    return { success: false, error: 'Erro ao excluir produto: ' + error.message }
  }

  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { success: true }
}`
);

code = code.replace(
  /export async function excluirProdutosEmMassa\(ids: string\[\]\) \{\s*const supabase = await createClient\(\);[\s\S]*?return \{ success: true \}\s*\}/,
  `export async function excluirProdutosEmMassa(ids: string[]) {
  const supabase = await createClient();
  
  // MODO TESTE: Apagar dependências primeiro para forçar a exclusão
  await supabase.from('produto_complementos').delete().in('produto_id', ids);
  await supabase.from('itens_pedido').delete().in('produto_id', ids);
  
  const { error } = await supabase.from('produtos').delete().in('id', ids);
  
  if (error) {
    return { success: false, error: 'Erro ao excluir produtos: ' + error.message }
  }

  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { success: true }
}`
);

fs.writeFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/app/(admin)/admin/produtos/actions.ts', code, 'utf8');

