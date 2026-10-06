'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, ChefHat, Package, ClipboardList, Users, Settings, Wallet, ArrowLeft } from 'lucide-react'
import { LogoutButton } from '@/components/admin/LogoutButton'

type AdminSidebarProps = {
  isMaster: boolean
  podeCaixa: boolean
  podeProdutos: boolean
  podeRelatorios: boolean
  userCargo: string
}

export function AdminSidebarClient({ isMaster, podeCaixa, podeProdutos, podeRelatorios, userCargo }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: podeRelatorios },
    { href: '/admin/caixa', icon: Wallet, label: 'Fechamento de Caixa', show: podeCaixa },
    { href: '/admin/pedidos', icon: ClipboardList, label: 'Pedidos', show: userCargo !== 'COZINHA' },
    { href: '/admin/produtos', icon: Package, label: 'Produtos', show: podeProdutos },
    { href: '/admin/equipe', icon: Users, label: 'Equipe', show: isMaster },
    { href: '/admin/clientes', icon: Users, label: 'Clientes', show: isMaster },
    { href: '/admin/configuracoes', icon: Settings, label: 'Configurações', show: isMaster },
    { href: '/admin/cozinha', icon: ChefHat, label: 'Kanban Cozinha', show: true },
  ]

  const NavItem = ({ href, icon: Icon, label }: any) => {
    const active = pathname === href
    return (
      <Link 
        href={href} 
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          active 
            ? 'bg-brand/15 text-brand font-bold shadow-sm' 
            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
        }`}
      >
        <Icon size={20} className={active ? 'text-brand' : ''} /> {label}
      </Link>
    )
  }

  return (
    <>
      {/* Topbar Mobile */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40 shadow-md relative">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-slate-300 hover:text-white p-2.5 bg-slate-800/80 rounded-xl transition-colors active:scale-95 relative z-10"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="font-black text-xl text-brand tracking-wide">Admin Panel</div>
        </div>

        {/* Espaçador invisível para não quebrar o justify-between */}
        <div className="w-10"></div>
      </div>

      {/* Overlay Escuro para Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-50 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0
        w-[280px] md:w-64 transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-y-auto
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:block p-6 font-black text-xl text-brand border-b border-slate-800 shrink-0 tracking-wide">
          Admin Panel
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 mt-2 md:mt-0">
          {navLinks.filter(l => l.show).map(link => (
            <NavItem key={link.href} {...link} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-2 shrink-0">
          <Link href="/" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} /> Voltar p/ Vitrine
          </Link>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
