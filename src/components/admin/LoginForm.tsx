'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error('Credenciais inválidas.')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">E-mail Corporativo</label>
        <input 
          type="email" 
          name="email" 
          required 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
        <input 
          type="password" 
          name="password" 
          required 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-4 bg-brand hover:bg-orange-600 text-white font-bold h-12">
        {loading ? <Loader2 className="animate-spin" size={24} /> : 'Acessar Sistema'}
      </Button>
    </form>
  )
}
