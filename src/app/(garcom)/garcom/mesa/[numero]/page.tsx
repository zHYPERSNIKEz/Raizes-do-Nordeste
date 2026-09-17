import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GarcomMesaClient } from '@/components/admin/GarcomMesaClient'

export default async function GarcomMesaPage({ params }: { params: Promise<{ numero: string }> | { numero: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single()

  const cargo = perfil?.cargo?.trim().toUpperCase()
  if (cargo !== 'GARCOM' && cargo !== 'ADMIN' && cargo !== 'GERENTE') {
    redirect('/')
  }

  const resolvedParams = await Promise.resolve(params)
  const mesa = resolvedParams.numero

  const { data: loja } = await supabase.from('lojas').select('id').limit(1).single()
  if (!loja) return <div className="p-8 text-center text-destructive">Loja não encontrada</div>

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .order('categoria', { ascending: true })

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen pb-32">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mesa {mesa}</h1>
          <p className="text-muted-foreground">Adicione os itens e lance o pedido para a cozinha.</p>
        </div>
      </div>

      <GarcomMesaClient 
        produtos={produtos || []} 
        mesa={mesa} 
        lojaId={loja.id}
        userId={user.id}
      />
    </main>
  )
}
