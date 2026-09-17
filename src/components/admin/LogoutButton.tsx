'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Você saiu da conta.')
    router.push('/admin/login')
    router.refresh()
  }

  if (compact) {
    return (
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors text-sm font-medium"
        title="Sair"
      >
        <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
      </button>
    )
  }

  return (
    <button 
      onClick={handleLogout}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
    >
      <LogOut size={20} /> Sair do Sistema
    </button>
  )
}
