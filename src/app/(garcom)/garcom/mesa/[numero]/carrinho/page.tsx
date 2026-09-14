'use client'

import { use, useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { enviarPedidoCozinha } from '@/app/(garcom)/actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'

export default function GarcomCarrinhoPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = use(params)
  const { items, totalPrice, clearCart, removeItem, setMesa, mesa_atual } = useCartStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (mesa_atual !== numero) {
      // Se a mesa mudou, não limpa imediatamente aqui pra não assustar, 
      // mas ajusta a mesa_atual. O certo seria limpar ao ENTRAR na mesa.
      // Como o fluxo é flexível, vamos apenas forçar que estamos nessa mesa.
      setMesa(numero)
    }
  }, [numero, mesa_atual, setMesa])

  if (!mounted) return <p className="p-8 text-center">Carregando...</p>

  const handleEnviarCozinha = async () => {
    if (items.length === 0) return
    setIsSubmitting(true)
    
    try {
      // Garçom não precisa de endereço nem forma_pagamento por enquanto (é LOCAL)
      const payload = {
        tipoConsumo: 'LOCAL',
        mesa: numero,
      }
      
      const res = await enviarPedidoCozinha(payload, items)
      
      if (res?.success) {
        toast.success('Pedido enviado para a cozinha!')
        clearCart()
        router.push(`/garcom`) // Volta pro painel
      } else {
        toast.error('Erro ao enviar pedido', { description: res?.error })
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/garcom/mesa/${numero}`} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">
          Conferir Pedido - Mesa <span className="text-brand">{numero}</span>
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-slate-200">
          <p className="text-slate-500 mb-4">Nenhum item adicionado para esta mesa ainda.</p>
          <Link href={`/garcom/mesa/${numero}`}>
            <Button>Voltar ao Cardápio</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-start border-b border-slate-100 pb-4 last:border-0">
                <div>
                  <p className="font-bold text-slate-800">{item.quantidade}x {item.nome}</p>
                  {(item.removidos.length > 0 || item.adicionais.length > 0) && (
                    <div className="text-xs mt-1 space-y-1">
                      {item.removidos.map(r => <p key={r} className="text-red-500">- Sem {r}</p>)}
                      {item.adicionais.map(a => <p key={a.nome} className="text-green-600">+ {a.quantidade}x {a.nome}</p>)}
                    </div>
                  )}
                  <p className="text-sm font-semibold text-slate-600 mt-2">
                    R$ {(item.precoTotal * item.quantidade).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <button 
                  onClick={() => removeItem(item.cartItemId)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 mb-6">
            <div className="flex justify-between items-center text-xl font-black text-slate-800">
              <span>Total do Pedido Atual:</span>
              <span className="text-brand">R$ {totalPrice().toFixed(2).replace('.', ',')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Isso será adicionado à conta da mesa.</p>
          </div>

          <Button 
            onClick={handleEnviarCozinha} 
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-bold bg-brand text-white hover:bg-orange-600"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar para Cozinha'}
          </Button>
        </div>
      )}
    </main>
  )
}
