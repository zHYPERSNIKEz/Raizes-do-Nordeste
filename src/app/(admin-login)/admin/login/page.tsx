import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/LoginForm'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('cargo')
      .eq('id', user.id)
      .single()

    const cargo = perfil?.cargo?.trim().toUpperCase()

    if (cargo === 'COZINHA') {
      redirect('/admin/cozinha')
    } else if (cargo === 'GARCOM') {
      redirect('/garcom')
    } else if (cargo === 'ENTREGADOR') {
      redirect('/entregador')
    } else if (cargo && cargo !== 'CLIENTE') {
      redirect('/admin/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-brand mb-2">Restrito</h1>
          <p className="text-slate-400">Acesso exclusivo para funcionários</p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
