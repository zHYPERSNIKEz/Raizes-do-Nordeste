const fs = require('fs');

let code = fs.readFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/ProdutosTableClient.tsx', 'utf8');

if (!code.includes('excluirProdutosEmMassa')) {
  code = code.replace(
    "import { vincularGrupoEmMassa } from '@/app/(admin)/admin/produtos/actions'", 
    "import { vincularGrupoEmMassa, excluirProdutosEmMassa } from '@/app/(admin)/admin/produtos/actions'"
  );

  code = code.replace(
    "const [isLinking, setIsLinking] = useState(false)", 
    "const [isLinking, setIsLinking] = useState(false)\n  const [isDeleting, setIsDeleting] = useState(false)"
  );

  const handleDeleteCode = `
  const handleMassDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm('Tem certeza que deseja apagar ' + selectedIds.length + ' produto(s)? Esta ação não pode ser desfeita.')) return

    setIsDeleting(true)
    const res = await excluirProdutosEmMassa(selectedIds)
    if (res.success) {
      import('sonner').then(s => s.toast.success(selectedIds.length + ' produto(s) apagado(s) com sucesso!'))
      setSelectedIds([])
    } else {
      import('sonner').then(s => s.toast.error('Erro: ' + res.error))
    }
    setIsDeleting(false)
  }
`;

  code = code.replace(
    'return (\n    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">', 
    handleDeleteCode + '\n  return (\n    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">'
  );

  const btnHtml = `
            <Button size="sm" onClick={handleMassDelete} disabled={isDeleting} className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30 gap-2 transition-colors">
              <X size={14} /> {isDeleting ? 'Apagando...' : 'Apagar Selecionados'}
            </Button>
            <Button size="sm" onClick={openMassLinkModal}`;

  code = code.replace(
    '<Button size="sm" onClick={openMassLinkModal}', 
    btnHtml
  );

  fs.writeFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/ProdutosTableClient.tsx', code, 'utf8');
}

