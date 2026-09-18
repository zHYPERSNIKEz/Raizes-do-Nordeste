import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsuariosListClient } from '@/components/admin/UsuariosListClient'
import { NovoUsuarioForm } from '@/components/admin/NovoUsuarioForm'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/admin/login')
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single()

  const userCargo = perfil?.cargo?.trim().toUpperCase()

  if (userCargo !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-red-500 bg-slate-950 min-h-screen">
        Acesso negado. Apenas administradores podem gerenciar a equipe.
      </div>
    )
  }

  // Traz a lista completa de usuários cadastrados
  const { data: usuarios } = await supabase
    .from('perfis')
    .select('id, nome, cargo, permissoes, criado_em, telefone')
    .order('criado_em', { ascending: false })
    .neq('cargo', 'CLIENTE').limit(100)

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Gestão de Equipe</h1>
        <p className="text-slate-400">
          Gerencie os acessos do sistema. Você pode cadastrar um funcionário e gerenciar permissões específicas por aqui.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UsuariosListClient usuarios={usuarios || []} currentUser={user.id} />
        </div>
        
        <div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sticky top-8">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Cadastrar Funcionário</h2>
            <NovoUsuarioForm />
          </div>
        </div>
      </div>
    </main>
  )
}

