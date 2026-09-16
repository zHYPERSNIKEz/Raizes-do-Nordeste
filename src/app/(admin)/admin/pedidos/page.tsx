import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GestaoPedidosClient } from '@/components/admin/GestaoPedidosClient'

export default async function PedidosPage() {
  const supabase = await createClient()

  // 1. Validar autenticação e perfil
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?returnUrl=/admin/pedidos')
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single()

  if (perfil?.cargo === 'CLIENTE' || perfil?.cargo === 'COZINHA') {
    return <div className="p-8 text-center text-red-500">Acesso negado. Apenas administradores e caixa.</div>
  }

  // 2. Pegar a única loja do sistema
  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  
  if (!loja) {
    return <div className="p-8 text-center text-red-500">Erro crítico: Nenhuma loja cadastrada no banco.</div>
  }

  // 3. Buscar os pedidos do dia / recentes (vamos trazer os mais recentes e os ativos)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select(`
      id, cliente_nome, telefone, tipo_consumo, mesa, status, criado_em, total, forma_pagamento, pago, endereco,
      itens_pedido ( quantidade, preco_unitario, observacao, produtos(nome) )
    `)
    .eq('loja_id', loja.id)
    // Traz pedidos que não estão finalizados/cancelados OU que foram criados hoje
    .or(`status.in.(NA_FILA,PREPARANDO,PRONTO,DESPACHADO),criado_em.gte.${hoje.toISOString()}`)
    .order('criado_em', { ascending: false })

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            📋 Gestão de Pedidos (Caixa)
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
