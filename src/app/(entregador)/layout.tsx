import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { Bike } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function EntregadorLayout({ children }: { children: React.ReactNode }) { 
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand font-bold text-lg">
            <Bike size={24} />
            <span>Painel do Entregador</span>
          </div>

          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <LogoutButton compact />
            </div>
          )}
        </div>
      </header>
      <div className="flex-1 w-full max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  )
}
