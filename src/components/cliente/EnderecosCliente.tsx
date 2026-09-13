'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Plus, Trash2, X } from 'lucide-react'
import { adicionarEndereco, removerEndereco } from '@/app/(cliente)/perfil/actions'

import { toast } from 'sonner'

type Endereco = {
  id: string
  titulo: string
  rua: string
  numero: string
  bairro: string
  complemento: string
}

export function EnderecosCliente({ enderecosIniciais = [] }: { enderecosIniciais: Endereco[] }) {
  const [enderecos, setEnderecos] = useState<Endereco[]>(enderecosIniciais)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [titulo, setTitulo] = useState('Casa')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [complemento, setComplemento] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const novoEndereco = {
      id: crypto.randomUUID(),
      titulo,
      rua,
      numero,
      bairro,
      complemento
    }

    const result = await adicionarEndereco(novoEndereco)
    if (result.success) {
      setEnderecos([...enderecos, novoEndereco])
      setIsModalOpen(false)
      // Limpa os campos
      setTitulo('Casa')
      setRua('')
      setNumero('')
      setBairro('')
      setComplemento('')
      toast.success('Endereço adicionado!')
    } else {
      toast.error('Erro ao salvar endereço.')
    }
    setLoading(false)
  }

  async function handleRemove(id: string) {
    if (!confirm('Tem certeza que deseja remover este endereço?')) return
    
    const result = await removerEndereco(id)
    if (result.success) {
      setEnderecos(enderecos.filter(end => end.id !== id))
      toast.success('Endereço removido!')
    } else {
      toast.error('Erro ao remover endereço.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Meus Endereços</h3>
        <Button onClick={() => setIsModalOpen(true)} variant="outline" size="sm" className="gap-2">
          <Plus size={16} /> Novo
        </Button>
      </div>

      {enderecos.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
          Nenhum endereço cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {enderecos.map(end => (
            <div key={end.id} className="relative p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-1">
              <div className="flex items-center gap-2 text-brand font-bold mb-1">
                <MapPin size={18} />
                {end.titulo}
              </div>
              <p className="text-sm text-slate-700">{end.rua}, {end.numero}</p>
              <p className="text-sm text-slate-600">{end.bairro}</p>
              {end.complemento && <p className="text-xs text-slate-500">{end.complemento}</p>}
              
              <button 
                onClick={() => handleRemove(end.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                title="Remover endereço"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL RESPONSIVO (Tela Cheia no Mobile, Centralizado no PC) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-all">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Adicionar Endereço</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <form id="form-endereco" onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Local (Ex: Casa, Trabalho)</label>
                  <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rua *</label>
                    <input type="text" required value={rua} onChange={e => setRua(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Número *</label>
                    <input type="text" required value={numero} onChange={e => setNumero(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bairro *</label>
                    <input type="text" required value={bairro} onChange={e => setBairro(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
                    <input type="text" value={complemento} onChange={e => setComplemento(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-brand focus:border-brand" placeholder="Ap, Casa 2..." />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <Button type="submit" form="form-endereco" disabled={loading} className="w-full bg-primary hover:bg-orange-700 text-white h-12 text-lg font-bold">
                {loading ? 'Salvando...' : 'Salvar Endereço'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
