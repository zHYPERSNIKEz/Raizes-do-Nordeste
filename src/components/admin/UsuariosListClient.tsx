'use client'

import { useState } from 'react'
import { atualizarCargoUsuario } from '@/app/(admin)/admin/usuarios/actions'
import { Shield, User, ChefHat, Coffee, Check } from 'lucide-react'

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

  const handleMudarCargo = async (id: string, novoCargo: string) => {
    if (!confirm(`Tem certeza que deseja alterar o cargo deste usuário para ${novoCargo}?`)) return
    
    setLoading(id)
    const res = await atualizarCargoUsuario(id, novoCargo)
    setLoading(null)
    
    if (res.success) {
      setLista(prev => prev.map(u => u.id === id ? { ...u, cargo: novoCargo } : u))
    } else {
      alert(res.error || 'Erro ao alterar cargo')
    }
  }

  const getCargoIcon = (cargo: string) => {
    switch (cargo) {
      case 'ADMIN': return <Shield size={16} className="text-purple-400" />
      case 'COZINHA': return <ChefHat size={16} className="text-orange-400" />
      case 'GARCOM': return <Coffee size={16} className="text-blue-400" />
      default: return <User size={16} className="text-slate-500" />
    }
  }

  const usuariosFiltrados = lista.filter(u => 
    u.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    u.telefone?.includes(busca)
  )

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-800">
        <input 
          type="text" 
          placeholder="Buscar usuário por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full md:w-96 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand"
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
                  <div className="font-semibold text-slate-200">{u.nome} {u.id === currentUser ? '(Você)' : ''}</div>
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
                        value={u.cargo}
                        onChange={(e) => handleMudarCargo(u.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 focus:border-brand disabled:opacity-50 text-sm"
                      >
                        <option value="CLIENTE">Cliente</option>
                        <option value="GARCOM">Garçom</option>
                        <option value="COZINHA">Cozinha</option>
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
  )
}
