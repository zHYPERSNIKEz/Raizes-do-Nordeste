'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { atualizarStatusPedido } from '@/app/(admin)/admin/actions'
import { Button } from '@/components/ui/button'

type ItemPedido = {
  quantidade: number
  observacao: string
  produtos: { nome: string }
}

type Pedido = {
  id: string
  numero_pedido?: number
  cliente_nome: string
  tipo_consumo: string
  mesa: string | null
  status: string
  pago?: boolean
  criado_em: string
  itens_pedido?: ItemPedido[]
}

function deveAparecerNaCozinha(pedido: Pedido): boolean {
  const statusAtivo = ['NA_FILA', 'PREPARANDO', 'PRONTO'].includes(pedido.status)
  if (!statusAtivo) return false
  return (
    pedido.pago === true ||
    pedido.tipo_consumo === 'LOCAL' ||
    pedido.tipo_consumo === 'MESA'
  )
}

export function CozinhaKanban({
  initialPedidos,
  lojaId,
}: {
  initialPedidos: Pedido[]
  lojaId: string
}) {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/sounds/bell.mp3')
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const tocarSino = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.log('Bloqueado pelo navegador:', e))
      }
    }

    const buscarItensPedido = async (pedidoId: string): Promise<ItemPedido[]> => {
      const { data: itens } = await supabase
        .from('itens_pedido')
        .select('quantidade, observacao, produtos(nome)')
        .eq('pedido_id', pedidoId)
      return (itens as unknown as ItemPedido[]) || []
    }

    const channel = supabase
      .channel('cozinha-pedidos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `loja_id=eq.${lojaId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const novoPedido = payload.new as Pedido
            if (!deveAparecerNaCozinha(novoPedido)) {
              // Pedido online aguardando confirmação do Mercado Pago
              return
            }

            novoPedido.itens_pedido = await buscarItensPedido(novoPedido.id)
            setPedidos((prev) =>
              prev.some((p) => p.id === novoPedido.id) ? prev : [...prev, novoPedido]
            )
            toast.success(`Novo Pedido: ${novoPedido.cliente_nome}`)
            tocarSino()
          } else if (payload.eventType === 'UPDATE') {
            const pedidoAtualizado = payload.new as Pedido

            if (!deveAparecerNaCozinha(pedidoAtualizado)) {
              setPedidos((prev) => prev.filter((p) => p.id !== pedidoAtualizado.id))
              return
            }

            // Verifica se o pedido já estava na lista ou se acabou de ter o pagamento aprovado
            let recemAprovado = false
            setPedidos((prev) => {
              const jaExiste = prev.some((p) => p.id === pedidoAtualizado.id)
              if (!jaExiste) {
                recemAprovado = true
                return prev
              }
              return prev.map((p) =>
                p.id === pedidoAtualizado.id
                  ? { ...p, status: pedidoAtualizado.status, pago: pedidoAtualizado.pago }
                  : p
              )
            })

            if (recemAprovado) {
              pedidoAtualizado.itens_pedido = await buscarItensPedido(pedidoAtualizado.id)
              setPedidos((prev) =>
                prev.some((p) => p.id === pedidoAtualizado.id)
                  ? prev
                  : [...prev, pedidoAtualizado]
              )
              toast.success(
                `Pagamento Aprovado! Novo Pedido: ${pedidoAtualizado.cliente_nome}`
              )
              tocarSino()
            }
          } else if (payload.eventType === 'DELETE') {
            setPedidos((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lojaId])

  const handleMudarStatus = async (pedidoId: string, novoStatus: string) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p))
    )
    const res = await atualizarStatusPedido(pedidoId, novoStatus)
    if (!res.success) {
      toast.error('Erro ao atualizar status')
    }
  }

  const naFila = pedidos.filter((p) => p.status === 'NA_FILA')
  const preparando = pedidos.filter((p) => p.status === 'PREPARANDO')
  const pronto = pedidos.filter((p) => p.status === 'PRONTO')

  const RenderCard = ({ pedido }: { pedido: Pedido }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg text-slate-100 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-start border-b border-slate-700 pb-2">
        <div>
          <h4 className="font-bold text-orange-400">
            <span className="text-slate-300 mr-2">
              #{pedido.numero_pedido || pedido.id.split('-')[0]}
            </span>
            {pedido.tipo_consumo === 'LOCAL'
              ? `Mesa ${pedido.mesa}`
              : pedido.tipo_consumo === 'DELIVERY'
                ? 'Delivery'
                : 'Retirada no Balcão'}
          </h4>
          <p className="text-sm font-semibold">{pedido.cliente_nome}</p>
        </div>
        <span className="text-xs text-slate-400">
          {new Date(pedido.criado_em).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div className="flex-grow space-y-2">
        {pedido.itens_pedido?.map((item, i) => (
          <div key={i} className="text-sm border-l-2 border-slate-600 pl-2">
            <span className="font-bold">{item.quantidade}x</span> {item.produtos?.nome}
            {item.observacao && (
              <p className="text-xs text-red-300 italic">{item.observacao}</p>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2 grid grid-cols-2 gap-2 mt-auto">
        {pedido.status === 'NA_FILA' && (
          <Button
            onClick={() => handleMudarStatus(pedido.id, 'PREPARANDO')}
            className="col-span-2 bg-blue-600 hover:bg-blue-700 font-bold"
          >
            Começar Preparo
          </Button>
        )}
        {pedido.status === 'PREPARANDO' && (
          <>
            <Button
              variant="outline"
              onClick={() => handleMudarStatus(pedido.id, 'NA_FILA')}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Desfazer
            </Button>
            <Button
              onClick={() => handleMudarStatus(pedido.id, 'PRONTO')}
              className="bg-green-600 hover:bg-green-700 font-bold"
            >
              Pronto
            </Button>
          </>
        )}
        {pedido.status === 'PRONTO' && (
          pedido.tipo_consumo === 'DELIVERY' ? (
            <Button
              variant="outline"
              onClick={() => handleMudarStatus(pedido.id, 'DESPACHADO')}
              className="col-span-2 border-purple-600/60 text-purple-300 hover:bg-purple-900/40"
            >
              Despachar p/ Entregador
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => handleMudarStatus(pedido.id, 'FINALIZADO')}
              className="col-span-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Limpar (Entregue)
            </Button>
          )
        )}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Coluna 1 */}
      <div className="bg-slate-900 rounded-xl p-4 min-h-[70vh] border border-slate-800 flex flex-col gap-4">
        <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm flex justify-between items-center mb-2">
          <span>Na Fila</span>
          <span className="bg-slate-800 px-2 py-1 rounded text-orange-400">
            {naFila.length}
          </span>
        </h3>
        {naFila.map((p) => (
          <RenderCard key={p.id} pedido={p} />
        ))}
        {naFila.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-8">
            Nenhum pedido na fila.
          </p>
        )}
      </div>

      {/* Coluna 2 */}
      <div className="bg-slate-900 rounded-xl p-4 min-h-[70vh] border border-slate-800 flex flex-col gap-4">
        <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm flex justify-between items-center mb-2">
          <span>Preparando</span>
          <span className="bg-slate-800 px-2 py-1 rounded text-blue-400">
            {preparando.length}
          </span>
        </h3>
        {preparando.map((p) => (
          <RenderCard key={p.id} pedido={p} />
        ))}
        {preparando.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-8">
            Nenhum pedido sendo preparado.
          </p>
        )}
      </div>

      {/* Coluna 3 */}
      <div className="bg-slate-900 rounded-xl p-4 min-h-[70vh] border border-slate-800 flex flex-col gap-4">
        <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm flex justify-between items-center mb-2">
          <span>Pronto</span>
          <span className="bg-slate-800 px-2 py-1 rounded text-green-400">
            {pronto.length}
          </span>
        </h3>
        {pronto.map((p) => (
          <RenderCard key={p.id} pedido={p} />
        ))}
        {pronto.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-8">
            Nenhum pedido aguardando entrega.
          </p>
        )}
      </div>
    </div>
  )
}
