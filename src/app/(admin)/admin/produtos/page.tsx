import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Edit, EyeOff, Eye, Trash2 } from 'lucide-react'
import { ToggleAtivoButton, ExcluirProdutoButton } from '@/components/admin/ProdutoBotoes'

export default async function ProdutosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: perfil } = await supabase.from('perfis').select('cargo, permissoes').eq('id', user.id).single()
  const cargo = perfil?.cargo?.trim().toUpperCase()
  const permissoes = Array.isArray(perfil?.permissoes) ? perfil.permissoes : []

  if (cargo !== 'ADMIN' && cargo !== 'GERENTE' && !permissoes.includes('acesso_produtos')) {
    return <div className="p-8 text-center text-red-500">Acesso negado. Você não tem permissão para gerenciar o cardápio.</div>
  }

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
          <Button className="bg-brand text-white hover:bg-orange-600 gap-2">
            <Plus size={18} /> Novo Produto
          </Button>
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {produtos?.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                      {p.imagem_url ? (
                        <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Sem Img</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200">{p.nome}</td>
                  <td className="px-6 py-4 text-slate-400">{p.categoria}</td>
                  <td className="px-6 py-4 font-medium text-brand">R$ {Number(p.preco_base).toFixed(2).replace('.', ',')}</td>
                  <td className="px-6 py-4 text-center">
                    {p.ativo ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Eye size={12} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        <EyeOff size={12} /> Oculto
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <ToggleAtivoButton id={p.id} ativo={p.ativo} />
                      <Link href={`/admin/produtos/${p.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-slate-700 text-slate-400 hover:text-brand hover:border-brand">
                          <Edit size={14} />
                        </Button>
                      </Link>
                      <ExcluirProdutoButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!produtos || produtos.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum produto cadastrado na loja.
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

