import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckoutForm } from '@/components/cliente/CheckoutForm'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/checkout')
  }

  // Busca os endereços salvos do perfil
  const { data: perfil } = await supabase
    .from('perfis')
    .select('enderecos_salvos')
    .eq('id', user.id)
    .single()

  const enderecosSalvos = perfil?.enderecos_salvos || []

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Finalizar Pedido</h1>
      <CheckoutForm user={user} enderecosSalvos={enderecosSalvos} />
    </main>
  )
}
