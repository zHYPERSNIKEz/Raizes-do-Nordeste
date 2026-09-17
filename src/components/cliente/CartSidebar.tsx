'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'

export function CartSidebar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()

  const handleCheckout = () => {
    setOpen(false)
    router.push('/checkout')
  }

  const totalQuantidade = items.reduce((acc, item) => acc + item.quantidade, 0)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="relative p-2 bg-card hover:bg-muted border border-border text-foreground transition-colors rounded-full shadow-sm">
        <ShoppingCart size={24} />
        {totalQuantidade > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-background">
            {totalQuantidade}
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-card border-l-border">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart size={20} />
            Seu Pedido
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Sua sacola está vazia.</p>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Continuar comprando
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-border pb-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-border">
                  {item.imagem_url ? (
                    <img src={item.imagem_url} alt={item.nome} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem Foto</span>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-foreground text-sm leading-tight pr-2">{item.nome}</h4>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {item.removidos.length > 0 && (
                    <p className="text-xs text-destructive mt-1">Sem: {item.removidos.join(', ')}</p>
                  )}
                  
                  {item.adicionais.length > 0 && (
                    <div className="mt-1">
                      {item.adicionais.map((add, i) => (
                        <p key={i} className="text-xs text-green-600 dark:text-green-400">
                          + {add.quantidade}x {add.nome}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <div className="flex items-center bg-background rounded-lg border border-border">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantidade - 1))}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-foreground">{item.quantidade}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-brand">
                      R$ {((item.precoBase + item.adicionais.reduce((sum, a) => sum + (a.preco * a.quantidade), 0)) * item.quantidade).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground font-medium">Total</span>
              <span className="text-2xl font-black text-brand">
                R$ {getTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-orange-700 text-primary-foreground font-bold h-12 text-lg border-0"
              onClick={handleCheckout}
            >
              Finalizar Pedido
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
