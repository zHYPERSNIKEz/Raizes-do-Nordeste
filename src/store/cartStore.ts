import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AdicionalSelecionado = {
  nome: string
  preco: number
  quantidade: number
}

export type CartItem = {
  cartItemId: string // Identificador único na sacola (para diferenciar o mesmo prato com personalizações diferentes)
  produtoId: string
  nome: string
  precoBase: number
  precoTotal: number // Base + (Adicionais * qtd)
  imagem_url?: string
  quantidade: number
  removidos: string[]
  adicionais: AdicionalSelecionado[]
}

type CartState = {
  items: CartItem[]
  lastUpdated: number | null
  mesa_atual: string | null // Para controle do módulo do garçom
  setMesa: (numero: string | null) => void
  addItem: (item: Omit<CartItem, 'cartItemId' | 'precoTotal'>) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantidade: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastUpdated: null,
      mesa_atual: null,
      setMesa: (numero) => {
        const current = get().mesa_atual;
        if (current !== numero) {
          // Limpa o carrinho se mudar de mesa
          set({ mesa_atual: numero, items: [], lastUpdated: Date.now() })
        }
      },
      addItem: (newItem) => {
        set((state) => {
          const now = Date.now()
          // Calcula o preço dos adicionais
          const adicionaisTotal = newItem.adicionais.reduce((total, add) => total + (add.preco * add.quantidade), 0)
          const precoTotal = newItem.precoBase + adicionaisTotal
          
          // Verifica se já existe um item EXATAMENTE igual (mesmos removidos e adicionais)
          // Isso é avançado, mas para simplificar o MVP, vamos apenas adicionar como nova linha sempre, 
          // a menos que não tenha personalização NENHUMA.
          const temPersonalizacao = newItem.removidos.length > 0 || newItem.adicionais.length > 0
          
          if (!temPersonalizacao) {
            const existingItem = state.items.find(
              (item) => item.produtoId === newItem.produtoId && item.removidos.length === 0 && item.adicionais.length === 0
            )
            
            if (existingItem) {
              return {
                lastUpdated: now,
                items: state.items.map((item) =>
                  item.cartItemId === existingItem.cartItemId 
                    ? { ...item, quantidade: item.quantidade + newItem.quantidade } 
                    : item
                ),
              }
            }
          }

          // Adiciona como nova linha
          return {
            lastUpdated: now,
            items: [
              ...state.items,
              {
                ...newItem,
                cartItemId: crypto.randomUUID(),
                precoTotal
              },
            ],
          }
        })
      },
      removeItem: (cartItemId) => {
        set((state) => ({
          lastUpdated: Date.now(),
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }))
      },
      updateQuantity: (cartItemId, quantidade) => {
        set((state) => {
          if (quantidade <= 0) {
            return { lastUpdated: Date.now(), items: state.items.filter((item) => item.cartItemId !== cartItemId) }
          }
          return {
            lastUpdated: Date.now(),
            items: state.items.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantidade } : item
            ),
          }
        })
      },
      clearCart: () => set({ items: [], lastUpdated: null }),
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantidade, 0)
      },
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.precoTotal * item.quantidade, 0)
      },
    }),
    {
      name: 'raizes-do-nordeste-cart-v1', // chave de persistência do carrinho Raízes do Nordeste
    }
  )
)
