'use client'

import Link from 'next/link'
import { LogOut, User, ReceiptText } from 'lucide-react'
import { logout } from '@/app/(cliente)/login/actions'
import { CartSidebar } from '@/components/cliente/CartSidebar'
import { ThemeToggle } from '@/components/theme-toggle'

type HeaderClienteProps = {
  user: any
}

export function HeaderCliente({ user }: HeaderClienteProps) {
  const nome = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Cliente'

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 transition-colors shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl md:text-3xl text-primary flex items-center tracking-wide uppercase hover:scale-105 transition-transform">
          Arte Burgueria
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              
              {/* Botão de Meus Pedidos */}
              <Link 
                href="/pedidos" 
                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-foreground bg-secondary hover:bg-primary px-3 md:px-5 py-2 md:py-2.5 rounded-full transition-all uppercase tracking-wider shadow-sm"
              >
                <ReceiptText size={18} className="hidden sm:block" />
                <span className="text-xs md:text-sm">Meus Pedidos</span>
              </Link>
              
              {/* Ícone de Perfil */}
              <Link 
                href="/perfil" 
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:scale-110 transition-transform" 
                title="Meu Perfil"
              >
                <User size={20} />
              </Link>
              
              <button 
                onClick={() => logout()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Sair da conta"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="text-sm font-bold bg-primary hover:scale-105 text-primary-foreground px-6 py-2.5 rounded-full transition-transform shadow-md uppercase tracking-wider"
            >
              Entrar
            </Link>
          )}

          <div className="h-8 w-px bg-border mx-1"></div>
          
          <ThemeToggle />
          <CartSidebar />
        </div>
      </div>
    </header>
  )
}
