'use client'

import { useState } from 'react'
import Link from 'next/link'
import { salvarPerfil } from '@/app/(cliente)/perfil/actions'
import { Button } from '@/components/ui/button'

import { EnderecosCliente } from '@/components/cliente/EnderecosCliente'

type PerfilFormProps = {
  user: any
  perfilDB: any
}

export function PerfilForm({ user, perfilDB }: PerfilFormProps) {
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false)

  const email = user?.email
  const nome = user?.user_metadata?.nome || perfilDB?.nome || ''
  
  const maskPhone = (val: string) => {
    const v = val.replace(/\D/g, '')
    if (v.length <= 2) return v
    if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}`
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`
  }

  const [telefone, setTelefone] = useState(maskPhone(perfilDB?.telefone || ''))

  async function handleSubmit(formData: FormData) {
    if (!aceitouPrivacidade) {
      setMensagem('Você precisa confirmar a ciência da Política de Privacidade (LGPD) antes de salvar.')
      return
    }

    setLoading(true)
    setMensagem('')
    
    const result = await salvarPerfil(formData)
    
    if (result.error) {
      setMensagem(result.error)
    } else {
      setMensagem('Perfil salvo com sucesso!')
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-6 text-slate-900">
      <form action={handleSubmit} className="space-y-6 text-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input type="text" readOnly value={nome} className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input type="text" readOnly value={email} className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone Principal (WhatsApp)</label>
          <input type="text" inputMode="tel" maxLength={15} name="telefone" value={telefone} onChange={e => setTelefone(maskPhone(e.target.value))} className="w-full md:w-1/2 p-2 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" placeholder="(00) 00000-0000" />
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="font-bold text-slate-800 mb-4">Segurança</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha (opcional)</label>
            <input type="password" name="novaSenha" className="w-full md:w-1/2 p-2 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" placeholder="Deixe em branco para não alterar" minLength={6} />
          </div>
        </div>

        <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-brand/60 transition-colors">
          <input
            type="checkbox"
            checked={aceitouPrivacidade}
            onChange={(e) => setAceitouPrivacidade(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand accent-orange-600 shrink-0 cursor-pointer"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            Autorizo a atualização dos meus dados cadastrais conforme a{' '}
            <Link
              href="/privacidade"
              target="_blank"
              className="text-brand font-bold underline underline-offset-2 hover:text-orange-700"
            >
              Política de Privacidade (LGPD)
            </Link>
            .
          </span>
        </label>

        {mensagem && (
          <div className={`p-3 text-sm rounded-lg border ${mensagem.includes('sucesso') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {mensagem}
          </div>
        )}

        <div className="flex gap-4 border-b border-slate-200 pb-8">
          <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-full md:w-auto px-8">
            Voltar
          </Button>
          <Button type="submit" disabled={loading || !aceitouPrivacidade} className="w-full md:w-auto px-8 bg-primary hover:bg-orange-700 text-white font-medium disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </div>
      </form>

      {/* Seção separada para gerenciar múltiplos endereços via AJAX */}
      <div className="pt-2">
        <EnderecosCliente enderecosIniciais={perfilDB?.enderecos_salvos || []} />
      </div>
    </div>
  )
}
