import { createClient } from '@/lib/supabase/server'
import { ProdutoForm } from '@/components/admin/ProdutoForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NovoProdutoPage() {
  const supabase = await createClient()
  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  
  const { data: todosGrupos } = await supabase
    .from('complemento_grupos')
    .select('*')
    .eq('loja_id', loja?.id)
    .order('criado_em', { ascending: true })

  const { data: categorias } = await supabase.from('produtos').select('categoria').eq('loja_id', loja?.id)
  const categoriasExistentes = Array.from(new Set(categorias?.map(c => c.categoria).filter(Boolean))) as string[]

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/produtos" className="p-2 bg-slate-900 rounded-full border border-slate-800 hover:bg-slate-800 text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Novo Produto</h1>
          <p className="text-slate-400 mt-1">Preencha os dados do novo item do cardápio.</p>
        </div>
      </div>
      
      <ProdutoForm todosGrupos={todosGrupos || []} gruposVinculadosIniciais={[]}
        categoriasExistentes={categoriasExistentes}
      />
    </main>
  )
}
