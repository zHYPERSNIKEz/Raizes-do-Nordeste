import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AddToCartButton } from "@/components/cliente/AddToCartButton"

// Next.js 15+ async params
export default async function VitrinePage({ params }: { params: Promise<{ loja_slug: string }> }) {
  const supabase = await createClient()
  const { loja_slug } = await params

  // 1. Busca a loja pelo slug
  const { data: loja, error: lojaError } = await supabase
    .from('lojas')
    .select('*')
    .eq('slug', loja_slug)
    .eq('ativo', true)
    .single()

  if (lojaError || !loja) {
    notFound() // Mostra a página 404 se a loja não existir
  }

  // 2. Busca os produtos ativos desta loja
  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('loja_id', loja.id)
    .eq('ativo', true)

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="mb-8 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-brand mb-2">{loja.nome}</h1>
        <p className="text-slate-500">Seja bem-vindo(a)! Faça seu pedido abaixo.</p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos && produtos.length > 0 ? (
          produtos.map((produto) => (
            <div key={produto.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-transform hover:scale-[1.02]">
              {produto.imagem_url ? (
                <img 
                  src={produto.imagem_url} 
                  alt={produto.nome} 
                  className="w-full h-48 object-cover" 
                />
              ) : (
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                  Sem imagem
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg text-slate-800">{produto.nome}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4 flex-grow line-clamp-2">
                  {produto.descricao || 'Sem descrição'}
                </p>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                  <span className="font-bold text-lg text-slate-900">
                    R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                  </span>
                  <AddToCartButton produto={produto} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-slate-500 py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-lg">Nenhum produto cadastrado no momento.</p>
            <p className="text-sm mt-1">A loja está organizando o cardápio.</p>
          </div>
        )}
      </div>
    </main>
  )
}