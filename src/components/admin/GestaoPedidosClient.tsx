'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { atualizarStatusPedido, atualizarPagamentoPedido } from '@/app/(admin)/admin/pedidos/actions'
import { Check, X, Clock, MapPin, Search, Eye, Filter } from 'lucide-react'

// Componente para exibir um badge de status com cores variadas
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, string> = {
    'NA_FILA': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    'PREPARANDO': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    'PRONTO': 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    'DESPACHADO': 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    'ENTREGUE': 'bg-green-500/20 text-green-500 border-green-500/30',
    'FINALIZADO': 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    'CANCELADO': 'bg-red-500/20 text-red-500 border-red-500/30',
  }
  const className = configs[status] || 'bg-slate-500/20 text-slate-400'

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${className}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function ConsumoBadge({ tipo, mesa }: { tipo: string, mesa?: number }) {
  if (tipo === 'MESA') {
    return <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-xs font-bold">MESA {mesa}</span>
  }
  if (tipo === 'DELIVERY') {
    return <span className="bg-rose-500/20 text-rose-400 px-2 py-1 rounded text-xs font-bold">DELIVERY</span>
  }
  return <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-bold">BALCÃO</span>
}

export function GestaoPedidosClient({ pedidosIniciais, lojaId }: { pedidosIniciais: any[], lojaId: string }) {
  const supabase = createClient()
  const [pedidos, setPedidos] = useState(pedidosIniciais)
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS')
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null)

  // Subscrição Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-pedidos-caixa')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `loja_id=eq.${lojaId}`
        },
        async (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          if (payload.eventType === 'UPDATE') {
            setPedidos(prev => prev.map(p => p.id === newRecord.id ? { ...p, ...newRecord } : p))
            
            // Atualizar pedido selecionado se for o mesmo
            setPedidoSelecionado((atual: any) => {
               if (atual && atual.id === newRecord.id) {
                 return { ...atual, ...newRecord }
               }
               return atual
            })
          } else {
            // Um INSERT ou DELETE. Como precisamos dos relacionamentos `itens_pedido`,
            // recarregamos a página de forma reativa ou refazemos o fetch localmente.
            const newRecord = payload.new as any
            
            const { data } = await supabase
              .from('pedidos')
              .select(`
                id, cliente_nome, telefone, tipo_consumo, mesa, status, criado_em, total, forma_pagamento, pago, endereco,
                itens_pedido ( quantidade, preco_unitario, observacao, produtos(nome) )
              `)
              .eq('id', newRecord.id)
              .single()
              
            if (data && payload.eventType === 'INSERT') {
              setPedidos(prev => [data, ...prev]) // Novo pedido no topo
            } else if (payload.eventType === 'DELETE') {
              const oldRecord = payload.old as any
              setPedidos(prev => prev.filter(p => p.id !== oldRecord.id))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, lojaId])

  // Lógica de Filtros
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroStatus === 'TODOS') return true
    if (filtroStatus === 'ATIVOS') return !['FINALIZADO', 'CANCELADO'].includes(p.status)
    return p.status === filtroStatus
  })

  // Funções de Ação Rápida
  const handleAtualizarStatus = async (id: string, novoStatus: string) => {
    await atualizarStatusPedido(id, novoStatus)
  }

  const handleTogglePagamento = async (id: string, estaPago: boolean) => {
    await atualizarPagamentoPedido(id, !estaPago)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Lista de Pedidos (Tabela / Cards) */}
      <div className="flex-1">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {['ATIVOS', 'TODOS', 'NA_FILA', 'PREPARANDO', 'PRONTO', 'DESPACHADO', 'FINALIZADO', 'CANCELADO'].map(status => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filtroStatus === status 
                  ? 'bg-brand text-white' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">ID / Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Pagamento</th>
                  <th className="px-4 py-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((pedido) => (
                    <tr 
                      key={pedido.id} 
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${pedidoSelecionado?.id === pedido.id ? 'bg-slate-800/80' : ''}`}
                      onClick={() => setPedidoSelecionado(pedido)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono text-slate-500">#{pedido.id.split('-')[0]}</div>
                        <div className="text-xs">
                          {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(pedido.criado_em))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{pedido.cliente_nome}</div>
                        {pedido.telefone && <div className="text-xs text-slate-500">{pedido.telefone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <ConsumoBadge tipo={pedido.tipo_consumo} mesa={pedido.mesa} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={pedido.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-200">
                        R$ {pedido.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTogglePagamento(pedido.id, pedido.pago) }}
                          className={`px-2 py-1 rounded text-xs font-bold ${pedido.pago ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}
                        >
                          {pedido.pago ? 'PAGO' : 'PENDENTE'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                         <button 
                            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300"
                            onClick={(e) => { e.stopPropagation(); setPedidoSelecionado(pedido) }}
                          >
                           <Eye size={16} />
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Painel Lateral - Detalhes do Pedido */}
      {pedidoSelecionado && (
        <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col max-h-[calc(100vh-8rem)] sticky top-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Pedido #{pedidoSelecionado.id.split('-')[0]}</h2>
              <p className="text-sm text-slate-400">
                {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(pedidoSelecionado.criado_em)).replace(',', ' às')}
              </p>
            </div>
            <button onClick={() => setPedidoSelecionado(null)} className="text-slate-500 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            
            {/* Status e Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <StatusBadge status={pedidoSelecionado.status} />
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Pagamento</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${pedidoSelecionado.pago ? 'text-emerald-500' : 'text-red-500'}`}>
                    {pedidoSelecionado.pago ? 'PAGO' : 'PENDENTE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Cliente */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-800 pb-1">Dados do Cliente</h3>
              <p className="text-slate-200 font-medium">{pedidoSelecionado.cliente_nome}</p>
              {pedidoSelecionado.telefone && <p className="text-slate-400 text-sm">{pedidoSelecionado.telefone}</p>}
              
              <div className="mt-2 flex items-center gap-2">
                <ConsumoBadge tipo={pedidoSelecionado.tipo_consumo} mesa={pedidoSelecionado.mesa} />
                <span className="text-slate-400 text-sm">
                  {pedidoSelecionado.forma_pagamento ? `Via ${pedidoSelecionado.forma_pagamento.toUpperCase()}` : ''}
                </span>
              </div>
            </div>

            {/* Endereço Delivery */}
            {pedidoSelecionado.tipo_consumo === 'DELIVERY' && pedidoSelecionado.endereco && (
              <div className="bg-brand/10 border border-brand/20 p-3 rounded-lg flex items-start gap-3">
                <MapPin className="text-brand shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="text-slate-200 font-medium">{pedidoSelecionado.endereco.rua}, {pedidoSelecionado.endereco.numero}</p>
                  <p className="text-slate-400">
                    {pedidoSelecionado.endereco.bairro} - {pedidoSelecionado.endereco.cidade}
                  </p>
                  {pedidoSelecionado.endereco.complemento && (
                    <p className="text-slate-400 italic">Comp: {pedidoSelecionado.endereco.complemento}</p>
                  )}
                </div>
              </div>
            )}

            {/* Itens do Pedido */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-1">Resumo dos Itens</h3>
              <div className="space-y-3">
                {pedidoSelecionado.itens_pedido?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-400">{item.quantidade}x</span>
                      <div>
                        <p className="text-slate-200">{item.produtos?.nome || 'Produto Indisponível'}</p>
                        {item.observacao && (
                          <p className="text-xs text-brand/80 mt-0.5">{item.observacao}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-400">R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="font-medium text-slate-400">Total do Pedido</span>
                <span className="text-xl font-bold text-brand">R$ {pedidoSelecionado.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Ações Inferiores */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs text-slate-500 mb-2 font-semibold">Avançar Status:</h4>
            
            {pedidoSelecionado.status === 'NA_FILA' && (
              <button 
                onClick={() => handleAtualizarStatus(pedidoSelecionado.id, 'PREPARANDO')}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Enviar para Preparo
              </button>
            )}

            {pedidoSelecionado.status === 'PREPARANDO' && (
              <button 
                onClick={() => handleAtualizarStatus(pedidoSelecionado.id, 'PRONTO')}
                className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
              >
                Marcar como Pronto
              </button>
            )}

            {pedidoSelecionado.status === 'PRONTO' && pedidoSelecionado.tipo_consumo === 'DELIVERY' && (
              <button 
                onClick={() => handleAtualizarStatus(pedidoSelecionado.id, 'DESPACHADO')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
              >
                Saiu para Entrega (Despachado)
              </button>
            )}
            
            {/* Finalizar pode vir de Pronto (se não for delivery) ou de Despachado (se for delivery) */}
            {((pedidoSelecionado.status === 'PRONTO' && pedidoSelecionado.tipo_consumo !== 'DELIVERY') || 
               pedidoSelecionado.status === 'DESPACHADO') && (
              <button 
                onClick={() => handleAtualizarStatus(pedidoSelecionado.id, 'FINALIZADO')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
              >
                Concluir / Finalizar Pedido
              </button>
            )}

            <button 
              onClick={() => {
                if (confirm('Tem certeza que deseja cancelar este pedido?')) {
                  handleAtualizarStatus(pedidoSelecionado.id, 'CANCELADO')
                }
              }}
              className="w-full py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-400 rounded-lg font-medium transition border border-transparent hover:border-red-900/50 mt-4"
            >
              Cancelar Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
