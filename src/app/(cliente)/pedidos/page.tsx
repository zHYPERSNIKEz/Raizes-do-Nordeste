import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PackageCheck, Clock, MapPin, Receipt, ArrowRight, ChevronLeft } from 'lucide-react'

export default async function MeusPedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/pedidos')
  }

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('id, numero_pedido, status, criado_em, total, tipo_consumo')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })
    .limit(20)

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'NA_FILA': return { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Na Fila' }
      case 'PREPARANDO': return { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Clock, label: 'Preparando' }
      case 'PRONTO': return { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: PackageCheck, label: 'Pronto para Retirada' }
      case 'DESPACHADO': return { color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: MapPin, label: 'Saiu para Entrega' }
      case 'FINALIZADO': 
      case 'ENTREGUE': return { color: 'text-muted-foreground bg-muted/50 border-border', icon: Receipt, label: 'Finalizado' }
      case 'CANCELADO': return { color: 'text-destructive bg-destructive/10 border-destructive/20', icon: Receipt, label: 'Cancelado' }
      default: return { color: 'text-muted-foreground bg-muted/50 border-border', icon: Clock, label: status }
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft size={16} className="mr-1" />
          Voltar ao Cardápio
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-primary uppercase tracking-wide">Meus Pedidos</h1>
        <Link href="/perfil" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors underline">
          Editar meus dados
        </Link>
      </div>
      
      {!pedidos || pedidos.length === 0 ? (
        <div className="bg-card p-12 rounded-[2rem] border border-border shadow-sm text-center">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <PackageCheck size={32} />
          </div>
          <h2 className="font-display text-2xl mb-2 text-foreground">Nenhum pedido ainda</h2>
          <p className="text-muted-foreground mb-6">Que tal experimentar os melhores hambúrgueres da cidade hoje?</p>
          <Link href="/" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-bold uppercase rounded-full hover:scale-105 transition-transform shadow-md">
            Fazer meu primeiro pedido
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {pedidos.map(pedido => {
            const statusVisual = getStatusDisplay(pedido.status)
            const StatusIcon = statusVisual.icon
            
            return (
              <Link key={pedido.id} href={`/pedido/${pedido.id}`}>
                <div className="bg-card p-5 md:p-6 border-2 border-border rounded-2xl hover:border-primary hover:shadow-lg transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${statusVisual.color}`}>
                      <StatusIcon size={24} />
                    </div>
                    
                    <div>
                      <p className="font-bold text-foreground text-lg mb-1">Pedido #{pedido.numero_pedido || pedido.id.split('-')[0]}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <span>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(pedido.criado_em))}</span>
                        <span>•</span>
                        <span>{pedido.tipo_consumo === 'DELIVERY' ? 'Delivery' : 'Balcão'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:gap-8 pt-4 md:pt-0 border-t border-border md:border-0">
                    <div className="text-left md:text-right">
                      <p className="font-display text-2xl text-foreground">R$ {pedido.total.toFixed(2).replace('.', ',')}</p>
                      <p className={`text-sm font-bold mt-1 ${statusVisual.color.split(' ')[0]}`}>
                        {statusVisual.label}
                      </p>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ArrowRight size={20} />
                    </div>
                  </div>

                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}


