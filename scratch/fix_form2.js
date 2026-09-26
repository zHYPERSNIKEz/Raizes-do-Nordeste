const fs = require('fs');
let code = fs.readFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/ProdutoForm.tsx', 'utf8');

code = code.replace(
  /export function ProdutoForm\(\{ \s*produto, \s*todosGrupos = \[\], \s*gruposVinculadosIniciais = \[\] \s*\}: \{ \s*produto\?: any, \s*todosGrupos\?: any\[\], \s*gruposVinculadosIniciais\?: string\[\] \s*\}\) \{/g,
  `export function ProdutoForm({ 
  produto, 
  todosGrupos = [], 
  gruposVinculadosIniciais = [],
  categoriasExistentes = []
}: { 
  produto?: any, 
  todosGrupos?: any[], 
  gruposVinculadosIniciais?: string[],
  categoriasExistentes?: string[]
}) {`
);

code = code.replace(
  /const \[ingredientes, setIngredientes\] = useState<string\[\]>\(produto\?\.ingredientes_base \|\| \[\]\)/,
  `  // Merged standard categories + existing categories from DB
  const standardCategorias = ['Artesanais', 'Smash', 'Bebidas', 'Porções', 'Sobremesas'];
  const allCategorias = Array.from(new Set([...standardCategorias, ...(categoriasExistentes || [])]));

  const [ingredientes, setIngredientes] = useState<string[]>(produto?.ingredientes_base || [])`
);

fs.writeFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/ProdutoForm.tsx', code, 'utf8');

