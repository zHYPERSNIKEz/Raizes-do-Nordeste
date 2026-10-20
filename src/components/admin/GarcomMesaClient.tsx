'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { enviarPedidoCozinha } from '@/app/(garcom)/actions'
import { toast } from 'sonner'
import { Plus, Minus, Trash2, X, Search } from 'lucide-react'

export function GarcomMesaClient({ produtos, mesa, lojaId, userId }: any) {
  const router = useRouter()
  
  const [cart, setCart] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [produtoAtivo, setProdutoAtivo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [busca, setBusca] = useState('')

  const [quantidade, setQuantidade] = useState(1)
  const [removidos, setRemovidos] = useState<string[]>([])
  const [adicionais, setAdicionais] = useState<Record<string, number>>({})

  const abrirCustomizador = (p: any) => {
    setProdutoAtivo(p)
    setQuantidade(1)
    setRemovidos([])
    setAdicionais({})
    setModalOpen(true)
  }

  const toggleRemovido = (ing: string) => {
    if (removidos.includes(ing)) setRemovidos(removidos.filter(i => i !== ing))
    else setRemovidos([...removidos, ing])
  }

  const alteraAdicional = (nome: string, delta: number) => {
    const atual = adicionais[nome] || 0
    setAdicionais({ ...adicionais, [nome]: Math.max(0, atual + delta) })
  }

  const addAoCarrinho = () => {
    if (!produtoAtivo) return

    const arrayAdd = Object.entries(adicionais)
      .filter(([_, qtd]) => qtd > 0)
      .map(([nome, qtd]) => {
        const itemAdd = produtoAtivo.adicionais.find((a: any) => a.nome === nome)
        return { nome, preco: itemAdd?.preco || 0, quantidade: qtd }
      })

    const totalAdd = arrayAdd.reduce((sum, a) => sum + (a.preco * a.quantidade), 0)
    const precoUnitario = produtoAtivo.preco + totalAdd

    setCart([...cart, {
      id: Math.random().toString(),
      produtoId: produtoAtivo.id,
      nome: produtoAtivo.nome,
      quantidade,
      precoTotal: precoUnitario,
      removidos,
      adicionais: arrayAdd
    }])

    toast.success(`${quantidade}x ${produtoAtivo.nome} lançado na mesa!`)
    setModalOpen(false)
  }

  const removerDoCarrinho = (cartId: string) => {
    setCart(cart.filter(c => c.id !== cartId))
  }

  const totalCarrinho = cart.reduce((sum, item) => sum + (item.precoTotal * item.quantidade), 0)

  const handleEnviarPedido = async () => {
    if (cart.length === 0) return
    setLoading(true)

    const res = await enviarPedidoCozinha({ mesa }, cart)
    
    if (res.success) {
      toast.success('Pedido enviado para a cozinha!')
      router.push('/garcom')
      router.refresh()
    } else {
      toast.error(res.error || 'Erro ao enviar pedido.')
      setLoading(false)
    }
  }

  const produtosFiltrados = produtos.filter((p: any) => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (p.categoria && p.categoria.toLowerCase().includes(busca.toLowerCase()))
  )

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Lista de Produtos */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-foreground">Cardápio</h2>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Buscar prato ou bebida..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-foreground"
            />
          </div>
        </div>

        {produtosFiltrados.length === 0 ? (
          <div className="p-8 text-center bg-card border border-dashed border-border rounded-xl text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {produtosFiltrados.map((p: any) => (
              <div 
                key={p.id} 
                onClick={() => abrirCustomizador(p)}
                className="bg-card text-card-foreground border border-border rounded-xl overflow-hidden shadow-sm cursor-pointer hover:border-brand transition-all active:scale-95"
              >
                {p.imagem_url ? (
                  <img src={p.imagem_url} alt={p.nome} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-muted flex items-center justify-center text-muted-foreground font-bold">Sem Foto</div>
                )}
                <div className="p-3">
                  <h3 className="font-bold text-sm leading-tight mb-1">{p.nome}</h3>
                  <p className="text-brand font-bold text-sm">R$ {p.preco.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comanda da Mesa */}
      <div className="w-full lg:w-96 shrink-0">
        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm sticky top-20 flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-border bg-muted/30 rounded-t-xl">
            <h2 className="font-bold text-lg">Comanda - Mesa {mesa}</h2>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">A comanda está vazia.<br/>Toque nos produtos ao lado.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-start border-b border-border pb-3">
                  <div>
                    <div className="font-bold text-sm">
                      {item.quantidade}x {item.nome}
                    </div>
                    {item.removidos.length > 0 && (
                      <div className="text-xs text-red-500">Sem: {item.removidos.join(', ')}</div>
                    )}
                    {item.adicionais.length > 0 && item.adicionais.map((a: any) => (
                      <div key={a.nome} className="text-xs text-green-600 dark:text-green-400">+ {a.quantidade}x {a.nome}</div>
                    ))}
                    <div className="text-brand text-xs font-bold mt-1">
                      R$ {(item.precoTotal * item.quantidade).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                  <button onClick={() => removerDoCarrinho(item.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-border bg-muted/30 rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-muted-foreground">Total Parcial</span>
              <span className="font-black text-xl text-brand">R$ {totalCarrinho.toFixed(2).replace('.', ',')}</span>
            </div>
            <Button 
              onClick={handleEnviarPedido} 
              disabled={cart.length === 0 || loading}
              className="w-full bg-brand hover:bg-orange-600 text-white font-bold h-12"
            >
              {loading ? 'Enviando...' : 'Lançar para a Cozinha'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Customizador */}
      {modalOpen && produtoAtivo && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-card text-card-foreground w-full max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 border border-border shadow-2xl">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="font-bold text-lg">{produtoAtivo.nome}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-6">
              {produtoAtivo.ingredientes_base?.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm mb-2">Ingredientes Base (Toque para remover)</h3>
                  <div className="flex flex-wrap gap-2">
                    {produtoAtivo.ingredientes_base.map((ing: string) => {
                      const isRemovido = removidos.includes(ing)
                      return (
                        <button 
                          key={ing}
                          onClick={() => toggleRemovido(ing)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border ${isRemovido ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'}`}
                        >
                          {isRemovido ? `Sem ${ing}` : ing}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {produtoAtivo.adicionais?.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm mb-2">Adicionais</h3>
                  <div className="space-y-2">
                    {produtoAtivo.adicionais.map((add: any) => {
                      const qtd = adicionais[add.nome] || 0
                      return (
                        <div key={add.nome} className="flex items-center justify-between p-2 border border-border rounded-lg">
                          <div>
                            <span className="text-sm font-medium block">{add.nome}</span>
                            <span className="text-xs text-brand">+ R$ {add.preco.toFixed(2).replace('.', ',')}</span>
                          </div>
                          <div className="flex items-center bg-muted/50 border border-border rounded-lg">
                            <button onClick={() => alteraAdicional(add.nome, -1)} className="p-2 text-muted-foreground hover:text-foreground" disabled={qtd === 0}><Minus size={14}/></button>
                            <span className="w-6 text-center text-sm font-bold text-foreground">{qtd}</span>
                            <button onClick={() => alteraAdicional(add.nome, 1)} className="p-2 text-muted-foreground hover:text-foreground"><Plus size={14}/></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-bold text-muted-foreground">Quantidade</span>
                <div className="flex items-center bg-muted/50 border border-border rounded-lg">
                  <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="p-3 text-muted-foreground hover:text-foreground"><Minus size={16}/></button>
                  <span className="w-8 text-center font-bold text-foreground">{quantidade}</span>
                  <button onClick={() => setQuantidade(quantidade + 1)} className="p-3 text-muted-foreground hover:text-foreground"><Plus size={16}/></button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <Button onClick={addAoCarrinho} className="w-full bg-brand hover:bg-orange-600 text-white font-bold h-12">
                Adicionar à Comanda
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
