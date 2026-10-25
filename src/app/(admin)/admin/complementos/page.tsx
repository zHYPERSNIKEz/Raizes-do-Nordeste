import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ComplementosClient } from '@/components/admin/ComplementosClient'
import { getAdminSession, getLojaUnica } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function ComplementosPage() {
  const [session, loja] = await Promise.all([
    getAdminSession(),
    getLojaUnica(),
  ])

  if (!session) redirect('/admin/login')

  if (!session.isMaster) {
    return <div className="p-8 text-center text-red-500">Acesso negado.</div>
  }

  const supabase = await createClient()

  // Buscar grupos e seus itens
  const { data: grupos } = await supabase
    .from('complemento_grupos')
    .select('*, complemento_itens(*)')
    .eq('loja_id', loja?.id)
    .order('criado_em', { ascending: true })

  // Ordenar itens por 'criado_em'
  const gruposFormatados = grupos?.map((g: any) => ({
    ...g,
    complemento_itens: (g.complemento_itens || []).sort((a: any, b: any) => 
      new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
    )
  })) || []

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/produtos">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-400 hover:text-white">
                <ArrowLeft size={16} className="mr-1" /> Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <span className="text-2xl">🧩</span> Grupos e Adicionais
          </h1>
          <p className="text-slate-400 mt-1">
            Crie opções globais (ex: Ponto da Carne, Adicionais) e vincule em múltiplos produtos.
          </p>
        </div>
      </div>

      <ComplementosClient grupos={gruposFormatados} />
    </main>
  )
}
