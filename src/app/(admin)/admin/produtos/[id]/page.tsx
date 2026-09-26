import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProdutoForm } from '@/components/admin/ProdutoForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: produto } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single()

  if (!produto) notFound()

  // Buscar todos os grupos criados pela loja
  const { data: todosGrupos } = await supabase
    .from('complemento_grupos')
    .select('*')
    .eq('loja_id', produto.loja_id)
    .order('criado_em', { ascending: true })

  // Buscar quais grupos já estão vinculados a este produto
  const { data: vinculados } = await supabase
    .from('produto_complementos')
    .select('grupo_id')
    .eq('produto_id', id)
    
  const gruposVinculadosIds = vinculados?.map(v => v.grupo_id) || []

  const { data: categorias } = await supabase.from('produtos').select('categoria').eq('loja_id', produto.loja_id)
  const categoriasExistentes = Array.from(new Set(categorias?.map(c => c.categoria).filter(Boolean))) as string[]

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/produtos" className="p-2 bg-slate-900 rounded-full border border-slate-800 hover:bg-slate-800 text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Editar Produto</h1>
          <p className="text-slate-400 mt-1">Modificando: {produto.nome}</p>
        </div>
      </div>
      
      <ProdutoForm 
        produto={produto} 
        todosGrupos={todosGrupos || []} 
        gruposVinculadosIniciais={gruposVinculadosIds}
        categoriasExistentes={categoriasExistentes}
      />
    </main>
  )
}
