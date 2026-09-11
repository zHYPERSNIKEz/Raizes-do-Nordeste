'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'

type ProdutoData = {
  id: string
  nome: string
  preco: number
  imagem_url?: string
  ingredientes_base: string[]
  adicionais: { nome: string, preco: number }[]
}

export function CustomizadorLanche({ produto }: { produto: ProdutoData }) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  
  // Controle do que o cliente removeu
  const [removidos, setRemovidos] = useState<string[]>([])
  
  // Controle dos adicionais (mapa de nome -> quantidade)
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<Record<string, number>>({})
  
  // Controle de quantidade do próprio lanche
  const [quantidade, setQuantidade] = useState(1)

  const toggleRemocao = (ingrediente: string) => {
    if (removidos.includes(ingrediente)) {
      setRemovidos(removidos.filter(i => i !== ingrediente)) // Coloca de volta
    } else {
      setRemovidos([...removidos, ingrediente]) // Tira do lanche
    }
  }

  const alteraAdicional = (nome: string, delta: number) => {
    const atual = adicionaisSelecionados[nome] || 0
    const novo = Math.max(0, atual + delta)
    
    setAdicionaisSelecionados(prev => ({
      ...prev,
      [nome]: novo
    }))
  }

  // Preço do lanche base * quantidade + Preço total dos adicionais * quantidade
  const totalAdicionaisUnidade = produto.adicionais.reduce((sum, add) => {
    const qtdAdd = adicionaisSelecionados[add.nome] || 0
    return sum + (add.preco * qtdAdd)
  }, 0)
  
  const precoTotalUnidade = produto.preco + totalAdicionaisUnidade
  const precoFinal = precoTotalUnidade * quantidade

  const handleAdicionar = () => {
    // Formatar os adicionais para o formato do cartStore
    const arrayAdicionais = Object.entries(adicionaisSelecionados)
      .filter(([_, qtd]) => qtd > 0)
      .map(([nome, qtd]) => {
        const itemAdd = produto.adicionais.find(a => a.nome === nome)
        return {
          nome,
          preco: itemAdd?.preco || 0,
          quantidade: qtd
        }
      })

    addItem({
      produtoId: produto.id,
      nome: produto.nome,
      precoBase: produto.preco,
      imagem_url: produto.imagem_url,
      quantidade,
      removidos,
      adicionais: arrayAdicionais
    })

    // Dá um feedback rápido e volta pra home (Vitrine)
    alert('Adicionado à sacola!')
    router.push('/')
  }

  return (
    <div className="space-y-8">
      {/* SEÇÃO 1: O QUE VEM (Remoções) */}
      {produto.ingredientes_base.length > 0 && (
        <section>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3">O que vem no lanche?</h3>
          <p className="text-sm text-slate-500 mb-4">Se não quiser algum item, basta desmarcar.</p>
          <div className="flex flex-wrap gap-2">
            {produto.ingredientes_base.map(ing => {
              const removido = removidos.includes(ing)
              return (
                <button
                  key={ing}
                  onClick={() => toggleRemocao(ing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    removido 
                    ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900' 
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900'
                  }`}
                >
                  {removido ? <Minus size={14} /> : <Check size={14} />}
                  {ing} {removido && <span className="text-xs opacity-80">(Sem)</span>}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* SEÇÃO 2: ADICIONAIS */}
      {produto.adicionais.length > 0 && (
        <section>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3">Turbine seu pedido</h3>
          <p className="text-sm text-slate-500 mb-4">Deseja colocar um extra?</p>
          
          <div className="space-y-3">
            {produto.adicionais.map(add => {
              const qtd = adicionaisSelecionados[add.nome] || 0
              return (
                <div key={add.nome} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-100 block">{add.nome}</span>
                    <span className="text-sm text-primary">+ R$ {Number(add.preco).toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  <div className="flex items-center bg-white dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm">
                    <button 
                      onClick={() => alteraAdicional(add.nome, -1)}
                      className="p-2 text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
                      disabled={qtd === 0}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-800 dark:text-slate-100">
                      {qtd}
                    </span>
                    <button 
                      onClick={() => alteraAdicional(add.nome, 1)}
                      className="p-2 text-slate-500 hover:text-primary transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* RODAPÉ FLUTUANTE / AÇÃO */}
      <div className="sticky bottom-4 left-0 right-0 mt-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between z-10">
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Quantidade:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg">
            <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="p-3 hover:text-primary transition-colors">
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-bold text-lg">{quantidade}</span>
            <button onClick={() => setQuantidade(quantidade + 1)} className="p-3 hover:text-primary transition-colors">
              <Plus size={16} />
            </button>
          </div>
        </div>

        <Button 
          onClick={handleAdicionar}
          className="w-full sm:w-auto bg-primary hover:bg-orange-700 text-white font-bold h-14 px-8 text-lg rounded-xl flex items-center gap-2"
        >
          <ShoppingCart size={20} />
          <span>Adicionar • R$ {precoFinal.toFixed(2).replace('.', ',')}</span>
        </Button>
      </div>
    </div>
  )
}
