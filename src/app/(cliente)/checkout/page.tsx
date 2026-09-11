import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckoutForm } from '@/components/cliente/CheckoutForm'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/checkout')
  }

  // Busca dados adicionais se necessário, mas o user do Supabase já tem email e possivelmente nome no metadata
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Finalizar Pedido</h1>
      <CheckoutForm user={user} />
    </main>
  )
}
