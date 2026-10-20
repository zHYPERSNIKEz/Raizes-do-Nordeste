import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CozinhaKanban } from '@/components/admin/CozinhaKanban'

export default async function CozinhaPage() {
  const supabase = await createClient()

  // 1. Validar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?returnUrl=/admin/cozinha')
  }

  // 2. Validar cargo (Opcional, mas recomendado. Ex: bloquear CLIENTES)
  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single()

  if (perfil?.cargo === 'CLIENTE') {
    return <div className="p-8 text-center text-red-500">Acesso negado. Apenas funcionários.</div>
  }

  // 3. Pegar a única loja do sistema
  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  
  if (!loja) {
    return <div className="p-8 text-center text-red-500">Erro crítico: Nenhuma loja cadastrada no banco.</div>
  }

  // 4. Buscar os pedidos iniciais que NÃO estão finalizados nem cancelados
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select(`
      id, numero_pedido, cliente_nome, tipo_consumo, mesa, status, criado_em,
      itens_pedido ( quantidade, observacao, produtos(nome) )
    `)
    .eq('loja_id', loja.id)
    .in('status', ['NA_FILA', 'PREPARANDO', 'PRONTO']) // Não traz finalizados
    .order('criado_em', { ascending: true })

  // 5. Renderizar o Client Component passando o estado inicial para hidratar rápido a tela
  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            🍳 Kanban da Cozinha
          </h1>
          <p className="text-slate-500 mt-2">
            Os pedidos novos aparecerão na coluna &quot;Na Fila&quot; automaticamente. Mantenha o áudio ligado.
          </p>
        </header>

        <CozinhaKanban initialPedidos={pedidos as any || []} lojaId={loja.id} />
      </div>
    </main>
  )
}
