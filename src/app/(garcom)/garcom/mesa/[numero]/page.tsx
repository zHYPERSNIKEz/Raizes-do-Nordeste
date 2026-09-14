import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { AddToCartButton } from "@/components/cliente/AddToCartButton"
import Link from "next/link"
import { ArrowLeft, ShoppingCart } from "lucide-react"

export default async function MesaCardapioPage({ params }: { params: Promise<{ numero: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/garcom')
  }

  const { numero } = await params

  // Como é apenas uma loja, pega a primeira
  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()

  if (!loja) {
    return <div className="p-8 text-center text-red-500">Erro: Nenhuma loja cadastrada no sistema.</div>
  }

  // 2. Busca os produtos ativos desta loja
  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('loja_id', loja.id)
    .eq('ativo', true)

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 relative pb-24">
      <div className="max-w-4xl mx-auto flex items-center gap-4 mb-6">
        <Link href="/garcom" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Atendendo Mesa <span className="text-brand">{numero}</span>
        </h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos && produtos.length > 0 ? (
          produtos.map((produto) => (
            <div key={produto.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-transform hover:scale-[1.02]">
              {produto.imagem_url ? (
                <img 
                  src={produto.imagem_url} 
                  alt={produto.nome} 
                  className="w-full h-32 object-cover" 
                />
              ) : (
                <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                  Sem imagem
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg text-slate-800">{produto.nome}</h3>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
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
          </div>
        )}
      </div>

      {/* Botão flutuante do carrinho do garçom */}
      <div className="fixed bottom-4 left-0 right-0 px-4 z-50">
        <div className="max-w-4xl mx-auto">
          <Link href={`/garcom/mesa/${numero}/carrinho`}>
            <div className="bg-brand text-white p-4 rounded-xl shadow-xl flex justify-between items-center font-bold text-lg hover:bg-orange-600 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <ShoppingCart size={24} />
                <span>Ver Pedido da Mesa</span>
              </div>
              <span>Avançar →</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
