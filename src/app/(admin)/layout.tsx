import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminSidebarClient } from '@/components/admin/AdminSidebarClient'
import { getAdminSession } from '@/lib/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  if (session.cargo === 'CLIENTE') {
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
      <AdminSidebarClient 
        isMaster={session.isMaster} 
        podeCaixa={session.podeCaixa} 
        podeProdutos={session.podeProdutos} 
        podeRelatorios={session.podeRelatorios} 
        userCargo={session.cargo} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
