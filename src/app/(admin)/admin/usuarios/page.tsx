import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsuariosListClient } from '@/components/admin/UsuariosListClient'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?returnUrl=/admin/usuarios')
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single()

  if (perfil?.cargo !== 'ADMIN') {
    return <div className="p-8 text-center text-red-500">Acesso negado. Apenas administradores.</div>
  }

  // Traz a lista completa de usuários cadastrados
  // O ideal em produção seria paginar, mas para MVP traremos os 100 mais recentes
  const { data: usuarios } = await supabase
    .from('perfis')
    .select('id, nome, cargo, criado_em, telefone')
    .order('criado_em', { ascending: false })
    .limit(100)

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Equipe e Usuários</h1>
        <p className="text-slate-400">
          Gerencie os acessos do sistema. Para convidar um funcionário, peça a ele que se cadastre 
          normalmente na loja e depois altere o cargo dele aqui.
        </p>
      </header>

      <UsuariosListClient usuarios={usuarios || []} currentUser={user.id} />
    </main>
  )
}
