'use client'

import { useState } from 'react'
import { criarFuncionario } from '@/app/(admin)/admin/equipe/actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { UserPlus, Loader2 } from 'lucide-react'

export function NovoUsuarioForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const res = await criarFuncionario(formData)
    setLoading(false)

    if (res?.success) {
      toast.success('Usuário criado com sucesso!')
      ;(document.getElementById('form-novo-usuario') as HTMLFormElement).reset()
    } else {
      toast.error(res?.error || 'Erro ao criar usuário')
    }
  }

  return (
    <form id="form-novo-usuario" action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
        <input 
          type="text" 
          name="nome" 
          required 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
        <input 
          type="email" 
          name="email" 
          required 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
        <input 
          type="password" 
          name="password" 
          required 
          minLength={6}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Cargo</label>
        <select 
          name="cargo" 
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        >
          <option value="GARCOM">Garçom (Salão)</option>
          <option value="COZINHA">Cozinha (Kanban)</option>
          <option value="GERENTE">Gerente</option>
          <option value="ADMIN">Administrador</option>
          <option value="ENTREGADOR">Entregador</option>
        </select>
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-2 bg-brand hover:bg-orange-600 text-white font-bold h-11">
        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <UserPlus className="mr-2" size={20} />}
        Cadastrar Funcionário
      </Button>
    </form>
  )
}




