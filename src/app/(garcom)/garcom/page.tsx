import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function GarcomDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/garcom')
  }

  // Pegar perfil do garçom para saber o nome
  const { data: perfil } = await supabase
    .from('perfis')
    .select('nome')
    .eq('id', user.id)
    .single()

  // Como é apenas uma loja, pega a primeira
  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()

  if (!loja) {
    return <div className="p-8 text-center text-red-500">Erro: Nenhuma loja cadastrada no sistema.</div>
  }

  // Buscar mesas ativas da loja (pedidos locais não pagos)
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('id, mesa, status, total, criado_em')
    .eq('loja_id', loja.id)
    .eq('tipo_consumo', 'LOCAL')
    .eq('pago', false)
    .order('criado_em', { ascending: true })

  // Agrupar pedidos pela mesa (pois uma mesa pode ter vários pedidos em repique)
  const mesasMap = new Map<string, { mesa: string, total: number, ids: string[] }>()
  
  if (pedidos) {
    pedidos.forEach(p => {
      if (p.mesa) {
        if (!mesasMap.has(p.mesa)) {
          mesasMap.set(p.mesa, { mesa: p.mesa, total: 0, ids: [] })
        }
        const m = mesasMap.get(p.mesa)!
        m.total += Number(p.total)
        m.ids.push(p.id)
      }
    })
  }

  const mesasAtivas = Array.from(mesasMap.values())

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Painel do Salão</h1>
          <p className="text-slate-500">Olá, {perfil.nome}. Selecione uma mesa para atender.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {mesasAtivas.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            Nenhuma mesa aberta no momento.
          </div>
        )}
        
        {mesasAtivas.map(m => (
          <div key={m.mesa} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-brand/10 border-b border-brand/20 flex justify-between items-center">
              <h3 className="font-bold text-xl text-brand">Mesa {m.mesa}</h3>
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                {m.ids.length} pedido(s)
              </span>
            </div>
            <div className="p-4 flex-grow">
              <p className="text-sm text-slate-500 mb-1">Total parcial:</p>
              <p className="font-bold text-2xl text-slate-800">R$ {m.total.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-2">
              <Link href={`/garcom/mesa/${m.mesa}`} className="block">
                <Button variant="outline" className="w-full text-xs h-9">
                  + Pedido
                </Button>
              </Link>
              <Link href={`/garcom/mesa/${m.mesa}/conta`} className="block">
                <Button className="w-full text-xs h-9 bg-green-600 hover:bg-green-700">
                  Fechar Conta
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-md shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Abrir Nova Mesa</h3>
        <form action={async (formData) => {
          'use server'
          const mesa = formData.get('numero_mesa')
          if (mesa) redirect(`/garcom/mesa/${mesa}`)
        }} className="flex gap-3">
          <input 
            type="text" 
            name="numero_mesa" 
            placeholder="Ex: 05, 12, Varanda" 
            required
            className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand"
          />
          <Button type="submit" className="bg-brand text-white font-bold h-auto px-6">
            Abrir
          </Button>
        </form>
      </div>
    </main>
  )
}