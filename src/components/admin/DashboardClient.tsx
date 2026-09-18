'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseISO, format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { DollarSign, ShoppingBag, TrendingUp, Utensils, Calendar as CalendarIcon, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Pedido = {
  id: string
  total: number
  criado_em: string
  itens: any[]
}

type Props = {
  pedidos: Pedido[]
  periodoAtual: string
  inicioAtual?: string
  fimAtual?: string
}

export function DashboardClient({ pedidos, periodoAtual, inicioAtual, fimAtual }: Props) {
  const [periodo, setPeriodo] = useState(periodoAtual)
  const [dataInicio, setDataInicio] = useState(inicioAtual || '')
  const [dataFim, setDataFim] = useState(fimAtual || '')

  const handleMudancaPeriodo = (novoPeriodo: string) => {
    setPeriodo(novoPeriodo)
    if (novoPeriodo !== 'custom') {
      window.location.href = `/admin/dashboard?periodo=${novoPeriodo}`
    }
  }

  const aplicarFiltroCustomizado = () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, preencha a data inicial e final.')
      return
    }
    window.location.href = `/admin/dashboard?periodo=custom&inicio=${dataInicio}&fim=${dataFim}`
  }

  // Processamento de dados
  const metricas = useMemo(() => {
    let faturamentoTotal = 0
    let qtdPedidos = 0
    const contagemProdutos: Record<string, number> = {}
    
    // Usaremos 'yyyy-MM-dd' como chave universal para evitar bugs de ordenação e fuso horário
    const graficoMap: Record<string, number> = {}

    // 1. Preencher com os dados reais agrupando pelo formato seguro 'yyyy-MM-dd'
    pedidos.forEach(p => {
      const dataPedido = parseISO(p.criado_em)
      const valor = Number(p.total)

      faturamentoTotal += valor
      qtdPedidos++

      const chaveDia = format(dataPedido, 'yyyy-MM-dd')
      graficoMap[chaveDia] = (graficoMap[chaveDia] || 0) + valor

      if (Array.isArray(p.itens)) {
        p.itens.forEach(item => {
          const nome = item.nome
          const qtd = Number(item.quantidade) || 1
          if (nome) {
            contagemProdutos[nome] = (contagemProdutos[nome] || 0) + qtd
          }
        })
      }
    })

    // 2. Construir o eixo X cronológico perfeitamente alinhado
    let diasParaMostrar: Date[] = []

    try {
      if (periodoAtual === '7d') {
        diasParaMostrar = eachDayOfInterval({ start: startOfDay(subDays(new Date(), 6)), end: startOfDay(new Date()) })
      } else if (periodoAtual === '30d') {
        diasParaMostrar = eachDayOfInterval({ start: startOfDay(subDays(new Date(), 29)), end: startOfDay(new Date()) })
      } else if (periodoAtual === 'hoje') {
        diasParaMostrar = [startOfDay(new Date())]
      } else if (periodoAtual === 'custom' && inicioAtual && fimAtual) {
        const days = eachDayOfInterval({ start: parseISO(inicioAtual), end: parseISO(fimAtual) })
        if (days.length <= 60) {
          diasParaMostrar = days
        } else {
          // Se for muito grande, mostra apenas os dias que tiveram vendas
          const datasComVenda = Object.keys(graficoMap).sort()
          diasParaMostrar = datasComVenda.map(d => parseISO(d))
        }
      } else if (periodoAtual === 'tudo') {
        const datasComVenda = Object.keys(graficoMap).sort()
        diasParaMostrar = datasComVenda.map(d => parseISO(d))
      }
    } catch (e) {
      console.error("Erro ao calcular dias do gráfico", e)
    }

    // 3. Formatar a array final pro Recharts mapeando os dias ordenados contra o mapa de valores
    let chartData = diasParaMostrar.map(d => {
      const key = format(d, 'yyyy-MM-dd')
      const name = format(d, 'dd/MM', { locale: ptBR })
      return { name, Total: graficoMap[key] || 0 }
    })
    
    if (chartData.length === 0) {
      chartData.push({ name: 'Sem dados', Total: 0 })
    }

    const topProdutos = Object.entries(contagemProdutos)
      .map(([nome, vendas]) => ({ nome, vendas }))
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 7) 

    const ticketMedio = qtdPedidos > 0 ? faturamentoTotal / qtdPedidos : 0

    return {
      faturamentoTotal,
      qtdPedidos,
      ticketMedio,
      chartData,
      topProdutos
    }
  }, [pedidos, periodoAtual, inicioAtual, fimAtual])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-8">
      
      {/* Barra de Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-300 font-medium whitespace-nowrap">
          <Filter size={18} className="text-brand" /> Filtrar por:
        </div>
        
        <select 
          value={periodo} 
          onChange={(e) => handleMudancaPeriodo(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 focus:border-brand outline-none min-w-[200px]"
        >
          <option value="hoje">Apenas Hoje</option>
          <option value="7d">Últimos 7 Dias</option>
          <option value="30d">Últimos 30 Dias</option>
          <option value="tudo">Desde o Início</option>
          <option value="custom">Período Personalizado...</option>
        </select>

        {periodo === 'custom' && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <input 
                type="date" 
                value={dataInicio} 
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-sm outline-none"
              />
              <span className="text-slate-500">até</span>
              <input 
                type="date" 
                value={dataFim} 
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-sm outline-none"
              />
            </div>
            
            <Button onClick={aplicarFiltroCustomizado} className="bg-brand hover:bg-orange-600 text-white ml-auto w-full md:w-auto">
              Buscar Datas
            </Button>
          </>
        )}
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard 
          title="Faturamento Total" 
          value={formatCurrency(metricas.faturamentoTotal)} 
          icon={<DollarSign size={24} className="text-emerald-400" />} 
          colorClass="border-emerald-500/20 bg-emerald-500/5"
        />
        <MetricCard 
          title="Quantidade de Pedidos" 
          value={metricas.qtdPedidos.toString()} 
          icon={<ShoppingBag size={24} className="text-blue-400" />} 
          colorClass="border-blue-500/20 bg-blue-500/5"
        />
        <MetricCard 
          title="Ticket Médio" 
          value={formatCurrency(metricas.ticketMedio)} 
          icon={<TrendingUp size={24} className="text-orange-400" />} 
          colorClass="border-orange-500/20 bg-orange-500/5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm overflow-hidden">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <CalendarIcon size={20} className="text-slate-400" /> Curva de Vendas do Período
          </h2>
          <div className="h-[300px] w-full min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={50} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Faturamento']}
                />
                <Bar dataKey="Total" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Produtos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Utensils size={20} className="text-slate-400" /> Ranking de Produtos
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {metricas.topProdutos.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                Nenhuma venda registrada no período.
              </div>
            ) : (
              <ul className="space-y-3">
                {metricas.topProdutos.map((prod, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' :
                        idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/50' :
                        idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/50' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}º
                      </div>
                      <span className="font-medium text-slate-200 line-clamp-1">{prod.nome}</span>
                    </div>
                    <span className="text-sm font-bold text-brand shrink-0">
                      {prod.vendas} un
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, colorClass }: { title: string, value: string, icon: React.ReactNode, colorClass: string }) {
  return (
    <div className={`p-6 rounded-xl border ${colorClass} flex flex-col relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className="text-sm font-semibold text-slate-400">{title}</h3>
        <div className="p-2 rounded-lg bg-slate-950/50 backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-slate-100 mt-auto relative z-10">
        {value}
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-10 blur-sm pointer-events-none scale-150">
        {icon}
      </div>
    </div>
  )
}


