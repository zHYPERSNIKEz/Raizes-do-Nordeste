import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminSidebarClient } from '@/components/admin/AdminSidebarClient'

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
<AdminSidebarClient 
        isMaster={isMaster} 
        podeCaixa={podeCaixa} 
        podeProdutos={podeProdutos} 
        podeRelatorios={podeRelatorios} 
        userCargo={userCargo || ''} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
