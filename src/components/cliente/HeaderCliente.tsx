'use client'

import Link from 'next/link'
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CartSidebar } from '@/components/cliente/CartSidebar'
import { ThemeToggle } from '@/components/theme-toggle'

type HeaderClienteProps = {
  user: any
  cargo?: string
}

export function HeaderCliente({ user, cargo = 'CLIENTE' }: HeaderClienteProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Você saiu da conta.')
    router.push('/')
    router.refresh()
  }

  const isStaff = cargo !== 'CLIENTE'
  
  const getPanelRoute = () => {
    if (cargo === 'GARCOM') return '/garcom'
    if (cargo === 'COZINHA') return '/admin/cozinha'
    return '/admin/dashboard'
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        <Link href="/" className="font-black text-2xl tracking-tighter text-brand hover:scale-105 transition-transform">
          ARTE<span className="text-white font-medium">.</span>
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              {isStaff ? (
                <Link 
                  href={getPanelRoute()}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-brand/20 text-brand rounded-full hover:bg-brand/30 transition-colors font-bold text-xs md:text-sm"
                  title="Acessar Painel"
                >
                  <ShieldAlert size={16} />
                  <span className="hidden sm:inline">Painel do {cargo}</span>
                  <span className="sm:hidden">Painel</span>
                </Link>
              ) : (
                <Link 
                  href="/pedidos"
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
                  title="Histórico de Pedidos"
                >
                  <span className="text-xs md:text-sm font-medium">Meus Pedidos</span>
                </Link>
              )}

              <Link 
                href="/perfil"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                title="Meu Perfil"
              >
                <UserIcon size={18} className="text-slate-300" />
              </Link>

              <button 
                onClick={handleLogout}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                title="Sair da conta"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="text-sm font-bold bg-brand hover:bg-orange-600 text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full transition-colors"
            >
              Entrar
            </Link>
          )}

          <div className="h-8 w-px bg-slate-700 mx-1 md:mx-2 hidden sm:block"></div>
          
          <ThemeToggle />
          <CartSidebar />
        </div>
      </div>
    </header>
  )
}
