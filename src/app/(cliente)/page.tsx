import { createClient } from "@/lib/supabase/server"
import { AddToCartButton } from "@/components/cliente/AddToCartButton"
export default async function VitrinePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Como o sistema é de uma loja só, buscamos todos os produtos ativos diretamente
  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="mb-8 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-brand mb-2">Arte Hamburgueria</h1>
        <p className="text-slate-500">
          {user ? 'Seja bem-vindo(a)! Faça seu pedido abaixo.' : 'Seja bem-vindo(a)! Faça login para pedir.'}
        </p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos && produtos.length > 0 ? (
          produtos.map((produto) => (
            <div key={produto.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-transform hover:scale-[1.02]">
              {produto.imagem_url ? (
                <img 
                  src={produto.imagem_url} 
                  alt={produto.nome} 
                  className="w-full h-48 object-cover" 
                />
              ) : (
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                  Sem imagem
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{produto.nome}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 flex-grow line-clamp-2">
                  {produto.descricao || 'Sem descrição'}
                </p>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-50">
                    R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                  </span>
                  <AddToCartButton produto={produto} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
            <p className="text-lg">Nenhum produto cadastrado no momento.</p>
          </div>
        )}
      </div>
    </main>
  )
}
