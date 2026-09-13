'use client'

import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function CartSidebar() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Prevent hydration mismatch for zustand persist
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="relative p-2 text-slate-700 hover:text-brand transition-colors">
        <ShoppingCart size={24} />
      </button>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="relative p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors rounded-full shadow-sm">
        <ShoppingCart size={24} />
        {totalItems() > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
            {totalItems()}
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white dark:bg-slate-950 border-l-slate-200 dark:border-l-slate-800">
        <SheetHeader>
          <SheetTitle className="text-left text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-4">
            Seu Pedido
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
              <ShoppingCart size={48} className="text-slate-300 dark:text-slate-600" />
              <p>Sua sacola está vazia.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId} className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                {item.imagem_url ? (
                  <img src={item.imagem_url} alt={item.nome} className="w-20 h-20 object-cover rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-slate-400">Sem foto</span>
                  </div>
                )}
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{item.nome}</h4>
                    
                    {/* Exibe customizações se houver */}
                    {(item.removidos.length > 0 || item.adicionais.length > 0) && (
                      <div className="mt-1 mb-2 text-xs text-slate-500 dark:text-slate-400">
                        {item.removidos.map(rem => (
                          <div key={rem} className="text-red-500">- Sem {rem}</div>
                        ))}
                        {item.adicionais.map(add => (
                          <div key={add.nome} className="text-green-600 dark:text-green-500">
                            + {add.quantidade}x {add.nome}
                          </div>
                        ))}
                      </div>
                    )}

                    <span className="text-primary font-bold text-sm block mt-1">
                      R$ {Number(item.precoTotal).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantidade - 1)}
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">
                        {item.quantidade}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantidade + 1)}
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-auto">
            <div className="w-full flex flex-col gap-4">
              <div className="flex justify-between items-center text-lg font-bold text-slate-800 dark:text-slate-100">
                <span>Total:</span>
                <span>R$ {totalPrice().toFixed(2).replace('.', ',')}</span>
              </div>
              
              <Link 
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full bg-brand hover:bg-orange-700 text-white font-bold h-12 text-lg flex items-center justify-center rounded-lg transition-colors"
              >
                Finalizar Pedido <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
