const fs = require('fs');

// 1. Update [id]/page.tsx
let editPagePath = 'C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/app/(admin)/admin/produtos/[id]/page.tsx';
let editPage = fs.readFileSync(editPagePath, 'utf8');

if (!editPage.includes('categoriasExistentes')) {
  editPage = editPage.replace(
    /const gruposVinculadosIds = vinculados\?\.map\(v => v\.grupo_id\) \|\| \[\]/,
    `const gruposVinculadosIds = vinculados?.map(v => v.grupo_id) || []\n\n  const { data: categorias } = await supabase.from('produtos').select('categoria').eq('loja_id', produto.loja_id)\n  const categoriasExistentes = Array.from(new Set(categorias?.map(c => c.categoria).filter(Boolean))) as string[]`
  );
  editPage = editPage.replace(
    /gruposVinculadosIniciais=\{gruposVinculadosIds\} \s*\/>/,
    `gruposVinculadosIniciais={gruposVinculadosIds}\n        categoriasExistentes={categoriasExistentes}\n      />`
  );
  fs.writeFileSync(editPagePath, editPage, 'utf8');
}

// 2. Update novo/page.tsx
let novoPagePath = 'C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/app/(admin)/admin/produtos/novo/page.tsx';
let novoPage = fs.readFileSync(novoPagePath, 'utf8');

if (!novoPage.includes('categoriasExistentes')) {
  novoPage = novoPage.replace(
    /const \{ data: todosGrupos \} = await supabase\s*\.from\('complemento_grupos'\)\s*\.select\('\*'\)\s*\.eq\('loja_id', loja\?\.id\)\s*\.order\('criado_em', \{ ascending: true \}\)/,
    `const { data: todosGrupos } = await supabase\n    .from('complemento_grupos')\n    .select('*')\n    .eq('loja_id', loja?.id)\n    .order('criado_em', { ascending: true })\n\n  const { data: categorias } = await supabase.from('produtos').select('categoria').eq('loja_id', loja?.id)\n  const categoriasExistentes = Array.from(new Set(categorias?.map(c => c.categoria).filter(Boolean))) as string[]`
  );
  novoPage = novoPage.replace(
    /gruposVinculadosIniciais=\{\[\]\} \/>/,
    `gruposVinculadosIniciais={[]}\n        categoriasExistentes={categoriasExistentes}\n      />`
  );
  fs.writeFileSync(novoPagePath, novoPage, 'utf8');
}

