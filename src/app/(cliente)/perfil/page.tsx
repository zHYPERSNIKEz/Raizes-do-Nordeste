import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PerfilForm } from '@/components/cliente/PerfilForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/perfil')
  }

  // Busca os dados adicionais do usuário
  const { data: perfil } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8 min-h-screen">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft size={16} className="mr-1" />
          Voltar ao Cardápio
        </Link>
      </div>
      
      <h1 className="font-display text-4xl text-primary uppercase tracking-wide mb-8">Meu Perfil</h1>
      
      <div className="bg-card p-6 md:p-8 rounded-[2rem] shadow-xl border border-border mb-8 animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">Meus Dados Pessoais</h2>
        <p className="text-muted-foreground mb-8">Atualize seu nome, telefone e salve endereços de entrega para facilitar seus próximos pedidos.</p>
        <PerfilForm user={user} perfilDB={perfil} />
      </div>
    </main>
  )
}
