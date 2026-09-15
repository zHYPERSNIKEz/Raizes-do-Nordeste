import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Edit, EyeOff, Eye, Trash2 } from 'lucide-react'
import { ToggleAtivoButton, ExcluirProdutoButton } from '@/components/admin/ProdutoBotoes'

export default async function ProdutosPage() {
  const supabase = await createClient()

  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('loja_id', loja?.id)
    .order('categoria', { ascending: true })
    .order('nome', { ascending: true })

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Gestão de Produtos</h1>
          <p className="text-slate-400 mt-1">Gerencie o seu cardápio, preços e adicionais.</p>
        </div>
        <Link href="/admin/produtos/novo">
          <Button className="bg-brand hover:bg-orange-600 text-white gap-2 font-bold">
            <Plus size={20} /> Novo Produto
          </Button>
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {produtos && produtos.length > 0 ? (
                produtos.map(produto => (
                  <tr key={produto.id} className={`hover:bg-slate-800/50 transition-colors ${!produto.ativo ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      {produto.imagem_url ? (
                        <img src={produto.imagem_url} className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700"></div>
                      )}
                      <div>
                        <p className="font-bold text-slate-100">{produto.nome}</p>
                        <p className="text-xs text-slate-500 max-w-[200px] truncate">{produto.descricao}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 px-2 py-1 rounded-md text-xs font-medium text-slate-300">
                        {produto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ToggleAtivoButton id={produto.id} ativo={produto.ativo} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/produtos/${produto.id}`}>
                        <Button variant="outline" size="sm" className="h-8 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <ExcluirProdutoButton id={produto.id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Nenhum produto cadastrado. Clique no botão acima para adicionar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
