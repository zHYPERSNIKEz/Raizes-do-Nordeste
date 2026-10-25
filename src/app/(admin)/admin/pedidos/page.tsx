import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GestaoPedidosClient } from '@/components/admin/GestaoPedidosClient'
import { getAdminSession, getLojaUnica } from '@/lib/admin'

export const revalidate = 0

export default async function PedidosPage() {
  const [session, loja] = await Promise.all([
    getAdminSession(),
    getLojaUnica(),
  ])

  if (!session) {
    redirect('/admin/login?returnUrl=/admin/pedidos')
  }

  if (session.cargo === 'CLIENTE' || session.cargo === 'COZINHA') {
    return (
      <div className="p-8 text-center text-red-500">
        Acesso negado. Apenas administradores e caixa.
      </div>
    )
  }

  if (!loja) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro crítico: Nenhuma loja cadastrada no banco.
      </div>
    )
  }

  const supabase = await createClient()

  // Buscar os pedidos do dia / recentes (traz os mais recentes e os ativos)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select(`
      id, numero_pedido, cliente_nome, telefone, tipo_consumo, mesa, status, criado_em, total, forma_pagamento, pago, endereco,
      itens_pedido ( quantidade, preco_unitario, observacao, produtos(nome) )
    `)
    .eq('loja_id', loja.id)
    .or(`status.in.(NA_FILA,PREPARANDO,PRONTO,DESPACHADO),criado_em.gte.${hoje.toISOString()}`)
    .order('criado_em', { ascending: false })

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            Gestão de Pedidos (Caixa)
          </h1>
          <p className="text-slate-400 mt-2">
            Acompanhe todos os pedidos da loja, gerencie entregas e confirmação de pagamentos.
          </p>
        </header>

        <GestaoPedidosClient pedidosIniciais={pedidos || []} lojaId={loja.id} />
      </div>
    </main>
  )
}
