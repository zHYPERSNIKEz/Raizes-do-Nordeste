export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { CatalogoVitrineClient } from "@/components/cliente/CatalogoVitrineClient"
import { isLojaAbertaAgora } from "@/lib/utils"

export default async function VitrinePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)

  const { data: loja } = await supabase.from('lojas').select('*').limit(1).single()
  const lojaAberta = isLojaAbertaAgora(loja)
  
  const mensagemFechado = loja?.mensagem_fechado || 'Loja Fechada no Momento'

  const formatarData = (dataStr?: string) => {
    if (!dataStr) return null;
    const partes = dataStr.split('-');
    if (partes.length !== 3) return dataStr;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  const dataRetorno = formatarData(loja?.pausa_fim)

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="w-full bg-foreground text-background py-16 md:py-24 px-6 mb-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        {/* Elemento decorativo de fundo pra dar energia */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
          
          {!lojaAberta ? (
            <div className="bg-red-600/90 text-white text-sm md:text-base font-black px-8 py-3 rounded-2xl mb-6 uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.7)] border border-red-400/50 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 animate-pulse"><span className="text-xl">🛑</span> {loja.em_pausa ? 'PAUSA PROGRAMADA' : 'LOJA FECHADA'}</div>
              {mensagemFechado && (
                <div className="text-sm md:text-base font-medium normal-case tracking-normal text-red-100 bg-red-950/40 px-4 py-2 rounded-lg border border-red-500/30 w-full max-w-sm text-center">
                  {mensagemFechado}
                  {dataRetorno && (
                    <div className="mt-2 pt-2 border-t border-red-500/30 text-xs text-red-200/90 font-semibold tracking-wide">
                      RETORNAREMOS: {dataRetorno}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-primary text-primary-foreground text-sm md:text-base font-bold px-4 py-1 rounded-full mb-6 uppercase tracking-wider shadow-md">
              Culinária Regional Autêntica
            </div>
          )}
          
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-4 text-primary">
            Raízes<br />
            <span className="text-background">do Nordeste</span>
          </h1>
          <p className="text-lg md:text-xl max-w-lg opacity-90 mt-4">
            {!lojaAberta 
              ? 'Volte em breve para saborear o melhor da gastronomia nordestina.'
              : user ? 'Bem-vindo de volta! Faça seu pedido abaixo.' : 'A verdadeira essência da culinária nordestina. Faça login para pedir.'}
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center mb-10">
          <h2 className="font-display text-4xl text-foreground text-center">Nosso Cardápio</h2>
        </div>
        
        <CatalogoVitrineClient produtos={produtos || []} />
      </div>
    </main>
  )
}
