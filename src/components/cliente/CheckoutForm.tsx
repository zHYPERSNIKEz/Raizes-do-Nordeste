'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

import { toast } from 'sonner'

import { MapPin } from 'lucide-react'
import Link from 'next/link'

export function CheckoutForm({ user, enderecosSalvos = [] }: { user: any, enderecosSalvos?: any[] }) {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [tipoConsumo, setTipoConsumo] = useState('DELIVERY')
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  
  // Endereços
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState<string>(
    enderecosSalvos.length > 0 ? enderecosSalvos[0].id : 'NOVO'
  )
  const [telefone, setTelefone] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [complemento, setComplemento] = useState('')
  
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
    
    let enderecoFinal = null;

    if (tipoConsumo === 'DELIVERY') {
      if (enderecoSelecionadoId === 'NOVO') {
        if (!rua || !numero || !bairro || !telefone) {
          toast.error('Preencha os campos obrigatórios', {
            description: 'Por favor, preencha todos os campos do novo endereço.'
          })
          setIsSubmitting(false)
          return
        }
        enderecoFinal = { rua, numero, bairro, complemento, telefone }
      } else {
        const endSalvo = enderecosSalvos.find(e => e.id === enderecoSelecionadoId)
        if (!endSalvo) {
          toast.error('Endereço inválido')
          setIsSubmitting(false)
          return
        }
        // Se usar endereço salvo, garantimos que tem telefone. Pode usar um default se não tiver na table.
        enderecoFinal = { ...endSalvo, telefone: telefone || '(00) 00000-0000' }
      }
    }

    try {
      const payload = {
        tipoConsumo,
        formaPagamento,
        endereco: enderecoFinal
      }
      // TODO: Chamada para Supabase Server Action com o payload e itens
      console.log('Pedido:', payload, items)
      
      toast.success('Pedido confirmado!', {
        description: 'O seu pedido foi enviado para a cozinha.'
      })
      clearCart()
      router.push('/')
    } catch (error) {
      toast.error('Erro ao finalizar pedido')
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
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Retirada</label>
                <select 
                  value={tipoConsumo}
                  onChange={(e) => setTipoConsumo(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
                >
                  <option value="DELIVERY">Delivery</option>
                  <option value="BALCAO">Retirada no Balcão</option>
                </select>
              </div>

              {tipoConsumo === 'DELIVERY' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Onde vamos entregar?</h4>
                  
                  {enderecosSalvos.length > 0 && (
                    <div className="grid grid-cols-1 gap-3">
                      {enderecosSalvos.map(end => (
                        <div 
                          key={end.id}
                          onClick={() => setEnderecoSelecionadoId(end.id)}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                            enderecoSelecionadoId === end.id 
                            ? 'border-brand bg-orange-50' 
                            : 'border-slate-200 bg-white hover:border-brand/50'
                          }`}
                        >
                          <MapPin className={enderecoSelecionadoId === end.id ? 'text-brand' : 'text-slate-400'} size={20} />
                          <div>
                            <p className="font-bold text-slate-800 text-sm mb-1">{end.titulo}</p>
                            <p className="text-xs text-slate-600">{end.rua}, {end.numero} - {end.bairro}</p>
                            {end.complemento && <p className="text-xs text-slate-500">{end.complemento}</p>}
                          </div>
                        </div>
                      ))}
                      
                      <div 
                        onClick={() => setEnderecoSelecionadoId('NOVO')}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${
                          enderecoSelecionadoId === 'NOVO' 
                          ? 'border-brand bg-orange-50 font-bold text-brand' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand/50'
                        }`}
                      >
                        + Cadastrar novo endereço agora
                      </div>
                    </div>
                  )}

                  {(enderecoSelecionadoId === 'NOVO' || enderecosSalvos.length === 0) && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Telefone (WhatsApp) *</label>
                        <input type="text" required={enderecoSelecionadoId === 'NOVO'} value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" placeholder="(00) 00000-0000" />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">Rua *</label>
                          <input type="text" required={enderecoSelecionadoId === 'NOVO'} value={rua} onChange={(e) => setRua(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-slate-700 mb-1">Número *</label>
                          <input type="text" required={enderecoSelecionadoId === 'NOVO'} value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Bairro *</label>
                          <input type="text" required={enderecoSelecionadoId === 'NOVO'} value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Complemento</label>
                          <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" placeholder="Ap, Casa 2..." />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Forma de Pagamento</label>
                <select 
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
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

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit sticky top-24">
        <h3 className="font-bold text-xl text-slate-800 mb-6">Resumo do Pedido</h3>
        <div className="space-y-4 mb-6">
          {items.map(item => (
            <div key={item.cartItemId} className="flex flex-col text-sm border-b border-slate-200 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-700 font-bold leading-tight">{item.quantidade}x {item.nome}</span>
                <span className="font-bold text-slate-800 shrink-0">R$ {(item.precoTotal * item.quantidade).toFixed(2).replace('.', ',')}</span>
              </div>
              {/* Mostra customizações abaixo do nome no resumo */}
              {(item.removidos.length > 0 || item.adicionais.length > 0) && (
                <div className="pl-4 mt-2 text-xs text-slate-500 space-y-1">
                  {item.removidos.map(rem => <div key={rem} className="text-red-500 font-medium">- Sem {rem}</div>)}
                  {item.adicionais.map(add => <div key={add.nome} className="text-green-600 font-medium">+ {add.quantidade}x {add.nome}</div>)}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="border-t border-slate-200 pt-4 mb-8">
          <div className="flex justify-between items-center text-slate-600 mb-2">
            <span>Subtotal</span>
            <span>R$ {totalPrice().toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 mb-4">
            <span>Taxa de Entrega</span>
            <span className="text-green-600 font-bold">Grátis</span>
          </div>
          <div className="flex justify-between items-center font-black text-2xl text-slate-800">
            <span>Total</span>
            <span className="text-brand">R$ {totalPrice().toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            type="submit" 
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full bg-brand hover:bg-orange-700 h-14 text-lg font-bold text-white rounded-xl shadow-lg shadow-orange-500/20"
          >
            {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
          </Button>

          <Link 
            href="/"
            className="w-full flex items-center justify-center h-12 text-slate-600 font-medium rounded-xl border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
