import { createClient } from '@/lib/supabase/server'
import { HeaderCliente } from '@/components/cliente/HeaderCliente'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let cargo = 'CLIENTE'
  if (user) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('cargo')
      .eq('id', user.id)
      .single()
      
    if (perfil) {
      cargo = perfil.cargo?.trim().toUpperCase() || 'CLIENTE'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col transition-colors">
      <HeaderCliente user={user} cargo={cargo} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
