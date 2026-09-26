const fs = require('fs');

// 1. Update ProdutoForm.tsx
let formCode = fs.readFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/ProdutoForm.tsx', 'utf8');

// Add prop
formCode = formCode.replace(
  /export function ProdutoForm\(\{ \s*produto, \s*todosGrupos = \[\], \s*gruposVinculadosIniciais = \[\] \}: \{ \s*produto\?: any, \s*todosGrupos\?: any\[\], \s*gruposVinculadosIniciais\?: string\[\] \}\) \{/,
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

// Create merged categories array at top of component
const catsLogic = `
  // Merged standard categories + existing categories from DB
  const standardCategorias = ['Artesanais', 'Smash', 'Bebidas', 'Porções', 'Sobremesas'];
  const allCategorias = Array.from(new Set([...standardCategorias, ...(categoriasExistentes || [])]));
`;

formCode = formCode.replace(
  /const \[imagemUrl, setImagemUrl\] = useState<string>\(produto\?\.imagem_url \|\| ''\)/,
  `const [imagemUrl, setImagemUrl] = useState<string>(produto?.imagem_url || '')\n` + catsLogic
);

// Replace select with input + datalist
const inputHtml = `
              <input 
                name="categoria" 
                list="categorias-list"
                defaultValue={produto?.categoria || ''}
                placeholder="Ex: Artesanais, Smash..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand"
              />
              <datalist id="categorias-list">
                {allCategorias.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
`;

formCode = formCode.replace(
  /<select \s*name="categoria" \s*defaultValue=\{produto\?\.categoria \|\| 'Artesanais'\}\s*className="[^"]+"\s*>[\s\S]*?<\/select>/,
  inputHtml
);

fs.writeFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/ProdutoForm.tsx', formCode, 'utf8');

