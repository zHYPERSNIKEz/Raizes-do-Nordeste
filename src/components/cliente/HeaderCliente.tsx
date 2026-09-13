'use client'

import Link from 'next/link'
import { ShoppingCart, LogOut, User } from 'lucide-react'
import { logout } from '@/app/(cliente)/login/actions'
import { CartSidebar } from '@/components/cliente/CartSidebar'
import { ThemeToggle } from '@/components/theme-toggle'

type HeaderClienteProps = {
  user: any
}

export function HeaderCliente({ user }: HeaderClienteProps) {
  const nome = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Cliente'

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-brand flex items-center gap-2">
          {/* Pode adicionar uma logo aqui futuramente */}
          🍔 Arte Hamburgueria
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/perfil" className="text-sm font-medium text-slate-700 hover:text-primary cursor-pointer hidden sm:inline-flex items-center gap-2 transition-colors">
                <User size={16} className="text-slate-400" />
                Olá, {nome}
              </Link>
              
              <button 
                onClick={() => logout()}
                className="text-sm text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
                title="Sair da conta"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="text-sm font-bold bg-primary hover:bg-orange-700 text-white px-5 py-2 rounded-full transition-colors shadow-sm"
            >
              Entrar / Cadastrar
            </Link>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          
          <ThemeToggle />
          <CartSidebar />
        </div>
      </div>
    </header>

  )
}
