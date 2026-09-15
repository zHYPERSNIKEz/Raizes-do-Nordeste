'use client'

import { useTransition } from 'react'
import { toggleAtivo, excluirProduto } from '@/app/(admin)/admin/produtos/actions'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ToggleAtivoButton({ id, ativo }: { id: string, ativo: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => startTransition(() => toggleAtivo(id, ativo))}
      disabled={isPending}
      className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 mx-auto transition-colors ${
        ativo ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
      }`}
    >
      {ativo ? <Eye size={14} /> : <EyeOff size={14} />}
      {ativo ? 'Ativo' : 'Inativo'}
    </button>
  )
}

export function ExcluirProdutoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleExcluir = () => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      startTransition(async () => {
        const res = await excluirProduto(id)
        if (res?.success === false) {
          toast.error(res.error)
        } else {
          toast.success('Produto excluído com sucesso')
        }
      })
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExcluir}
      disabled={isPending}
      className="h-8 border-slate-700 text-red-400 hover:bg-red-500/10 hover:text-red-500"
    >
      <Trash2 size={16} />
    </Button>
  )
}
