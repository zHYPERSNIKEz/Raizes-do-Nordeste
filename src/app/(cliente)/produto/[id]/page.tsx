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

  const ingredientesBase = Array.isArray(produto.ingredientes_base) ? produto.ingredientes_base : []
  const adicionais = Array.isArray(produto.adicionais) ? produto.adicionais : []

  // Buscar os grupos de complementos vinculados a este produto
  const { data: vinculos } = await supabase
    .from('produto_complementos')
    .select('grupo_id')
    .eq('produto_id', id)
  
  const grupoIds = vinculos?.map(v => v.grupo_id) || []
  
  let gruposCompletos: any[] = []
  if (grupoIds.length > 0) {
    const { data: grupos } = await supabase
      .from('complemento_grupos')
      .select('*, complemento_itens(*)')
      .in('id', grupoIds)
      
    gruposCompletos = grupos?.map(g => ({
      ...g,
      itens: g.complemento_itens
        .filter((i: any) => i.ativo)
        .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0) || a.nome.localeCompare(b.nome))
    })) || []
  }

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-medium">
        <ArrowLeft size={16} /> Voltar para o cardápio
      </Link>
      
      <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden">
        {produto.imagem_url ? (
          <img 
            src={produto.imagem_url} 
            alt={produto.nome} 
            className="w-full h-64 object-cover" 
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
            <span className="text-lg">Sem foto</span>
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">{produto.nome}</h1>
          <p className="text-muted-foreground mb-6">{produto.descricao}</p>
          
          <CustomizadorLanche 
            produto={{
              id: produto.id,
              nome: produto.nome,
              preco: Number(produto.preco),
              imagem_url: produto.imagem_url,
              ingredientes_base: ingredientesBase,
              adicionais: adicionais,
              grupos: gruposCompletos
            }}
          />
        </div>
      </div>
    </main>
  )
}
