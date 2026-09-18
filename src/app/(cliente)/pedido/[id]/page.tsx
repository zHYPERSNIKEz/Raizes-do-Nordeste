import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PedidoStatusClient } from '@/components/cliente/PedidoStatusClient'

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()

  // 1. Validar autenticaÃ§Ã£o
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?returnUrl=/pedido/${id}`)
  }

  // 2. Buscar o pedido no banco
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select(`
      id, numero_pedido, cliente_nome, telefone, tipo_consumo, status, criado_em, total, forma_pagamento, pago, endereco,
      itens_pedido ( quantidade, preco_unitario, observacao, produtos(nome, imagem_url) )
    `)
    .eq('id', id)
    .single()

  if (error || !pedido) {
    return notFound()
  }

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8 min-h-screen">
      <PedidoStatusClient pedidoInicial={pedido} />
    </main>
  )
}

