'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { adicionarEndereco } from '@/app/(cliente)/perfil/actions'
import { criarPedido } from '@/app/(cliente)/checkout/actions'
import { toast } from 'sonner'
import { MapPin, QrCode, CreditCard, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export function CheckoutForm({
  user,
  enderecosSalvos = [],
  taxaEntrega = 0,
  lojaAberta = true,
}: {
  user: any
  enderecosSalvos?: any[]
  taxaEntrega?: number
  lojaAberta?: boolean
}) {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [tipoConsumo, setTipoConsumo] = useState('DELIVERY')
  const [formaPagamento, setFormaPagamento] = useState<'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO'>('PIX')

  // Endereços
  const [localEnderecos, setLocalEnderecos] = useState<any[]>(enderecosSalvos)
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState<string>(
    localEnderecos.length > 0 ? enderecosSalvos[0].id : 'NOVO'
  )
  const [titulo, setTitulo] = useState('Novo Endereço')
  const maskPhone = (val: string) => {
    const v = val.replace(/\D/g, '')
    if (v.length <= 2) return v
    if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}`
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`
  }

  const [telefone, setTelefone] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [complemento, setComplemento] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingAddress, setIsSavingAddress] = useState(false)

  const handleSalvarEndereco = async () => {
    if (!rua || !numero || !bairro || !telefone) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    setIsSavingAddress(true)
    const novoId = crypto.randomUUID()
    const novoEnd = { id: novoId, titulo, rua, numero, bairro, complemento, telefone }

    const res = await adicionarEndereco(novoEnd)
    if (res?.success) {
      setLocalEnderecos([...localEnderecos, novoEnd])
      setEnderecoSelecionadoId(novoId)
      toast.success('Endereço salvo no seu perfil!')
    } else {
      toast.error('Erro ao salvar endereço.')
    }
    setIsSavingAddress(false)
  }

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

    let enderecoFinal = null

    if (tipoConsumo === 'DELIVERY') {
      if (enderecoSelecionadoId === 'NOVO') {
        if (!rua || !numero || !bairro || !telefone) {
          toast.error('Preencha os campos obrigatórios', {
            description: 'Por favor, preencha todos os campos do novo endereço.',
          })
          setIsSubmitting(false)
          return
        }
        enderecoFinal = { rua, numero, bairro, complemento, telefone }
      } else {
        const endSalvo = localEnderecos.find((e) => e.id === enderecoSelecionadoId)
        if (!endSalvo) {
          toast.error('Endereço inválido')
          setIsSubmitting(false)
          return
        }
        enderecoFinal = {
          ...endSalvo,
          telefone: endSalvo.telefone || telefone || '(00) 00000-0000',
        }
      }
    }

    try {
      const payload = {
        tipoConsumo,
        formaPagamento,
        endereco: enderecoFinal,
      }

      const res = await criarPedido(payload, items)
      if (res?.success) {
        clearCart()
        toast.success('Pedido criado! Conclua o pagamento abaixo.', {
          description:
            formaPagamento === 'PIX'
              ? 'Escaneie o QR Code Pix para confirmar o pagamento.'
              : 'Preencha os dados do cartão ou abra o Checkout do Mercado Pago.',
        })
        router.push(`/pedido/${res.pedidoId}`)
      } else {
        toast.error('Erro ao finalizar', {
          description: res?.error || 'Tente novamente.',
        })
      }
    } catch {
      toast.error('Erro ao finalizar pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <form
          id="checkout-form"
          onSubmit={handleFinalizar}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6 text-slate-900"
        >
          <div>
            <h3 className="font-bold text-lg text-slate-800 mb-4">Dados do Pedido</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Retirada
                </label>
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
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                    Onde vamos entregar?
                  </h4>

                  {localEnderecos.length > 0 && (
                    <div className="grid grid-cols-1 gap-3">
                      {localEnderecos.map((end) => (
                        <div
                          key={end.id}
                          onClick={() => setEnderecoSelecionadoId(end.id)}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                            enderecoSelecionadoId === end.id
                              ? 'border-brand bg-orange-50'
                              : 'border-slate-200 bg-white hover:border-brand/50'
                          }`}
                        >
                          <MapPin
                            className={
                              enderecoSelecionadoId === end.id
                                ? 'text-brand'
                                : 'text-slate-400'
                            }
                            size={20}
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-sm mb-1">
                              {end.titulo}
                            </p>
                            <p className="text-xs text-slate-600">
                              {end.rua}, {end.numero} - {end.bairro}
                            </p>
                            {end.complemento && (
                              <p className="text-xs text-slate-500">{end.complemento}</p>
                            )}
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

                  {(enderecoSelecionadoId === 'NOVO' || localEnderecos.length === 0) && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Nome do Local
                          </label>
                          <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
                            placeholder="Casa, Trabalho..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Telefone (WhatsApp) *
                          </label>
                          <input
                            type="text"
                            inputMode="tel"
                            maxLength={15}
                            required={enderecoSelecionadoId === 'NOVO'}
                            value={telefone}
                            onChange={(e) => setTelefone(maskPhone(e.target.value))}
                            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Rua *
                          </label>
                          <input
                            type="text"
                            required={enderecoSelecionadoId === 'NOVO'}
                            value={rua}
                            onChange={(e) => setRua(e.target.value)}
                            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Número *
                          </label>
                          <input
                            type="text"
                            required={enderecoSelecionadoId === 'NOVO'}
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Bairro *
                          </label>
                          <input
                            type="text"
                            required={enderecoSelecionadoId === 'NOVO'}
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Complemento
                          </label>
                          <input
                            type="text"
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
                            placeholder="Ap, Casa 2..."
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <Button
                          type="button"
                          onClick={handleSalvarEndereco}
                          disabled={isSavingAddress}
                          variant="outline"
                          className="w-full font-bold border-brand text-brand hover:bg-orange-50"
                        >
                          {isSavingAddress
                            ? 'Salvando...'
                            : 'Salvar Endereço no Meu Perfil'}
                        </Button>
                        <p className="text-xs text-center text-slate-500 mt-2">
                          Você também pode apenas preencher e Confirmar o Pedido, mas
                          salvar agiliza a próxima compra.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-slate-800">
                    Pagamento Online (Mercado Pago)
                  </label>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    <ShieldCheck size={14} /> Ambiente Seguro
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormaPagamento('PIX')}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                      formaPagamento === 'PIX'
                        ? 'border-brand bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-brand/50'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        formaPagamento === 'PIX'
                          ? 'bg-brand text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <QrCode size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 text-sm">
                          Pix (QR Code na hora)
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Aprovação Imediata
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Gera o QR Code e código Pix Copia e Cola direto na tela do pedido.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormaPagamento('CARTAO_CREDITO')}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                      formaPagamento === 'CARTAO_CREDITO'
                        ? 'border-brand bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-brand/50'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        formaPagamento === 'CARTAO_CREDITO'
                          ? 'bg-brand text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <CreditCard size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 text-sm">
                          Cartão de Crédito
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                          Online
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Pague à vista ou parcele diretamente pelo sistema com segurança.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormaPagamento('CARTAO_DEBITO')}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                      formaPagamento === 'CARTAO_DEBITO'
                        ? 'border-brand bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-brand/50'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        formaPagamento === 'CARTAO_DEBITO'
                          ? 'bg-brand text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <CreditCard size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 text-sm">
                          Cartão de Débito
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          À vista
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Débito online imediato direto na sua conta bancária.
                      </p>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Seu pedido é enviado imediatamente para a fila da cozinha assim que o
                  pagamento for aprovado.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit sticky top-24">
        <h3 className="font-bold text-xl text-slate-800 mb-6">Resumo do Pedido</h3>
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex flex-col text-sm border-b border-slate-200 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-700 font-bold leading-tight">
                  {item.quantidade}x {item.nome}
                </span>
                <span className="font-bold text-slate-800 shrink-0">
                  R$ {(item.precoTotal * item.quantidade).toFixed(2).replace('.', ',')}
                </span>
              </div>
              {(item.removidos.length > 0 || item.adicionais.length > 0) && (
                <div className="pl-4 mt-2 text-xs text-slate-500 space-y-1">
                  {item.removidos.map((rem) => (
                    <div key={rem} className="text-red-500 font-medium">
                      - Sem {rem}
                    </div>
                  ))}
                  {item.adicionais.map((add) => (
                    <div key={add.nome} className="text-green-600 font-medium">
                      + {add.quantidade}x {add.nome}
                    </div>
                  ))}
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
            {tipoConsumo === 'DELIVERY' ? (
              <span className="font-bold">
                {taxaEntrega > 0 ? (
                  `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`
                ) : (
                  <span className="text-emerald-600">Grátis</span>
                )}
              </span>
            ) : (
              <span className="text-slate-400">---</span>
            )}
          </div>
          <div className="flex justify-between items-center font-black text-2xl text-slate-800">
            <span>Total</span>
            <span className="text-brand">
              R${' '}
              {(totalPrice() + (tipoConsumo === 'DELIVERY' ? taxaEntrega : 0))
                .toFixed(2)
                .replace('.', ',')}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting || !lojaAberta}
            className="w-full bg-primary hover:bg-orange-700 h-14 text-lg font-bold text-white rounded-xl shadow-lg shadow-orange-500/20"
          >
            {isSubmitting
              ? 'Processando...'
              : formaPagamento === 'PIX'
                ? 'Gerar QR Code Pix'
                : formaPagamento === 'CARTAO_DEBITO'
                  ? 'Pagar com Cartão de Débito'
                  : 'Pagar com Cartão de Crédito'}
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
