import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CaixaManager } from '@/components/admin/CaixaManager'
import { AlertCircle } from 'lucide-react'

export default async function CaixaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnUrl=/admin/caixa')

  const { data: perfil } = await supabase.from('perfis').select('cargo, permissoes').eq('id', user.id).single()
  const cargo = perfil?.cargo?.trim().toUpperCase()
  const permissoes = Array.isArray(perfil?.permissoes) ? perfil.permissoes : []

  // Permite acesso se for ADMIN, GERENTE ou tiver a permissão extra "acesso_caixa"
  if (cargo !== 'ADMIN' && cargo !== 'GERENTE' && !permissoes.includes('acesso_caixa')) {
    return <div className="p-8 text-center text-red-500">Acesso negado. Você não tem permissão para acessar o Caixa.</div>
  }

  const { data: loja } = await supabase.from('lojas').select('id, nome').limit(1).single()
  if (!loja) return <div className="p-8">Loja não encontrada.</div>

  // Busca o caixa aberto
  const { data: caixaAberto, error: caixaError } = await supabase
    .from('caixas')
    .select('*')
    .eq('loja_id', loja.id)
    .eq('status', 'ABERTO')
    .limit(1)
    .maybeSingle()

  if (caixaError && caixaError.code === '42P01') {
    return (
      <main className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Fechamento de Caixa</h1>
        <div className="mb-6 p-6 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-200">
          <div className="flex gap-3 items-start mb-4">
            <AlertCircle className="shrink-0 mt-0.5 text-orange-400" size={24} />
            <div>
              <p className="font-bold text-lg mb-2">Instalação do Módulo de Caixa Necessária</p>
              <p className="mb-4">As tabelas financeiras ainda não foram criadas no banco de dados. Para utilizar o Fechamento de Caixa, execute o seguinte comando no SQL Editor do Supabase:</p>
            </div>
          </div>
          <pre className="bg-black/50 p-4 rounded-lg text-orange-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE caixas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) NOT NULL,
  usuario_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'ABERTO',
  valor_abertura NUMERIC DEFAULT 0,
  valor_fechamento_sistema NUMERIC,
  valor_fechamento_real NUMERIC,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fechado_em TIMESTAMP WITH TIME ZONE,
  observacoes TEXT
);

CREATE TABLE movimentacoes_caixa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caixa_id UUID REFERENCES caixas(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  valor NUMERIC NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
          </pre>
        </div>
      </main>
    )
  }

  // Se tem caixa aberto, busca os pedidos pagos desde a abertura
  let pedidos: any[] = []
  let movimentacoes: any[] = []

  if (caixaAberto) {
    const { data: p } = await supabase
      .from('pedidos')
      .select('id, total, forma_pagamento, criado_em, tipo_consumo')
      .eq('loja_id', loja.id)
      .eq('pago', true)
      .gte('criado_em', caixaAberto.criado_em)
    
    pedidos = p || []

    const { data: m } = await supabase
      .from('movimentacoes_caixa')
      .select('*')
      .eq('caixa_id', caixaAberto.id)
      .order('criado_em', { ascending: false })
    
    movimentacoes = m || []
  }

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Controle de Caixa</h1>
        <p className="text-slate-400">
          Abra e feche seu caixa diariamente. Acompanhe sangrias, suprimentos e o balanço exato das formas de pagamento.
        </p>
      </header>

      <CaixaManager 
        lojaId={loja.id} 
        caixaAtual={caixaAberto} 
        pedidos={pedidos} 
        movimentacoes={movimentacoes} 
      />
    </main>
  )
}
