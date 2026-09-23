'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  salvarGrupoComplemento, 
  excluirGrupoComplemento,
  salvarItemComplemento,
  excluirItemComplemento
} from '@/app/(admin)/admin/complementos/actions'

export function ComplementosClient({ grupos }: { grupos: any[] }) {
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [loading, setLoading] = useState(false)

  // Estados para gerenciar a adição de um novo item dentro de um grupo
  const [newItemGroupId, setNewItemGroupId] = useState<string | null>(null)

  const handleSaveGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    // Forçar a obrigatoriedade se selecionado
    if (!formData.get('obrigatorio')) {
      formData.set('obrigatorio', 'false')
    }

    const res = await salvarGrupoComplemento(formData)
    if (res.success) {
      toast.success('Grupo salvo!')
      setIsCreatingGroup(false)
      setEditingGroup(null)
    } else {
      toast.error('Erro: ' + res.error)
    }
    setLoading(false)
  }

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Excluir este grupo apagará todas as opções dele. Continuar?')) return
    const res = await excluirGrupoComplemento(id)
    if (res.success) toast.success('Grupo excluído.')
    else toast.error('Erro: ' + res.error)
  }

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>, id?: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (id) formData.append('id', id)
    
    const res = await salvarItemComplemento(formData)
    if (res.success) {
      toast.success('Opção salva!')
      setNewItemGroupId(null)
    } else {
      toast.error('Erro: ' + res.error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Excluir esta opção?')) return
    const res = await excluirItemComplemento(id)
    if (res.success) toast.success('Opção excluída.')
    else toast.error('Erro: ' + res.error)
  }

  return (
    <div className="space-y-8">
      {/* Botão para criar novo grupo */}
      {!isCreatingGroup && !editingGroup && (
        <Button onClick={() => setIsCreatingGroup(true)} className="w-full bg-slate-900 border border-slate-700 border-dashed text-slate-300 hover:bg-slate-800 hover:text-white py-8 h-auto">
          <Plus size={20} className="mr-2" /> Criar Novo Grupo de Escolha
        </Button>
      )}

      {/* Formulário de Grupo */}
      {(isCreatingGroup || editingGroup) && (
        <div className="bg-slate-900 border border-brand/50 rounded-xl p-6 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => { setIsCreatingGroup(false); setEditingGroup(null) }}>
              <X size={20} className="text-slate-400" />
            </Button>
          </div>
          
          <form onSubmit={handleSaveGroup} className="space-y-4">
            {editingGroup && <input type="hidden" name="id" value={editingGroup.id} />}
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome do Grupo (Ex: Escolha seu Pão, Adicionais)</label>
              <input type="text" name="nome" defaultValue={editingGroup?.nome} required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
            </div>
            
            <div className="flex gap-4 p-4 bg-slate-950 border border-slate-800 rounded-lg items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="obrigatorio" value="true" defaultChecked={editingGroup?.obrigatorio} className="rounded text-brand" />
                <span className="text-sm font-medium text-slate-200">Escolha Obrigatória?</span>
              </label>
              <p className="text-xs text-slate-500">Se marcado, o cliente não pode avançar sem escolher.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mínimo de escolhas</label>
                <input type="number" name="min_escolhas" min="0" defaultValue={editingGroup?.min_escolhas || 0} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Máximo de escolhas</label>
                <input type="number" name="max_escolhas" min="1" defaultValue={editingGroup?.max_escolhas || 1} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading} className="bg-brand text-white hover:bg-orange-600">
                {loading ? 'Salvando...' : 'Salvar Grupo'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Grupos */}
      <div className="space-y-6">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {grupo.nome}
                  {grupo.obrigatorio && <span className="bg-red-500/20 text-red-400 text-[10px] uppercase px-2 py-0.5 rounded-full border border-red-500/30">Obrigatório</span>}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mínimo: {grupo.min_escolhas} | Máximo: {grupo.max_escolhas}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingGroup(grupo)} className="text-slate-400 hover:text-white">
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteGroup(grupo.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-2 mb-4">
                {grupo.complemento_itens?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{item.nome}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-brand font-mono">
                        {Number(item.preco) > 0 ? `+ R$ ${Number(item.preco).toFixed(2).replace('.', ',')}` : 'Grátis'}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="h-6 w-6 text-slate-500 hover:text-red-400">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!grupo.complemento_itens || grupo.complemento_itens.length === 0) && (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhuma opção cadastrada neste grupo.</p>
                )}
              </div>

              {/* Form de Novo Item */}
              {newItemGroupId === grupo.id ? (
                <form onSubmit={(e) => handleSaveItem(e)} className="flex gap-2 items-start bg-slate-950 p-3 rounded-lg border border-slate-700">
                  <input type="hidden" name="grupo_id" value={grupo.id} />
                  <div className="flex-1">
                    <input type="text" name="nome" placeholder="Ex: Pão Australiano" required className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white" />
                  </div>
                  <div className="w-32">
                    <input type="number" step="0.01" name="preco" placeholder="R$ 0,00" required className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white" />
                  </div>
                  <div className="flex gap-1">
                    <Button type="submit" size="sm" className="bg-brand hover:bg-orange-600 px-3">Salvar</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setNewItemGroupId(null)} className="px-2"><X size={16}/></Button>
                  </div>
                </form>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setNewItemGroupId(grupo.id)} className="w-full border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500">
                  <Plus size={16} className="mr-2" /> Adicionar Opção
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

