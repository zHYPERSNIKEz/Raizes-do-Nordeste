'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Phone, Receipt, CheckCircle, PackageOpen, Bike, Loader2, Navigation } from 'lucide-react'
import { atualizarStatusPedido } from '@/app/(admin)/admin/actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Pedido = {
  id: string
  numero_pedido?: number
  cliente_nome: string
  telefone?: string
  endereco?: any
  total: number
  forma_pagamento: string
  pago: boolean
  status: string
  tipo_consumo?: string
  criado_em: string
  itens_pedido?: any[]
}

export function EntregadorPainelClient({ pedidosIniciais, lojaId }: { pedidosIniciais: Pedido[], lojaId: string }) {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('entregador-pedidos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `loja_id=eq.${lojaId}`
        },
        async (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const pedidoAtualizado = payload.new as Pedido
            
            // Se o pedido no for DELIVERY ou se for FINALIZADO/CANCELADO, remove da lista
            if (pedidoAtualizado.tipo_consumo !== 'DELIVERY' || 
                !['NA_FILA', 'PREPARANDO', 'PRONTO', 'DESPACHADO'].includes(pedidoAtualizado.status)) {
              setPedidos(prev => prev.filter(p => p.id !== pedidoAtualizado.id))
              return
            }

            // Se for um UPDATE mantendo PRONTO ou mudando pra DESPACHADO
            setPedidos(prev => {
              const existe = prev.some(p => p.id === pedidoAtualizado.id)
              if (existe) {
                return prev.map(p => p.id === pedidoAtualizado.id ? { ...p, status: pedidoAtualizado.status, pago: pedidoAtualizado.pago } : p)
              } else {
                // Precisamos buscar os itens e endereo pois no vm no webhook
                supabase.from('pedidos')
                  .select('id, numero_pedido, cliente_nome, telefone, endereco, total, forma_pagamento, pago, status, criado_em, itens_pedido(quantidade, produtos(nome))')
                  .eq('id', pedidoAtualizado.id)
                  .single()
                  .then(({ data }) => {
                    if (data) setPedidos(current => [...current, data])
                  })
                return prev
              }
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lojaId])

  const handleMudarStatus = async (pedidoId: string, novoStatus: string) => {
    setLoading(pedidoId)
    const res = await atualizarStatusPedido(pedidoId, novoStatus)
    setLoading(null)

    if (res.success) {
      if (novoStatus === 'ENTREGUE') {
        setPedidos(prev => prev.filter(p => p.id !== pedidoId))
        toast.success('Entrega finalizada com sucesso!')
      } else if (novoStatus === 'DESPACHADO') {
        toast.success('Pedido marcado como "Saiu para Entrega"!')
        setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p))
      }
    } else {
      toast.error('Erro ao atualizar. Tente novamente.')
    }
  }

  const handleAbrirMaps = (endereco: any) => {
    if (!endereco) return
    const query = `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade}`
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    window.open(url, '_blank')
  }

  const naCozinha = pedidos.filter(p => ['NA_FILA', 'PREPARANDO'].includes(p.status))
  const aguardando = pedidos.filter(p => p.status === 'PRONTO')
  const emRota = pedidos.filter(p => p.status === 'DESPACHADO')

  const RenderCard = ({ pedido }: { pedido: Pedido }) => (
    <div className={`bg-white dark:bg-slate-900 border-2 rounded-2xl p-5 shadow-sm flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300 ${pedido.status === 'DESPACHADO' ? 'border-brand' : 'border-slate-200 dark:border-slate-800'}`}>
      
      {/* Cabecalho */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            #{pedido.numero_pedido || pedido.id.split('-')[0]}
            {pedido.status === 'DESPACHADO' && <span className="text-xs bg-brand text-white px-2 py-1 rounded-full uppercase tracking-wider font-bold">Em Rota</span>}
            {['NA_FILA', 'PREPARANDO'].includes(pedido.status) && <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full uppercase tracking-wider font-bold">Na Cozinha</span>}
          </span>
          <p className="font-semibold text-slate-600 dark:text-slate-400 mt-1">{pedido.cliente_nome}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-brand">R$ {pedido.total.toFixed(2)}</p>
          <p className="text-xs font-bold text-slate-400 uppercase mt-1">{pedido.forma_pagamento}</p>
          {!pedido.pago ? (
            <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded">Cobrar na Entrega</span>
          ) : (
            <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">Já Pago</span>
          )}
        </div>
      </div>

      {/* Endereco */}
      {pedido.endereco && (
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex gap-3">
            <MapPin className="text-brand shrink-0 mt-1" size={20} />
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p className="font-bold text-slate-800 dark:text-slate-200">{pedido.endereco.rua}, {pedido.endereco.numero}</p>
              {pedido.endereco.complemento && <p>{pedido.endereco.complemento}</p>}
              <p>{pedido.endereco.bairro} - {pedido.endereco.cidade}</p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAbrirMaps(pedido.endereco)}
              className="flex-1 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 h-9"
            >
              <Navigation size={14} className="mr-2" /> GPS
            </Button>
            {pedido.telefone && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(`https://wa.me/55${(pedido.telefone || '').replace(/\D/g, '')}`, '_blank')}
                className="flex-1 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 h-9"
              >
                <Phone size={14} className="mr-2" /> Whats
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Itens */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        <p className="font-semibold mb-1 flex items-center gap-1"><PackageOpen size={14}/> Pacote:</p>
        <div className="line-clamp-2">
          {pedido.itens_pedido?.map(i => `${i.quantidade}x ${i.produtos?.nome}`).join(', ')}
        </div>
      </div>

      {/* Acoes */}
      <div className="pt-2 mt-auto">
        {['NA_FILA', 'PREPARANDO'].includes(pedido.status) ? (
          <Button 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 text-lg"
            disabled={loading === pedido.id}
            onClick={() => handleMudarStatus(pedido.id, 'DESPACHADO')}
          >
            {loading === pedido.id ? <Loader2 className="animate-spin" /> : <><Bike className="mr-2" /> Forçar Saída (Na Cozinha)</>}
          </Button>
        ) : pedido.status === 'PRONTO' ? (
          <Button 
            className="w-full bg-brand hover:bg-orange-600 text-white font-bold h-12 text-lg"
            disabled={loading === pedido.id}
            onClick={() => handleMudarStatus(pedido.id, 'DESPACHADO')}
          >
            {loading === pedido.id ? <Loader2 className="animate-spin" /> : <><Bike className="mr-2" /> Pegar para Entregar</>}
          </Button>
        ) : (
          <Button 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 text-lg"
            disabled={loading === pedido.id}
            onClick={() => handleMudarStatus(pedido.id, 'ENTREGUE')}
          >
            {loading === pedido.id ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2" /> Finalizar Entrega</>}
          </Button>
        )}
      </div>

    </div>
  )

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
          <Bike size={48} className="text-slate-300 dark:text-slate-700" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhuma entrega pendente</h2>
        <p className="text-slate-500 dark:text-slate-500 max-w-xs">Nenhum pedido na fila, na cozinha ou pronto no momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {emRota.length > 0 && (
        <div>
          <h2 className="font-bold text-brand uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
            <Bike size={18} /> Com você no caminho ({emRota.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emRota.map(p => <RenderCard key={p.id} pedido={p} />)}
          </div>
        </div>
      )}

      {aguardando.length > 0 && (
        <div>
          <h2 className="font-bold text-emerald-500 uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
            <PackageOpen size={18} /> Prontos para Coleta ({aguardando.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aguardando.map(p => <RenderCard key={p.id} pedido={p} />)}
          </div>
        </div>
      )}

      {naCozinha.length > 0 && (
        <div className="opacity-75">
          <h2 className="font-bold text-amber-500 uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
            <Loader2 size={18} className="animate-spin" /> Na Cozinha ({naCozinha.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {naCozinha.map(p => <RenderCard key={p.id} pedido={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}


