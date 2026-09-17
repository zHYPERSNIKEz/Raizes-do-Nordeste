import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { ArrowLeft, Coffee } from 'lucide-react'

export default async function GarcomLayout({ children }: { children: React.ReactNode }) { 
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand font-bold">
            <Coffee size={24} />
            <span className="hidden sm:inline">Painel do Garçom</span>
          </div>

          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-full">
                <ArrowLeft size={16} /> <span className="hidden sm:inline">Vitrine</span>
              </Link>
              <LogoutButton compact />
            </div>
          )}
        </div>
      </header>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
