import { HeaderCliente } from '@/components/cliente/HeaderCliente'
import { createClient } from '@/lib/supabase/server'

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let role = 'CLIENTE'
  
  if (user) {
    const { data } = await supabase
      .from('perfis')
      .select('cargo')
      .eq('id', user.id)
      .single()
      
    if (data?.cargo) {
      role = data.cargo.trim().toUpperCase()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
      <HeaderCliente role={role} />
      <div className="flex-1">
        {children}
      </div>
      
      <footer className="bg-card border-t border-border mt-auto py-8 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Arte Burgueria. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
