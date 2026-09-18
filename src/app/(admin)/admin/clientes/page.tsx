import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single()

  const userCargo = perfil?.cargo?.trim().toUpperCase()
  const isMaster = userCargo === 'ADMIN' || userCargo === 'GERENTE'

  if (!isMaster) {
    return (
      <div className="p-8 text-center text-red-500 bg-slate-950 min-h-screen">
        Acesso negado. Você não tem permissão para visualizar a lista de clientes.
      </div>
    )
  }

  // Traz a lista de clientes
  const { data: clientes } = await supabase
    .from('perfis')
    .select('id, nome, telefone, criado_em')
    .eq('cargo', 'CLIENTE')
    .order('criado_em', { ascending: false })
    .limit(200)

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Users size={32} className="text-brand" /> 
            Lista de Clientes
          </h1>
          <p className="text-slate-400 mt-1">Visualize todos os clientes cadastrados no delivery.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Nome do Cliente</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4 text-right">Data de Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {clientes?.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200">{c.nome || 'Cliente Anônimo'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {c.telefone || 'Não informado'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {new Intl.DateTimeFormat('pt-BR').format(new Date(c.criado_em))}
                  </td>
                </tr>
              ))}
              
              {(!clientes || clientes.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    Nenhum cliente cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
