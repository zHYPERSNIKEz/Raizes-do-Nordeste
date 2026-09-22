import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConfiguracoesForm } from '@/components/admin/ConfiguracoesForm'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnUrl=/admin/configuracoes')

  const { data: perfil } = await supabase.from('perfis').select('cargo').eq('id', user.id).single()
  if (perfil?.cargo !== 'ADMIN') return <div className="p-8 text-center text-red-500">Acesso negado.</div>

  // Pega a loja ativa
  const { data: loja } = await supabase.from('lojas').select('*').limit(1).single()

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Configurações da Loja</h1>
        <p className="text-slate-400">
          Altere informações globais, como status de funcionamento (aberta/fechada) e taxas de entrega.
        </p>
      </header>

      {loja ? (
        <ConfiguracoesForm loja={loja} />
      ) : (
        <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
          Nenhuma loja encontrada no banco de dados.
        </div>
      )}
    </main>
  )
}
