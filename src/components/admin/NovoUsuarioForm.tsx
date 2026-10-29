'use client'

import { useState } from 'react'
import Link from 'next/link'
import { criarFuncionario } from '@/app/(admin)/admin/equipe/actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { UserPlus, Loader2 } from 'lucide-react'

export function NovoUsuarioForm() {
  const [loading, setLoading] = useState(false)
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false)

  async function handleSubmit(formData: FormData) {
    if (!aceitouPrivacidade) {
      toast.error('Confirme o consentimento LGPD para cadastrar o colaborador.')
      return
    }
    setLoading(true)
    const res = await criarFuncionario(formData)
    setLoading(false)

    if (res?.success) {
      toast.success('Usuário criado com sucesso!')
      setAceitouPrivacidade(false)
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

      <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-brand/50 transition-colors">
        <input
          type="checkbox"
          checked={aceitouPrivacidade}
          onChange={(e) => setAceitouPrivacidade(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 rounded border-slate-700 text-brand focus:ring-brand accent-orange-600 shrink-0 cursor-pointer"
        />
        <span className="text-xs text-slate-400 leading-relaxed">
          Confirmo que o colaborador está ciente da{' '}
          <Link
            href="/privacidade"
            target="_blank"
            className="text-brand font-semibold underline underline-offset-2 hover:text-orange-400"
          >
            Política de Privacidade (LGPD)
          </Link>{' '}
          para tratamento de seus dados funcionais e controle de acesso.
        </span>
      </label>

      <Button type="submit" disabled={loading || !aceitouPrivacidade} className="w-full mt-2 bg-brand hover:bg-orange-600 text-white font-bold h-11 disabled:opacity-50">
        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <UserPlus className="mr-2" size={20} />}
        Cadastrar Funcionário
      </Button>
    </form>
  )
}
