'use client'

import { useState } from 'react'
import { atualizarCargoUsuario } from '@/app/(admin)/admin/usuarios/actions'
import { Shield, User, ChefHat, Coffee, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type Perfil = {
  id: string
  nome: string
  cargo: string
  telefone?: string
  criado_em: string
}

export function UsuariosListClient({ usuarios, currentUser }: { usuarios: Perfil[], currentUser: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [lista, setLista] = useState(usuarios)
  const [busca, setBusca] = useState('')
  
  // Estado do Modal
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; userId: string; novoCargo: string; nome: string } | null>(null)

  const handleMudarCargo = async () => {
    if (!confirmModal) return
    
    const { userId: id, novoCargo } = confirmModal
    setConfirmModal(null)
    
    setLoading(id)
    const res = await atualizarCargoUsuario(id, novoCargo)
    setLoading(null)
    
    if (res.success) {
      setLista(prev => prev.map(u => u.id === id ? { ...u, cargo: novoCargo } : u))
      toast.success('Cargo atualizado com sucesso!')
    } else {
      toast.error(res.error || 'Erro ao alterar cargo')
    }
  }

  const getCargoIcon = (cargo: string) => {
    switch (cargo?.trim().toUpperCase()) {
      case 'ADMIN': return <Shield size={16} className="text-purple-400" />
      case 'COZINHA': return <ChefHat size={16} className="text-orange-400" />
      case 'GARCOM': return <Coffee size={16} className="text-blue-400" />
      default: return <User size={16} className="text-slate-500" />
    }
  }

  const usuariosFiltrados = lista.filter(u => 
    (u.nome || '').toLowerCase().includes(busca.toLowerCase()) || 
    (u.telefone || '').includes(busca) ||
    (u.cargo || '').toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <input 
            type="text" 
            placeholder="Buscar usuário por nome, telefone ou cargo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full md:w-96 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Nome do Usuário</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Cargo Atual</th>
                <th className="px-6 py-4 text-right">Ação (Mudar Cargo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {usuariosFiltrados.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200">{u.nome || 'Sem Nome'} {u.id === currentUser ? '(Você)' : ''}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Cadastrado em {new Intl.DateTimeFormat('pt-BR').format(new Date(u.criado_em))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {u.telefone || 'Não informado'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getCargoIcon(u.cargo)}
                      <span className="font-medium text-slate-300">{u.cargo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.id === currentUser ? (
                       <span className="text-slate-500 text-xs italic">Não é possível alterar o próprio cargo</span>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <select 
                          disabled={loading === u.id}
                          value={u.cargo?.trim().toUpperCase()}
                          onChange={(e) => {
                            const novo = e.target.value
                            if (novo !== u.cargo) {
                              setConfirmModal({ isOpen: true, userId: u.id, novoCargo: novo, nome: u.nome || 'Usuário' })
                            }
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 focus:border-brand disabled:opacity-50 text-sm outline-none cursor-pointer"
                        >
                          <option value="CLIENTE">Cliente</option>
                          <option value="GARCOM">Garçom</option>
                          <option value="COZINHA">Cozinha</option>
                          <option value="GERENTE">Gerente</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 text-brand flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Confirmar Alteração</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Você está alterando as permissões de acesso de <strong className="text-slate-200">{confirmModal.nome}</strong>. O novo cargo será <strong className="text-brand">{confirmModal.novoCargo}</strong>.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setConfirmModal(null)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-brand hover:bg-orange-600 text-white"
                onClick={handleMudarCargo}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
