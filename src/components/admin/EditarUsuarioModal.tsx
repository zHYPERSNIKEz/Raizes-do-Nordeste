'use client'

import { useState, useEffect } from 'react'
import { buscarDadosUsuarioAuth, atualizarFuncionario } from '@/app/(admin)/admin/equipe/actions'
import { Button } from '@/components/ui/button'
import { Edit, Loader2, X, Lock } from 'lucide-react'
import { toast } from 'sonner'

type Usuario = {
  id: string
  nome: string
  telefone?: string
}

export function EditarUsuarioModal({ usuario }: { usuario: Usuario }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [carregandoEmail, setCarregandoEmail] = useState(false)
  
  const maskPhone = (val: string) => {
    const v = val.replace(/\D/g, '')
    if (v.length <= 2) return v
    if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}`
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`
  }

  const [nome, setNome] = useState(usuario.nome || '')
  const [telefone, setTelefone] = useState(maskPhone(usuario.telefone || ''))
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Carregar e-mail real do Auth
      setCarregandoEmail(true)
      buscarDadosUsuarioAuth(usuario.id).then(res => {
        if (res.success && res.email) {
          setEmail(res.email)
        }
        setCarregandoEmail(false)
      })
    } else {
      setSenha('') // Limpar senha ao fechar
    }
  }, [isOpen, usuario.id])

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    if (senha && senha.length > 0 && senha.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres.')
      setLoading(false)
      return
    }

    const res = await atualizarFuncionario(usuario.id, { nome, telefone, email, senha })
    setLoading(false)

    if (res.success) {
      toast.success('Perfil atualizado com sucesso!')
      setIsOpen(false)
    } else {
      toast.error(res.error || 'Erro ao atualizar perfil')
    }
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="border-slate-700 hover:bg-slate-800 text-slate-300 gap-2"
      >
        <Edit size={16} /> Editar
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Editar Perfil</h2>
                <p className="text-sm text-slate-400 mt-1">Altere os dados do funcionário</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="form-editar" onSubmit={handleSalvar} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-brand outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    inputMode="tel"
                    maxLength={15}
                    value={telefone}
                    onChange={e => setTelefone(maskPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-brand outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Lock size={16} className="text-brand" /> Dados de Login
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">E-mail de Acesso</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={carregandoEmail}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-brand outline-none disabled:opacity-50"
                      />
                      {carregandoEmail && <p className="text-xs text-slate-500 mt-1">Carregando e-mail...</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Redefinir Senha (Opcional)</label>
                      <input 
                        type="password" 
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        placeholder="Deixe em branco para não alterar"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-brand outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Se o funcionário esqueceu a senha, digite uma nova aqui para ele.
                      </p>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex justify-end gap-3 shrink-0">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                form="form-editar"
                disabled={loading || carregandoEmail}
                className="bg-brand hover:bg-orange-600 text-white min-w-[120px]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Salvar Alterações'}
              </Button>
            </div>
            
          </div>
        </div>
      )}
    </>
  )
}
