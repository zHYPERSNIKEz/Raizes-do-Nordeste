import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EntregadorPainelClient } from '@/components/entregador/EntregadorPainelClient'

export const dynamic = 'force-dynamic'

export default async function EntregadorPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/admin/login')
  }

  // Verifica se o usurio  Entregador ou Admin
  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single()

  const cargo = perfil?.cargo?.trim().toUpperCase()

  if (cargo !== 'ENTREGADOR' && cargo !== 'ADMIN' && cargo !== 'GERENTE') {
    return (
      <div className="p-8 text-center text-red-500 font-bold mt-10">
        Acesso restrito. Você não tem permissão de entregador.
      </div>
    )
  }

  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  if (!loja) {
    return <div className="p-8 text-center text-red-500">Erro: Loja não configurada.</div>
  }

  // Buscar todos os pedidos de DELIVERY desde a fila até despachados
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select(`
      id, numero_pedido, cliente_nome, telefone, endereco, total, forma_pagamento, pago, status, criado_em,
      itens_pedido ( quantidade, produtos(nome) )
    `)
    .eq('loja_id', loja.id)
    .eq('tipo_consumo', 'DELIVERY')
    .in('status', ['NA_FILA', 'PREPARANDO', 'PRONTO', 'DESPACHADO'])
    .order('criado_em', { ascending: true })

  if (pedidosError) console.error("ERRO AO BUSCAR PEDIDOS NO ENTREGADOR:", pedidosError);
  
  return (
    <main className="p-4 md:p-6 pb-24 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Painel do Entregador</h1>
        <p className="text-slate-500 text-sm">Acompanhe os pedidos na cozinha e gerencie as entregas prontas.</p>
      </div>

      <EntregadorPainelClient pedidosIniciais={pedidos || []} lojaId={loja.id} />
    </main>
  )
}
