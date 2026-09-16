'use client'

import { useState } from 'react'
import { abrirCaixa, fecharCaixa, registrarMovimentacao } from '@/app/(admin)/admin/caixa/actions'
import { Wallet, LogIn, LogOut, ArrowDownCircle, ArrowUpCircle, Lock, AlertCircle, Banknote, CreditCard, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function CaixaManager({ lojaId, caixaAtual, pedidos, movimentacoes }: any) {
  const [valorAbertura, setValorAbertura] = useState('0')
  const [loading, setLoading] = useState(false)
  const [showSangria, setShowSangria] = useState(false)
  const [movimentacaoForm, setMovimentacaoForm] = useState({ tipo: 'SANGRIA', valor: '', descricao: '' })
  
  const [showFechamento, setShowFechamento] = useState(false)
  const [valorReal, setValorReal] = useState('')
  const [obsFechamento, setObsFechamento] = useState('')

  const handleAbrirCaixa = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const val = parseFloat(valorAbertura) || 0
    const res = await abrirCaixa(lojaId, val)
    if (res.success) {
      toast.success('Caixa aberto com sucesso!')
    } else {
      toast.error(res.error === 'TABELA_INEXISTENTE' ? 'Rode o script SQL primeiro!' : res.error)
    }
    setLoading(false)
  }

  const handleMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const val = parseFloat(movimentacaoForm.valor)
    if (!val || val <= 0) {
      toast.error('Valor inválido')
      setLoading(false)
      return
    }
    const res = await registrarMovimentacao(caixaAtual.id, movimentacaoForm.tipo as any, val, movimentacaoForm.descricao)
    if (res.success) {
      toast.success('Movimentação registrada!')
      setShowSangria(false)
      setMovimentacaoForm({ tipo: 'SANGRIA', valor: '', descricao: '' })
    } else {
      toast.error('Erro: ' + res.error)
    }
    setLoading(false)
  }

  const handleFecharCaixa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm('Deseja realmente fechar o caixa agora?')) return
    
    setLoading(true)
    const res = await fecharCaixa(caixaAtual.id, totais.saldoFinal, parseFloat(valorReal) || 0, obsFechamento)
    if (res.success) {
      toast.success('Caixa fechado com sucesso!')
      setShowFechamento(false)
    } else {
      toast.error('Erro ao fechar caixa: ' + res.error)
    }
    setLoading(false)
  }

  // Cálculos do Caixa Aberto
  let totais = {
    pix: 0,
    cartao: 0,
    dinheiro: 0,
    vendasTotais: 0,
    sangrias: 0,
    suprimentos: 0,
    saldoFinal: 0, // Abertura + Vendas Dinheiro + Suprimentos - Sangrias
  }

  if (caixaAtual) {
    pedidos.forEach((p: any) => {
      const v = Number(p.total)
      totais.vendasTotais += v
      
      const forma = p.forma_pagamento?.toUpperCase() || ''
      if (forma.includes('PIX')) totais.pix += v
      else if (forma.includes('CART') || forma.includes('CRÉDITO') || forma.includes('DÉBITO')) totais.cartao += v
      else totais.dinheiro += v
    })

    movimentacoes.forEach((m: any) => {
      const v = Number(m.valor)
      if (m.tipo === 'SANGRIA') totais.sangrias += v
      else if (m.tipo === 'SUPRIMENTO') totais.suprimentos += v
    })

    const ab = Number(caixaAtual.valor_abertura)
    // O Saldo em Caixa vivo geralmente considera apenas o Dinheiro recebido, 
    // mas depende de como a loja opera. Vamos calcular o Dinheiro Esperado na Gaveta:
    totais.saldoFinal = ab + totais.dinheiro + totais.suprimentos - totais.sangrias
  }

  if (!caixaAtual) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md mx-auto shadow-lg">
        <div className="flex justify-center mb-6 text-slate-500">
          <Lock size={64} />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-200 mb-2">Caixa Fechado</h2>
        <p className="text-center text-slate-400 mb-8">Nenhum caixa aberto no momento. Informe o fundo de troco para iniciar as vendas.</p>
        
        <form onSubmit={handleAbrirCaixa} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Fundo de Caixa (Troco Inicial)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <input 
                type="number" 
                step="0.01" 
                required
                value={valorAbertura}
                onChange={e => setValorAbertura(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white text-lg focus:border-brand focus:ring-1 focus:ring-brand font-bold"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
            {loading ? 'Abrindo...' : 'Abrir Caixa'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm col-span-1 md:col-span-4 lg:col-span-1">
          <p className="text-sm text-slate-400 font-medium mb-1">Aberto em</p>
          <div className="text-lg font-bold text-slate-200">
            {new Date(caixaAtual.criado_em).toLocaleDateString('pt-BR')} às {new Date(caixaAtual.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="text-xs text-slate-500 mt-2">Troco inicial: R$ {Number(caixaAtual.valor_abertura).toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Smartphone size={20} /> <span className="font-medium">Vendas PIX</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">R$ {totais.pix.toFixed(2).replace('.', ',')}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <CreditCard size={20} /> <span className="font-medium">Vendas Cartão</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">R$ {totais.cartao.toFixed(2).replace('.', ',')}</div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/50 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
            <Banknote size={64} />
          </div>
          <div className="flex items-center gap-3 text-emerald-400 mb-2 relative z-10">
            <Banknote size={20} /> <span className="font-medium">Dinheiro Esperado</span>
          </div>
          <div className="text-3xl font-black text-emerald-400 relative z-10">R$ {totais.saldoFinal.toFixed(2).replace('.', ',')}</div>
          <p className="text-xs text-emerald-500/70 mt-1 relative z-10">(Abertura + Vendas Dinheiro + Suprimentos - Sangrias)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="font-bold text-slate-200">Últimos Pedidos do Turno</h3>
              <span className="text-xs text-slate-500">{pedidos.length} pedidos pagos</span>
            </div>
            <div className="p-0 max-h-[400px] overflow-y-auto">
              {pedidos.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Nenhuma venda registrada neste turno.</div>
              ) : (
                <table className="w-full text-left text-sm text-slate-300">
                  <tbody className="divide-y divide-slate-800/50">
                    {pedidos.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-200">Pedido #{p.id.split('-')[0]}</span>
                          <div className="text-xs text-slate-500">{new Date(p.criado_em).toLocaleTimeString('pt-BR')} • {p.tipo_consumo}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{p.forma_pagamento}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-400">R$ {Number(p.total).toFixed(2).replace('.', ',')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-200">Movimentações</h3>
              <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 bg-slate-900 text-slate-300" onClick={() => setShowSangria(!showSangria)}>
                Nova
              </Button>
            </div>
            
            {showSangria && (
              <form onSubmit={handleMovimentacao} className="p-4 bg-slate-800/50 border-b border-slate-700 space-y-3">
                <div className="flex gap-2">
                  <select 
                    value={movimentacaoForm.tipo} 
                    onChange={e => setMovimentacaoForm({...movimentacaoForm, tipo: e.target.value})}
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-sm flex-1"
                  >
                    <option value="SANGRIA">Sangria (Retirada)</option>
                    <option value="SUPRIMENTO">Suprimento (Entrada)</option>
                  </select>
                  <input 
                    type="number" step="0.01" required placeholder="Valor"
                    value={movimentacaoForm.valor} onChange={e => setMovimentacaoForm({...movimentacaoForm, valor: e.target.value})}
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-sm w-24"
                  />
                </div>
                <input 
                  type="text" required placeholder="Motivo / Descrição"
                  value={movimentacaoForm.descricao} onChange={e => setMovimentacaoForm({...movimentacaoForm, descricao: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-sm"
                />
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="ghost" className="flex-1 text-slate-400" onClick={() => setShowSangria(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading} className="flex-1 bg-brand text-white">Salvar</Button>
                </div>
              </form>
            )}

            <div className="p-0 flex-1 max-h-[250px] overflow-y-auto">
              {movimentacoes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">Nenhuma movimentação registrada.</div>
              ) : (
                <ul className="divide-y divide-slate-800/50">
                  {movimentacoes.map((m: any) => (
                    <li key={m.id} className="p-4 text-sm flex justify-between items-start hover:bg-slate-800/30">
                      <div className="flex gap-3">
                        {m.tipo === 'SANGRIA' ? <ArrowDownCircle className="text-red-400 shrink-0" size={18} /> : <ArrowUpCircle className="text-blue-400 shrink-0" size={18} />}
                        <div>
                          <div className="font-medium text-slate-200">{m.tipo}</div>
                          <div className="text-xs text-slate-500">{m.descricao}</div>
                        </div>
                      </div>
                      <div className="font-bold text-slate-300">R$ {Number(m.valor).toFixed(2).replace('.', ',')}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {!showFechamento ? (
            <Button onClick={() => setShowFechamento(true)} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 text-lg">
              <LogOut className="mr-2" /> Encerrar Turno (Fechar Caixa)
            </Button>
          ) : (
            <form onSubmit={handleFecharCaixa} className="bg-red-950/30 border border-red-900/50 p-5 rounded-xl space-y-4">
              <h4 className="font-bold text-red-400">Confirmar Fechamento</h4>
              <div>
                <label className="block text-xs text-red-300/70 mb-1">Valor Real em Gaveta (Dinheiro Físico)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input 
                    type="number" step="0.01" required
                    value={valorReal} onChange={e => setValorReal(e.target.value)}
                    className="w-full bg-slate-950 border border-red-900/50 rounded-lg py-2 pl-9 pr-3 text-white focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-red-300/70 mb-1">Observações (Faltou troco? Sobrou?)</label>
                <textarea 
                  value={obsFechamento} onChange={e => setObsFechamento(e.target.value)}
                  className="w-full bg-slate-950 border border-red-900/50 rounded-lg p-2 text-white text-sm focus:border-red-500"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 border-red-900/50 text-red-400 hover:bg-red-900/30" onClick={() => setShowFechamento(false)}>Voltar</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-red-600 text-white hover:bg-red-700">Confirmar</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
