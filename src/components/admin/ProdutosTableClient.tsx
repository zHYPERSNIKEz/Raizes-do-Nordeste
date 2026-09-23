'use client'

import { useState } from 'react'
import { Eye, EyeOff, Edit, Link as LinkIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ToggleAtivoButton, ExcluirProdutoButton } from '@/components/admin/ProdutoBotoes'
import { toast } from 'sonner'
import { vincularGrupoEmMassa } from '@/app/(admin)/admin/produtos/actions'

export function ProdutosTableClient({ produtos, todosGrupos }: { produtos: any[], todosGrupos: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [targetProductIds, setTargetProductIds] = useState<string[]>([]) // Quais produtos vão receber o grupo
  const [isLinking, setIsLinking] = useState(false)

  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(produtos.map(p => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const openMassLinkModal = () => {
    if (selectedIds.length === 0) return
    setTargetProductIds(selectedIds)
    setModalOpen(true)
  }

  const openSingleLinkModal = (produtoId: string) => {
    setTargetProductIds([produtoId])
    setModalOpen(true)
  }

  const handleLinkGroup = async (grupoId: string) => {
    if (targetProductIds.length === 0) return
    setIsLinking(true)
    const res = await vincularGrupoEmMassa(targetProductIds, grupoId)
    if (res.success) {
      toast.success(`Grupo vinculado a ${targetProductIds.length} produto(s)!`)
      setModalOpen(false)
      setSelectedIds([])
    } else {
      toast.error('Erro ao vincular grupo: ' + res.error)
    }
    setIsLinking(false)
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Barra de Ações em Massa */}
      {selectedIds.length > 0 && (
        <div className="bg-brand/10 border-b border-brand/20 p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-brand">
            {selectedIds.length} produto(s) selecionado(s)
          </span>
          <div className="flex gap-2">
            <Button size="sm" onClick={openMassLinkModal} className="bg-brand text-white hover:bg-orange-600 gap-2">
              <LinkIcon size={14} /> Vincular Grupo aos Selecionados
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-slate-300">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-700 bg-slate-900 text-brand focus:ring-brand"
                  checked={selectedIds.length === produtos.length && produtos.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-6 py-4">Foto</th>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Preço</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {produtos?.map((p) => {
              const isChecked = selectedIds.includes(p.id)
              return (
                <tr key={p.id} className={`hover:bg-slate-800/30 ${isChecked ? 'bg-brand/5' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-700 bg-slate-900 text-brand focus:ring-brand"
                      checked={isChecked}
                      onChange={() => toggleOne(p.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                      {p.imagem_url ? (
                        <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Sem Img</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200">{p.nome}</td>
                  <td className="px-6 py-4 text-slate-400">{p.categoria}</td>
                  <td className="px-6 py-4 font-medium text-brand">R$ {Number(p.preco || 0).toFixed(2).replace('.', ',')}</td>
                  <td className="px-6 py-4 text-center">
                    <ToggleAtivoButton id={p.id} ativo={p.ativo} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        title="Vincular a um Grupo de Complementos"
                        variant="outline" 
                        size="icon" 
                        onClick={() => openSingleLinkModal(p.id)}
                        className="h-8 w-8 bg-transparent border-slate-700 text-slate-400 hover:text-brand hover:border-brand"
                      >
                        <LinkIcon size={14} />
                      </Button>
                      <Link href={`/admin/produtos/${p.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-slate-700 text-slate-400 hover:text-brand hover:border-brand">
                          <Edit size={14} />
                        </Button>
                      </Link>
                      <ExcluirProdutoButton id={p.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
            
            {(!produtos || produtos.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  Nenhum produto cadastrado na loja.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Vinculação */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LinkIcon size={20} className="text-brand" /> Vincular Grupo
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </Button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-sm text-slate-400 mb-4">
                Selecione o grupo que deseja aplicar {targetProductIds.length > 1 ? 'aos ' + targetProductIds.length + ' produtos selecionados' : 'a este produto'}:
              </p>

              {todosGrupos.length === 0 ? (
                <div className="text-center py-6 bg-slate-950 rounded-lg border border-slate-800">
                  <p className="text-sm text-slate-500 mb-3">Você ainda não criou nenhum Grupo.</p>
                  <Link href="/admin/complementos">
                    <Button size="sm" variant="outline" className="border-brand text-brand hover:bg-brand hover:text-white">
                      Criar Grupo na Biblioteca
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {todosGrupos.map(g => (
                    <div key={g.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{g.nome}</p>
                        <p className="text-xs text-slate-500">{g.obrigatorio ? 'Obrigatório' : 'Opcional'}</p>
                      </div>
                      <Button 
                        size="sm" 
                        disabled={isLinking}
                        onClick={() => handleLinkGroup(g.id)}
                        className="bg-brand hover:bg-orange-600 text-white"
                      >
                        Vincular
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

