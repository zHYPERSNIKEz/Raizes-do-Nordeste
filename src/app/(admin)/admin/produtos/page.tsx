import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProdutosTableClient } from '@/components/admin/ProdutosTableClient'

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

  const { data: todosGrupos } = await supabase
    .from('complemento_grupos')
    .select('*')
    .eq('loja_id', loja?.id)
    .order('criado_em', { ascending: true })

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Gestão de Produtos</h1>
          <p className="text-slate-400 mt-1">Gerencie o seu cardápio, preços e adicionais.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/complementos">
            <Button variant="secondary" className="bg-slate-800 text-slate-200 hover:bg-slate-700 gap-2 border border-slate-700">
              <span className="text-base">🧩</span> Grupos e Adicionais
            </Button>
          </Link>
          <Link href="/admin/produtos/novo">
            <Button className="bg-brand text-white hover:bg-orange-600 gap-2 shadow-lg shadow-brand/20">
              <Plus size={18} /> Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      <ProdutosTableClient produtos={produtos || []} todosGrupos={todosGrupos || []} />
    </main>
  )
}
