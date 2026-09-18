import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/admin/DashboardClient'
import { subDays, startOfDay, endOfDay, parseISO } from 'date-fns'

export const revalidate = 0 

export default async function DashboardPage(props: { searchParams: Promise<{ inicio?: string; fim?: string; periodo?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: perfil } = await supabase.from('perfis').select('cargo, permissoes').eq('id', user.id).single()
  const cargo = perfil?.cargo?.trim().toUpperCase()
  const permissoes = Array.isArray(perfil?.permissoes) ? perfil.permissoes : []

  if (cargo !== 'ADMIN' && cargo !== 'GERENTE' && !permissoes.includes('acesso_relatorios')) {
    return <div className="p-8 text-center text-red-500">Acesso negado. Você não tem permissão para visualizar o relatório.</div>
  }

  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()

  let query = supabase
    .from('pedidos')
    .select('id, total, criado_em, itens')
    .eq('loja_id', loja?.id)
    .eq('pago', true)

  const periodo = searchParams.periodo || '30d'

  if (periodo === 'tudo') {
    // Busca tudo, sem filtro de data
  } else if (periodo === 'custom' && searchParams.inicio && searchParams.fim) {
    query = query.gte('criado_em', startOfDay(parseISO(searchParams.inicio)).toISOString())
    query = query.lte('criado_em', endOfDay(parseISO(searchParams.fim)).toISOString())
  } else if (periodo === '7d') {
    query = query.gte('criado_em', startOfDay(subDays(new Date(), 7)).toISOString())
  } else if (periodo === 'hoje') {
    query = query.gte('criado_em', startOfDay(new Date()).toISOString())
  } else {
    // Default 30 dias
    const trintaDiasAtras = startOfDay(subDays(new Date(), 30)).toISOString()
    query = query.gte('criado_em', trintaDiasAtras)
  }

  const { data: pedidos } = await query.order('criado_em', { ascending: true })

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Dashboard de Vendas</h1>
        <p className="text-slate-400 mt-1">Acompanhe o desempenho da sua hamburgueria.</p>
      </header>

      <DashboardClient pedidos={pedidos || []} periodoAtual={periodo} inicioAtual={searchParams.inicio} fimAtual={searchParams.fim} />
    </main>
  )
}

