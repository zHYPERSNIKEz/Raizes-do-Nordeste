import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ChefHat, Package, ClipboardList, Users, Settings, Wallet, ArrowLeft } from 'lucide-react'
import { LogoutButton } from '@/components/admin/LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Verifica o cargo e permissões para garantir segurança
  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo, permissoes')
    .eq('id', user.id)
    .single()

  const userCargo = perfil?.cargo?.trim().toUpperCase()
  const permissoes = Array.isArray(perfil?.permissoes) ? perfil.permissoes : []

  if (userCargo === 'CLIENTE') {
    return (
      <div className="dark min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <p className="text-red-500 font-bold mb-4">Acesso Negado</p>
        <Link href="/" className="underline text-brand">Voltar para a Loja</Link>
      </div>
    )
  }

  const isMaster = userCargo === 'ADMIN' || userCargo === 'GERENTE'
  const podeCaixa = isMaster || permissoes.includes('acesso_caixa')
  const podeProdutos = isMaster || permissoes.includes('acesso_produtos')
  const podeRelatorios = isMaster || permissoes.includes('acesso_relatorios')

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
<aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="p-6 font-black text-xl text-brand border-b border-slate-800 shrink-0">
          Admin Panel
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {podeRelatorios && (
            <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
          )}

          {podeCaixa && (
            <Link href="/admin/caixa" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Wallet size={20} /> Fechamento de Caixa
            </Link>
          )}
          
          {userCargo !== 'COZINHA' && (
            <Link href="/admin/pedidos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <ClipboardList size={20} /> Pedidos
            </Link>
          )}

          {podeProdutos && (
            <Link href="/admin/produtos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Package size={20} /> Produtos
            </Link>
          )}

          {isMaster && (
            <>
              <Link href="/admin/equipe" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                <Users size={20} /> Equipe
              </Link>
              <Link href="/admin/clientes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                <Users size={20} /> Clientes
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

        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <Link href="/" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} /> Voltar p/ Vitrine
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
