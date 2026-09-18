import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'


export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: perfil } = await supabase.from('perfis').select('cargo, permissoes').eq('id', user.id).single()
  const cargo = perfil?.cargo?.trim().toUpperCase()
  const permissoes = Array.isArray(perfil?.permissoes) ? perfil.permissoes : []

  if (cargo !== 'ADMIN' && cargo !== 'GERENTE' && !permissoes.includes('acesso_relatorios')) {
    return <div className="p-8 text-center text-red-500">Acesso negado. Você não tem permissão para visualizar o relatório.</div>
  }

  // Placeholder para o dashboard
  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Resumo das vendas e relatórios (Em breve).</p>
      </header>

      <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
        Gráficos e estatísticas em desenvolvimento.
      </div>
    </main>
  )
}

