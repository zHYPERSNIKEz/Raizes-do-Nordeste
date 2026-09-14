'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { fecharContaMesa } from '@/app/(garcom)/actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ItemPedido = {
  produto_id: string
  quantidade: number
  preco_unitario: number
  observacao: string
  produtos: { nome: string }
}

type Pedido = {
  id: string
  total: number
  criado_em: string
  itens_pedido: ItemPedido[]
}

export default function ContaMesaPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = use(params)
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function carregarConta() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
      if (!loja) return

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id, total, criado_em,
          itens_pedido ( quantidade, preco_unitario, observacao, produtos(nome) )
        `)
        .eq('loja_id', loja.id)
        .eq('mesa', numero)
        .eq('pago', false)
        .order('criado_em', { ascending: true })

      if (data) {
        setPedidos(data as unknown as Pedido[])
      }
      setLoading(false)
    }
    carregarConta()
  }, [numero])

  const totalConta = pedidos.reduce((acc, p) => acc + Number(p.total), 0)

  const handleFecharConta = async () => {
    setIsSubmitting(true)
    const res = await fecharContaMesa(numero, formaPagamento)
    
    if (res.success) {
      toast.success(`Conta da Mesa ${numero} fechada com sucesso!`)
      router.push('/garcom')
    } else {
      toast.error('Erro ao fechar conta', { description: res.error })
      setIsSubmitting(false)
    }
  }

  if (loading) return <p className="p-8 text-center text-slate-500">Calculando conta...</p>

  if (pedidos.length === 0) {
    return (
      <main className="max-w-2xl mx-auto p-4 md:p-8 text-center">
        <div className="bg-white p-8 rounded-xl border border-slate-200">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Mesa Livre</h2>
          <p className="text-slate-500 mb-6">Não há pedidos em aberto para a Mesa {numero}.</p>
          <Link href="/garcom">
            <Button variant="outline">Voltar para o Painel</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/garcom/`} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">
          Conta da Mesa <span className="text-brand">{numero}</span>
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">Extrato de Pedidos</h3>
        
        <div className="space-y-6">
          {pedidos.map((pedido, i) => (
            <div key={pedido.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3 text-sm">
                <span className="font-bold text-slate-600">Rodada {i + 1}</span>
                <span className="text-slate-400">{new Date(pedido.criado_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <ul className="space-y-2 mb-3">
                {pedido.itens_pedido.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span>{item.quantidade}x {item.produtos?.nome || 'Item'}</span>
                    <span className="text-slate-600 font-medium">R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center font-black text-2xl text-slate-800">
            <span>Total da Conta:</span>
            <span className="text-brand">R$ {totalConta.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4">Pagamento</h3>
        <select 
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand mb-6"
        >
          <option value="PIX">Pix</option>
          <option value="CARTAO_CREDITO">Cartão de Crédito</option>
          <option value="CARTAO_DEBITO">Cartão de Débito</option>
          <option value="DINHEIRO">Dinheiro</option>
        </select>

        <Button 
          onClick={handleFecharConta}
          disabled={isSubmitting}
          className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? 'Processando...' : 'Receber e Liberar Mesa'}
        </Button>
      </div>
    </main>
  )
}
