export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { AddToCartButton } from "@/components/cliente/AddToCartButton"

export default async function VitrinePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="w-full bg-foreground text-background py-16 md:py-24 px-6 mb-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        {/* Elemento decorativo de fundo pra dar energia */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
          <div className="bg-primary text-primary-foreground text-sm md:text-base font-bold px-4 py-1 rounded-full mb-6 uppercase tracking-wider shadow-md">
            Sabor Incomparável
          </div>
          <h1 className="font-display text-6xl md:text-8xl tracking-wide leading-tight mb-4 text-primary">
            Arte<br />
            <span className="text-background">Burgueria</span>
          </h1>
          <p className="text-lg md:text-xl max-w-lg opacity-90 mt-4">
            {user ? 'Bem-vindo de volta! Faça seu pedido abaixo.' : 'O hambúrguer artesanal de verdade. Faça login para pedir.'}
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center mb-10">
          <h2 className="font-display text-4xl text-foreground text-center">Nosso Cardápio</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {produtos && produtos.length > 0 ? (
            produtos.map((produto, index) => (
              <div 
                key={produto.id} 
                className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 flex flex-col border border-border"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                {produto.imagem_url ? (
                  <div className="h-56 overflow-hidden bg-muted relative">
                    <img 
                      src={produto.imagem_url} 
                      alt={produto.nome} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                ) : (
                  <div className="w-full h-56 bg-secondary flex items-center justify-center font-display text-2xl text-secondary-foreground/40">
                    S/ Imagem
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-display text-2xl text-foreground mb-2">{produto.nome}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow text-base leading-relaxed">
                    {produto.descricao || 'O clássico sem descrição.'}
                  </p>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
                    <span className="font-display text-2xl text-primary">
                      R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                    </span>
                    <div className="[&>button]:font-bold [&>button]:rounded-full [&>button]:px-6 [&>button]:py-5 [&>button]:shadow-md hover:[&>button]:scale-105 [&>button]:transition-transform">
                      <AddToCartButton produto={produto} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-card rounded-3xl border border-border border-dashed">
              <p className="font-display text-3xl text-foreground">Forno Desligado</p>
              <p className="text-muted-foreground mt-2">Nenhum produto disponível no momento.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
