import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CozinhaKanban } from '@/components/admin/CozinhaKanban'
import { getAdminSession, getLojaUnica } from '@/lib/admin'

export const revalidate = 0

export default async function CozinhaPage() {
  const [session, loja] = await Promise.all([
    getAdminSession(),
    getLojaUnica(),
  ])

  if (!session) {
    redirect('/login?returnUrl=/admin/cozinha')
  }

  if (session.cargo === 'CLIENTE') {
    return (
      <div className="p-8 text-center text-red-500">
        Acesso negado. Apenas funcionários.
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

  // Buscar os pedidos ativos; pedidos online só entram na fila após pagamento aprovado
  const { data: pedidosBrutos } = await supabase
    .from('pedidos')
    .select(
      `
      id, numero_pedido, cliente_nome, tipo_consumo, mesa, status, pago, criado_em,
      itens_pedido ( quantidade, observacao, produtos(nome) )
    `
    )
    .eq('loja_id', loja.id)
    .in('status', ['NA_FILA', 'PREPARANDO', 'PRONTO'])
    .order('criado_em', { ascending: true })

  const pedidos = (pedidosBrutos || []).filter(
    (p: any) =>
      p.pago === true ||
      p.tipo_consumo === 'LOCAL' ||
      p.tipo_consumo === 'MESA'
  )

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            🍳 Kanban da Cozinha
          </h1>
          <p className="text-slate-500 mt-2">
            Pedidos online entram automaticamente na fila &quot;Na Fila&quot; assim que o
            pagamento via Mercado Pago é aprovado. Mantenha o áudio ligado.
          </p>
        </header>

        <CozinhaKanban initialPedidos={(pedidos as any) || []} lojaId={loja.id} />
      </div>
    </main>
  )
}
