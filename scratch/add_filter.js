const fs = require('fs');
let code = fs.readFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/ProdutosTableClient.tsx', 'utf8');

if (!code.includes('const [searchTerm, setSearchTerm]')) {
  // Add imports
  code = code.replace(
    /import \{ Eye, EyeOff, Edit, Link as LinkIcon, X \} from 'lucide-react'/,
    "import { Eye, EyeOff, Edit, Link as LinkIcon, X, Search, Filter } from 'lucide-react'"
  );

  // Add state and filters
  code = code.replace(
    /const \[isDeleting, setIsDeleting\] = useState\(false\)/,
    `const [isDeleting, setIsDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')

  const categoriasUnicas = Array.from(new Set(produtos.map(p => p.categoria).filter(Boolean))) as string[]

  const filteredProdutos = produtos.filter(p => {
    const matchSearch = p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = filterCategoria ? p.categoria === filterCategoria : true
    return matchSearch && matchCategoria
  })`
  );

  // Update toggleAll to use filteredProdutos
  code = code.replace(
    /setSelectedIds\(produtos\.map\(p => p\.id\)\)/,
    "setSelectedIds(filteredProdutos.map(p => p.id))"
  );
  
  // Fix checkbox toggle all state
  code = code.replace(
    /checked=\{selectedIds\.length === produtos\.length && produtos\.length > 0\}/,
    "checked={selectedIds.length === filteredProdutos.length && filteredProdutos.length > 0}"
  );

  // Update map loop to use filteredProdutos
  code = code.replace(
    /\{produtos\?\.map\(\(p\) => \{/,
    "{filteredProdutos?.map((p) => {"
  );

  // Update empty state text logic
  code = code.replace(
    /\{\(\!produtos \|\| produtos\.length === 0\) && \(/,
    "{(!filteredProdutos || filteredProdutos.length === 0) && ("
  );

  // Add the filter bar HTML
  const filterBarHtml = `
      {/* Barra de Busca e Filtro */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 items-center bg-slate-950/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none"
          >
            <option value="">Todas as Categorias</option>
            {categoriasUnicas.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">`;

  code = code.replace(
    /<div className="overflow-x-auto">/,
    filterBarHtml
  );

  fs.writeFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/ProdutosTableClient.tsx', code, 'utf8');
}

