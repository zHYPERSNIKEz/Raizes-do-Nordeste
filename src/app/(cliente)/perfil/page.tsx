import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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

  const clienteNome = user.user_metadata?.nome || user.email

  // Busca os pedidos desse cliente
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('id, status, criado_em, total, pago')
    .eq('cliente_nome', clienteNome)
    .order('criado_em', { ascending: false })
    .limit(10)

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Meu Perfil</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Dados Pessoais</h2>
        <PerfilForm user={user} perfilDB={perfil} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Meus Últimos Pedidos</h2>
        
        {!pedidos || pedidos.length === 0 ? (
          <p className="text-slate-500">Você ainda não realizou nenhum pedido.</p>
        ) : (
          <div className="space-y-4">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Pedido #{pedido.id.split('-')[0]}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(pedido.criado_em))}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-brand text-sm">R$ {pedido.total.toFixed(2)}</p>
                    <p className={`text-xs font-semibold ${pedido.status === 'FINALIZADO' || pedido.status === 'ENTREGUE' ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {pedido.status.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <Link href={`/pedido/${pedido.id}`} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-brand hover:border-brand transition-colors">
                    Ver detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
