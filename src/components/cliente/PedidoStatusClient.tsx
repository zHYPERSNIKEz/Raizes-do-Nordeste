'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Clock, ChefHat, MapPin, PackageCheck, Receipt, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const STATUS_STAGES = [
  { id: 'NA_FILA', label: 'Na Fila', icon: Clock },
  { id: 'PREPARANDO', label: 'Preparando', icon: ChefHat },
  { id: 'PRONTO', label: 'Pronto', icon: PackageCheck },
  { id: 'DESPACHADO', label: 'Saiu para Entrega', icon: MapPin },
  { id: 'FINALIZADO', label: 'Finalizado', icon: Check }
]

export function PedidoStatusClient({ pedidoInicial }: { pedidoInicial: any }) {
  const [pedido, setPedido] = useState(pedidoInicial)
  const supabase = createClient()

  useEffect(() => {
    // Inscreve para ouvir alterações apenas neste pedido específico
    const channel = supabase
      .channel(`pedido-status-${pedido.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `id=eq.${pedido.id}`
        },
        (payload) => {
          setPedido((prev: any) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, pedido.id])

  const getStatusIndex = (status: string) => {
    // Se o pedido não for delivery, removemos a etapa DESPACHADO da lógica visual (embora ela possa existir)
    if (status === 'CANCELADO') return -1
    return STATUS_STAGES.findIndex(s => s.id === status)
  }

  const currentStageIndex = getStatusIndex(pedido.status)
  
  // Filtramos as etapas que fazem sentido para o tipo de consumo
  const visibleStages = STATUS_STAGES.filter(stage => 
    !(pedido.tipo_consumo !== 'DELIVERY' && stage.id === 'DESPACHADO')
  )

  const visibleCurrentIndex = visibleStages.findIndex(s => s.id === pedido.status)
  // Se for finalizado em um pedido não-delivery, ajustamos o index
  const safeCurrentIndex = pedido.status === 'FINALIZADO' ? visibleStages.length - 1 : visibleCurrentIndex

  return (
    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand mb-6 transition-colors">
        <ChevronLeft size={16} className="mr-1" />
        Voltar para Home
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Pedido #{pedido.id.split('-')[0]}</h1>
          <p className="text-slate-500 mt-1">
            Realizado em {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(pedido.criado_em)).replace(',', ' às')}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold text-sm ${pedido.pago ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {pedido.pago ? 'PAGO' : 'PAGAMENTO PENDENTE'}
        </div>
      </div>

      {pedido.status === 'CANCELADO' ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center mb-10">
          <h3 className="text-xl font-bold mb-2">Pedido Cancelado</h3>
          <p>Este pedido foi cancelado pela loja. Em caso de dúvidas, entre em contato conosco.</p>
        </div>
      ) : (
        <div className="mb-12">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Status do Pedido</h3>
          
          <div className="relative">
            {/* Barra de progresso base (fundo) */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-slate-100 rounded-full" />
            
            {/* Barra de progresso preenchida */}
            <div 
              className="absolute top-6 left-6 h-1 bg-brand rounded-full transition-all duration-500" 
              style={{ width: `calc(${(Math.max(0, safeCurrentIndex) / (visibleStages.length - 1)) * 100}% - 3rem)` }} 
            />

            <div className="relative flex justify-between">
              {visibleStages.map((stage, idx) => {
                const isCompleted = idx <= safeCurrentIndex
                const isCurrent = idx === safeCurrentIndex
                const Icon = stage.icon
                
                return (
                  <div key={stage.id} className="flex flex-col items-center relative z-10 w-24">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm
                        ${isCompleted 
                          ? 'bg-brand border-white text-white' 
                          : 'bg-white border-slate-100 text-slate-400'
                        }
                        ${isCurrent ? 'ring-4 ring-brand/20 scale-110' : ''}
                      `}
                    >
                      <Icon size={20} />
                    </div>
                    <p className={`mt-3 text-xs font-bold text-center ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                      {stage.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t pt-8">
        {/* Detalhes da Entrega */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            {pedido.tipo_consumo === 'DELIVERY' ? <MapPin size={20} className="text-brand" /> : <Receipt size={20} className="text-brand" />}
            {pedido.tipo_consumo === 'DELIVERY' ? 'Endereço de Entrega' : 'Detalhes do Pedido'}
          </h3>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            {pedido.tipo_consumo === 'DELIVERY' && pedido.endereco ? (
              <div className="text-slate-600 text-sm leading-relaxed">
                <p className="font-semibold text-slate-800 mb-1">{pedido.cliente_nome}</p>
                <p>{pedido.endereco.rua}, {pedido.endereco.numero}</p>
                {pedido.endereco.complemento && <p>{pedido.endereco.complemento}</p>}
                <p>{pedido.endereco.bairro} - {pedido.endereco.cidade}</p>
                <p className="mt-2 text-slate-500">Telefone: {pedido.telefone}</p>
              </div>
            ) : (
              <div className="text-slate-600 text-sm">
                <p><span className="font-semibold">Cliente:</span> {pedido.cliente_nome}</p>
                <p className="mt-1"><span className="font-semibold">Tipo:</span> {pedido.tipo_consumo === 'MESA' ? `Mesa ${pedido.mesa}` : 'Retirada no Balcão'}</p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-800 mb-1">Forma de Pagamento</p>
              <p className="text-slate-600 text-sm uppercase">{pedido.forma_pagamento}</p>
            </div>
          </div>
        </div>

        {/* Resumo dos Itens */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Resumo do Pedido</h3>
          
          <div className="space-y-4 mb-6">
            {pedido.itens_pedido?.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden relative shrink-0">
                  {item.produtos?.imagem_url ? (
                     <Image src={item.produtos.imagem_url} alt={item.produtos.nome} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <PackageCheck size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm">{item.quantidade}x {item.produtos?.nome}</h4>
                  {item.observacao && (
                    <p className="text-xs text-brand mt-1">{item.observacao}</p>
                  )}
                  <p className="text-sm font-bold text-slate-600 mt-1">
                    R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-600">Total</span>
            <span className="text-2xl font-black text-brand">R$ {pedido.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
