import { HeaderCliente } from '@/components/cliente/HeaderCliente'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

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
      <HeaderCliente user={user} cargo={role} />
      <div className="flex-1">
        {children}
      </div>
      
      <footer className="bg-card border-t border-border mt-auto py-8 px-6 text-center text-muted-foreground text-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Raízes do Nordeste. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <Link
              href="/privacidade"
              className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary font-semibold underline underline-offset-4 transition-colors"
            >
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
              Política de Privacidade e LGPD
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
