const fs = require('fs');

let code = fs.readFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/app/(admin)/admin/produtos/actions.ts', 'utf8');

if (!code.includes('createSupabaseClient')) {
  code = code.replace(
    "import { createClient } from '@/lib/supabase/server'",
    "import { createClient } from '@/lib/supabase/server'\nimport { createClient as createSupabaseClient } from '@supabase/supabase-js'"
  );
}

code = code.replace(
  /export async function excluirProduto\(id: string\) \{\s*const supabase = await createClient\(\)\s*\/\/.+?await supabase\.from\('produto_complementos'\)\.delete\(\)\.eq\('produto_id', id\)\s*await supabase\.from\('itens_pedido'\)\.delete\(\)\.eq\('produto_id', id\)/s,
  `export async function excluirProduto(id: string) {
  const supabase = await createClient()
  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  // MODO TESTE: Apagar dependências primeiro (Bypass RLS)
  await supabaseAdmin.from('produto_complementos').delete().eq('produto_id', id)
  await supabaseAdmin.from('itens_pedido').delete().eq('produto_id', id)`
);

code = code.replace(
  /export async function excluirProdutosEmMassa\(ids: string\[\]\) \{\s*const supabase = await createClient\(\);\s*\/\/.+?await supabase\.from\('produto_complementos'\)\.delete\(\)\.in\('produto_id', ids\);\s*await supabase\.from\('itens_pedido'\)\.delete\(\)\.in\('produto_id', ids\);/s,
  `export async function excluirProdutosEmMassa(ids: string[]) {
  const supabase = await createClient();
  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  // MODO TESTE: Apagar dependências primeiro (Bypass RLS)
  await supabaseAdmin.from('produto_complementos').delete().in('produto_id', ids);
  await supabaseAdmin.from('itens_pedido').delete().in('produto_id', ids);`
);

fs.writeFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/app/(admin)/admin/produtos/actions.ts', code, 'utf8');

