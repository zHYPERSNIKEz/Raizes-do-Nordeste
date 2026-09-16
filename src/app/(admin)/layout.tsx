import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ChefHat, Package, LogOut, ClipboardList, Users, Settings, Wallet } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/admin/dashboard')
  }

  // Verifica o cargo para garantir segurança
  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single()

  if (perfil?.cargo === 'CLIENTE') {
    return (
      <div className="dark min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <p className="text-red-500 font-bold mb-4">Acesso Negado</p>
        <Link href="/" className="underline text-brand">Voltar para a Loja</Link>
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 font-black text-xl text-brand border-b border-slate-800">
          Admin Panel
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {perfil?.cargo !== 'COZINHA' && (
            <>
              <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link href="/admin/caixa" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                <Wallet size={20} /> Fechamento de Caixa
              </Link>
              <Link href="/admin/pedidos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                <ClipboardList size={20} /> Pedidos
              </Link>
              <Link href="/admin/produtos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                <Package size={20} /> Produtos
              </Link>
              <Link href="/admin/usuarios" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                <Users size={20} /> Equipe / Usuários
              </Link>
              <Link href="/admin/configuracoes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                <Settings size={20} /> Configurações
              </Link>
            </>
          )}
          <Link href="/admin/cozinha" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <ChefHat size={20} /> Kanban Cozinha
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={20} /> Sair / Loja
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}