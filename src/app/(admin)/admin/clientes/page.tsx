import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { getAdminSession } from '@/lib/admin'

export const revalidate = 0

export default async function ClientesPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  if (!session.isMaster) {
    return (
      <div className="p-8 text-center text-red-500 bg-slate-950 min-h-screen">
        Acesso negado. Você não tem permissão para visualizar a lista de clientes.
      </div>
    )
  }

  const supabase = await createClient()

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
            <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(!clientes || clientes.length === 0) ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    Nenhum cliente cadastrado ainda.
                  </td>
                </tr>
              ) : (
                clientes.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100">{c.nome}</td>
                    <td className="px-6 py-4">{c.telefone || 'Não informado'}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
