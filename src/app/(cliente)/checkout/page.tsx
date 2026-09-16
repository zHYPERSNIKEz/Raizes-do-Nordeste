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

  // Busca as configs da loja
  const { data: loja } = await supabase
    .from('lojas')
    .select('taxa_entrega, aberta')
    .limit(1)
    .single()

  const taxaEntrega = loja?.taxa_entrega ? Number(loja.taxa_entrega) : 0
  const lojaAberta = loja?.aberta !== false

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Finalizar Pedido</h1>
      {!lojaAberta && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">
          A loja está fechada no momento. Você não poderá finalizar o pedido.
        </div>
      )}
      <CheckoutForm user={user} enderecosSalvos={enderecosSalvos} taxaEntrega={taxaEntrega} lojaAberta={lojaAberta} />
    </main>
  )
}
