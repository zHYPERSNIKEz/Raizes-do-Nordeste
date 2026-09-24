'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import { toast } from 'sonner'

type ProdutoData = {
  id: string
  nome: string
  preco: number
  imagem_url?: string
  ingredientes_base: string[]
  adicionais: { nome: string, preco: number }[]
  grupos?: {
    id: string
    nome: string
    obrigatorio: boolean
    min_escolhas: number
    max_escolhas: number
    itens: { id: string, nome: string, preco: number }[]
  }[]
}

export function CustomizadorLanche({ produto }: { produto: ProdutoData }) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  
  const [removidos, setRemovidos] = useState<string[]>([])
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<Record<string, number>>({})
  const [escolhasGrupos, setEscolhasGrupos] = useState<Record<string, string[]>>({})
  const [quantidade, setQuantidade] = useState(1)

  const toggleRemocao = (ingrediente: string) => {
    if (removidos.includes(ingrediente)) {
      setRemovidos(removidos.filter(i => i !== ingrediente))
    } else {
      setRemovidos([...removidos, ingrediente])
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

  const toggleEscolhaGrupo = (grupoId: string, itemId: string, maxEscolhas: number) => {
    setEscolhasGrupos(prev => {
      const escolhasAtuais = prev[grupoId] || []
      
      // Se for rádio (max = 1)
      if (maxEscolhas === 1) {
        return { ...prev, [grupoId]: [itemId] }
      }
      
      // Se for checkbox e já está selecionado, remove
      if (escolhasAtuais.includes(itemId)) {
        return { ...prev, [grupoId]: escolhasAtuais.filter(id => id !== itemId) }
      }
      
      // Se for checkbox e não atingiu o limite, adiciona
      if (escolhasAtuais.length < maxEscolhas) {
        return { ...prev, [grupoId]: [...escolhasAtuais, itemId] }
      }
      
      // Se atingiu o limite, não faz nada
      return prev
    })
  }

  const totalAdicionaisUnidade = produto.adicionais.reduce((sum, add) => {
    const qtdAdd = adicionaisSelecionados[add.nome] || 0
    return sum + (add.preco * qtdAdd)
  }, 0)

  // Somar preço das escolhas dos grupos
  const totalGruposUnidade = (produto.grupos || []).reduce((sum, grupo) => {
    const escolhas = escolhasGrupos[grupo.id] || []
    const valorEscolhas = escolhas.reduce((subSum, itemId) => {
      const item = grupo.itens.find(i => i.id === itemId)
      return subSum + (item ? Number(item.preco) : 0)
    }, 0)
    return sum + valorEscolhas
  }, 0)
  
  const precoTotalUnidade = produto.preco + totalAdicionaisUnidade + totalGruposUnidade
  const precoFinal = precoTotalUnidade * quantidade

  const handleAdicionar = () => {
    // Validação de grupos obrigatórios
    if (produto.grupos) {
      for (const grupo of produto.grupos) {
        const escolhas = escolhasGrupos[grupo.id] || []
        if (grupo.obrigatorio && escolhas.length < grupo.min_escolhas) {
          toast.error(`Escolha obrigatória: ${grupo.nome}`, {
            description: `Selecione pelo menos ${grupo.min_escolhas} opção.`
          })
          return
        }
      }
    }

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

    // Adicionar as escolhas de grupos como se fossem adicionais no carrinho
    if (produto.grupos) {
      for (const grupo of produto.grupos) {
        const escolhas = escolhasGrupos[grupo.id] || []
        for (const itemId of escolhas) {
          const item = grupo.itens.find(i => i.id === itemId)
          if (item) {
            arrayAdicionais.push({
              nome: `${grupo.nome}: ${item.nome}`,
              preco: Number(item.preco),
              quantidade: 1
            })
          }
        }
      }
    }

    addItem({
      produtoId: produto.id,
      nome: produto.nome,
      precoBase: produto.preco,
      imagem_url: produto.imagem_url,
      quantidade,
      removidos,
      adicionais: arrayAdicionais
    })

    toast.success('Adicionado à sacola com sucesso!', {
      description: `${quantidade}x ${produto.nome}`
    })
    router.push('/')
  }

  return (
    <div className="space-y-8">
      
      {produto.grupos && produto.grupos.length > 0 && (
        <div className="space-y-6">
          {produto.grupos.map(grupo => {
            const escolhasAtuais = escolhasGrupos[grupo.id] || []
            const atingiuMaximo = escolhasAtuais.length >= grupo.max_escolhas
            const isRadio = grupo.max_escolhas === 1

            return (
              <section key={grupo.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      {grupo.nome}
                      {grupo.obrigatorio && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-bold tracking-wider">Obrigatório</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRadio 
                        ? 'Escolha 1 opção' 
                        : `Escolha ${grupo.min_escolhas === grupo.max_escolhas ? grupo.max_escolhas : `de ${grupo.min_escolhas} até ${grupo.max_escolhas}`} opções`
                      }
                    </p>
                  </div>
                  {!isRadio && (
                    <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                      {escolhasAtuais.length} / {grupo.max_escolhas}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  {grupo.itens.map(item => {
                    const isSelecionado = escolhasAtuais.includes(item.id)
                    const desabilitado = !isSelecionado && atingiuMaximo && !isRadio

                    return (
                      <label 
                        key={item.id}
                        className={`flex justify-between items-center p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelecionado 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                            : 'border-border bg-card hover:border-primary/50'
                        } ${desabilitado ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => {
                          if (desabilitado) e.preventDefault()
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type={isRadio ? 'radio' : 'checkbox'} 
                            name={`grupo-${grupo.id}`}
                            checked={isSelecionado}
                            onChange={() => !desabilitado && toggleEscolhaGrupo(grupo.id, item.id, grupo.max_escolhas)}
                            disabled={desabilitado}
                            className={`w-5 h-5 text-primary border-slate-300 focus:ring-primary ${isRadio ? 'rounded-full' : 'rounded'}`}
                          />
                          <span className={`font-medium ${isSelecionado ? 'text-foreground' : 'text-foreground/80'}`}>
                            {item.nome}
                          </span>
                        </div>
                        {Number(item.preco) > 0 && (
                          <span className="text-sm font-semibold text-primary">
                            + R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {produto.ingredientes_base.length > 0 && (
        <section>
          <h3 className="font-bold text-lg text-foreground mb-3">O que vem no lanche?</h3>
          <p className="text-sm text-muted-foreground mb-4">Se não quiser algum item, basta desmarcar.</p>
          <div className="flex flex-wrap gap-2">
            {produto.ingredientes_base.map(ing => {
              const removido = removidos.includes(ing)
              return (
                <button
                  key={ing}
                  onClick={() => toggleRemocao(ing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    removido 
                    ? 'border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20' 
                    : 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20'
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

      {produto.adicionais.length > 0 && (
        <section>
          <h3 className="font-bold text-lg text-foreground mb-3">Turbine seu pedido</h3>
          <p className="text-sm text-muted-foreground mb-4">Deseja colocar um extra?</p>
          
          <div className="space-y-3">
            {produto.adicionais.map(add => {
              const qtd = adicionaisSelecionados[add.nome] || 0
              return (
                <div key={add.nome} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div>
                    <span className="font-medium text-card-foreground block">{add.nome}</span>
                    <span className="text-sm text-primary">+ R$ {Number(add.preco).toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  <div className="flex items-center bg-background rounded-lg border border-border shadow-sm">
                    <button 
                      onClick={() => alteraAdicional(add.nome, -1)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                      disabled={qtd === 0}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-foreground">
                      {qtd}
                    </span>
                    <button 
                      onClick={() => alteraAdicional(add.nome, 1)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
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

      <div className="sticky bottom-4 left-0 right-0 mt-8 bg-card border border-border shadow-xl rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between z-10">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-sm text-muted-foreground font-medium">Quantidade:</span>
          <div className="flex items-center bg-background border border-border rounded-lg">
            <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="p-3 text-muted-foreground hover:text-primary transition-colors">
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-bold text-lg text-foreground">{quantidade}</span>
            <button onClick={() => setQuantidade(quantidade + 1)} className="p-3 text-muted-foreground hover:text-primary transition-colors">
              <Plus size={16} />
            </button>
          </div>
        </div>

        <Button 
          onClick={handleAdicionar}
          className="w-full sm:w-auto bg-primary hover:bg-orange-700 text-primary-foreground font-bold h-14 px-8 text-lg rounded-xl flex items-center gap-2 border-0"
        >
          <ShoppingCart size={20} />
          <span>Adicionar • R$ {precoFinal.toFixed(2).replace('.', ',')}</span>
        </Button>
      </div>
    </div>
  )
}
