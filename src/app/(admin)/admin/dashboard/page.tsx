import { createClient } from '@/lib/supabase/server'
import { DollarSign, ShoppingBag, Utensils, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Como é single-tenant, pega a loja atual
  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  if (!loja) return <div className="p-8">Nenhuma loja encontrada.</div>

  // Pega a data de hoje (início do dia e início do mês) - Simplificado usando DB server time se possível
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  primeiroDiaMes.setHours(0, 0, 0, 0)

  // Busca pedidos pagos da loja
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('total, criado_em, tipo_consumo')
    .eq('loja_id', loja.id)
    .eq('pago', true)

  let faturamentoHoje = 0
  let faturamentoMes = 0
  let qtdPedidosHoje = 0
  let qtdDeliveryHoje = 0
  let qtdLocalHoje = 0

  if (pedidos) {
    pedidos.forEach(p => {
      const dataPedido = new Date(p.criado_em)
      
      if (dataPedido >= primeiroDiaMes) {
        faturamentoMes += Number(p.total)
      }
      
      if (dataPedido >= hoje) {
        faturamentoHoje += Number(p.total)
        qtdPedidosHoje++
        if (p.tipo_consumo === 'DELIVERY') qtdDeliveryHoje++
        else qtdLocalHoje++
      }
    })
  }

  // Busca pedidos na fila ou preparando para exibir um "alerta" de fluxo
  const { count: pedidosPendentes } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
    .eq('loja_id', loja.id)
    .in('status', ['NA_FILA', 'PREPARANDO'])

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-100 mb-8">Dashboard de Vendas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Faturamento (Hoje)</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-1">
                R$ {faturamentoHoje.toFixed(2).replace('.', ',')}
              </h3>
            </div>
            <div className="p-3 bg-brand/10 text-brand rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Apenas pedidos fechados/pagos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Faturamento (Mês)</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-1">
                R$ {faturamentoMes.toFixed(2).replace('.', ',')}
              </h3>
            </div>
            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Mês atual ({hoje.toLocaleDateString('pt-BR', { month: 'long' })})</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Vendas (Hoje)</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-1">{qtdPedidosHoje}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="flex gap-4 text-xs font-semibold mt-2">
            <span className="text-blue-400">Delivery: {qtdDeliveryHoje}</span>
            <span className="text-orange-400">Salão: {qtdLocalHoje}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Fila na Cozinha</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-1">{pedidosPendentes || 0}</h3>
            </div>
            <div className={`p-3 rounded-lg ${(pedidosPendentes || 0) > 5 ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
              <Utensils size={24} />
            </div>
          </div>
          {(pedidosPendentes || 0) > 5 ? (
             <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={14}/> Alto fluxo! Fique de olho.</p>
          ) : (
            <p className="text-xs text-slate-500">Cozinha tranquila no momento.</p>
          )}
        </div>
      </div>

      {/* Espaço para gráficos futuros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <h4 className="text-xl font-bold text-slate-600 mb-2">Gráficos de Venda</h4>
          <p className="text-slate-500 text-sm max-w-sm">
            Assim que tivermos mais histórico de vendas, os gráficos detalhados de evolução diária aparecerão aqui.
          </p>
        </div>
      </div>
    </main>
  )
}