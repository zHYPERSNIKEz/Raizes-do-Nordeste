'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, X } from 'lucide-react'
import { atualizarPermissoesUsuario } from '@/app/(admin)/admin/equipe/actions'
import { toast } from 'sonner'

type PermissoesProps = {
  usuario: {
    id: string
    nome: string
    cargo: string
    permissoes: string[]
  }
}

const permissoesDisponiveis = [
  { id: 'acesso_caixa', label: 'Acesso ao Caixa', desc: 'Permite abrir, fechar e fazer sangrias no caixa.' },
  { id: 'acesso_produtos', label: 'Gestão de Produtos', desc: 'Permite adicionar, editar e excluir itens do cardápio.' },
  { id: 'acesso_relatorios', label: 'Ver Dashboard', desc: 'Permite visualizar o faturamento e métricas da loja.' }
]

export function GerenciarPermissoesModal({ usuario }: PermissoesProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Garantir que é um array, mesmo se vier null do banco
  const permissoesIniciais = Array.isArray(usuario.permissoes) ? usuario.permissoes : []
  const [selecionadas, setSelecionadas] = useState<string[]>(permissoesIniciais)

  const togglePermissao = (id: string) => {
    if (selecionadas.includes(id)) {
      setSelecionadas(selecionadas.filter(p => p !== id))
    } else {
      setSelecionadas([...selecionadas, id])
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const res = await atualizarPermissoesUsuario(usuario.id, selecionadas)
    
    if (res.success) {
      toast.success('Permissões atualizadas com sucesso!')
      setOpen(false)
    } else {
      toast.error('Erro ao atualizar permissões: ' + res.error)
    }
    setLoading(false)
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
      >
        <ShieldCheck size={14} className="mr-1" /> Permissões
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="text-brand" /> Permissões de {usuario.nome}
              </h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-400 mb-4">
                O cargo atual é <strong className="text-brand">{usuario.cargo}</strong>. 
                Marque abaixo as funcionalidades extras que este funcionário poderá acessar.
              </p>

              <div className="space-y-3">
                {permissoesDisponiveis.map(perm => (
                  <label 
                    key={perm.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selecionadas.includes(perm.id) 
                        ? 'bg-brand/10 border-brand/50 text-brand' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center h-5">
                      <input 
                        type="checkbox" 
                        checked={selecionadas.includes(perm.id)}
                        onChange={() => togglePermissao(perm.id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand focus:ring-brand focus:ring-offset-slate-900"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold text-sm ${selecionadas.includes(perm.id) ? 'text-slate-100' : 'text-slate-300'}`}>
                        {perm.label}
                      </span>
                      <span className="text-xs opacity-80 mt-0.5">{perm.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading} className="bg-brand hover:bg-orange-600 text-white font-bold">
                {loading ? 'Salvando...' : 'Salvar Permissões'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

