import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CustomizadorLanche } from "@/components/cliente/CustomizadorLanche"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ProdutoPersonalizacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: produto, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !produto) {
    notFound()
  }

  // Prepara arrays seguros caso o JSONB esteja nulo no banco
  const ingredientesBase = Array.isArray(produto.ingredientes_base) ? produto.ingredientes_base : []
  const adicionais = Array.isArray(produto.adicionais) ? produto.adicionais : []

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 font-medium">
        <ArrowLeft size={16} /> Voltar para o cardápio
      </Link>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {produto.imagem_url ? (
          <img 
            src={produto.imagem_url} 
            alt={produto.nome} 
            className="w-full h-64 object-cover" 
          />
        ) : (
          <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <span className="text-lg">Sem foto</span>
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{produto.nome}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{produto.descricao}</p>
          
          <CustomizadorLanche 
            produto={{
              id: produto.id,
              nome: produto.nome,
              preco: Number(produto.preco),
              imagem_url: produto.imagem_url,
              ingredientes_base: ingredientesBase,
              adicionais: adicionais
            }}
          />
        </div>
      </div>
    </main>
  )
}
