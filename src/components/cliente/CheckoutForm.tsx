'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function CheckoutForm({ user }: { user: any }) {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [tipoConsumo, setTipoConsumo] = useState('DELIVERY')
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <p>Carregando carrinho...</p>

  if (items.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm text-center">
        <p className="text-slate-500 mb-4">Seu carrinho está vazio.</p>
        <Button onClick={() => router.push('/')}>Voltar para a Vitrine</Button>
      </div>
    )
  }

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Aqui conectaremos com a Server Action para criar o pedido na tabela "pedidos" e "itens_pedido"
    try {
      // TODO: Chamada para Supabase Server Action
      alert('Pedido criado com sucesso! (Em breve integrado ao Supabase)')
      clearCart()
      router.push('/')
    } catch (error) {
      alert('Erro ao finalizar pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <form id="checkout-form" onSubmit={handleFinalizar} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800 mb-4">Dados do Pedido</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Retirada</label>
                <select 
                  value={tipoConsumo}
                  onChange={(e) => setTipoConsumo(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
                >
                  <option value="DELIVERY">Delivery</option>
                  <option value="BALCAO">Retirada no Balcão</option>
                  <option value="LOCAL">Consumo no Local (Mesa)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                <select 
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
                >
                  <option value="PIX">Pix</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="DINHEIRO">Dinheiro</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 h-fit">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Resumo</h3>
        <div className="space-y-4 mb-6">
          {items.map(item => (
            <div key={item.cartItemId} className="flex flex-col text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">{item.quantidade}x {item.nome}</span>
                <span className="font-bold">R$ {(item.precoTotal * item.quantidade).toFixed(2).replace('.', ',')}</span>
              </div>
              {/* Mostra customizações abaixo do nome no resumo */}
              {(item.removidos.length > 0 || item.adicionais.length > 0) && (
                <div className="pl-4 mt-1 text-xs text-slate-500">
                  {item.removidos.map(rem => <div key={rem} className="text-red-500">- Sem {rem}</div>)}
                  {item.adicionais.map(add => <div key={add.nome} className="text-green-600">+ {add.quantidade}x {add.nome}</div>)}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-300 pt-4 flex justify-between items-center font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">R$ {totalPrice().toFixed(2).replace('.', ',')}</span>
        </div>
        
        <Button 
          type="submit" 
          form="checkout-form"
          disabled={isSubmitting}
          className="w-full mt-6 bg-primary hover:bg-orange-700 h-12 text-lg font-bold text-white"
        >
          {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
        </Button>
      </div>
    </div>
  )
}
