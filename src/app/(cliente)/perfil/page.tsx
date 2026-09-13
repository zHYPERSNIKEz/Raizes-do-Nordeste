import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PerfilForm } from '@/components/cliente/PerfilForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/perfil')
  }

  // Busca os dados adicionais do usuário (telefone e endereço) na tabela perfis
  const { data: perfil } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Meu Perfil</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <PerfilForm user={user} perfilDB={perfil} />
      </div>
    </main>
  )
}
