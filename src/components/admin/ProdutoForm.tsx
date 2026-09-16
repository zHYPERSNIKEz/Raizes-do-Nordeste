'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { salvarProduto } from '@/app/(admin)/admin/produtos/actions'
import { Plus, Trash2, ArrowLeft, ImagePlus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function ProdutoForm({ produto }: { produto?: any }) {
  const [ingredientes, setIngredientes] = useState<string[]>(produto?.ingredientes_base || [])
  const [adicionais, setAdicionais] = useState<{nome: string, preco: number}[]>(produto?.adicionais || [])
  
  const [novoIngrediente, setNovoIngrediente] = useState('')
  const [novoAddNome, setNovoAddNome] = useState('')
  const [novoAddPreco, setNovoAddPreco] = useState('')

  const [imagemUrl, setImagemUrl] = useState(produto?.imagem_url || '')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Comprimir imagem e converter para WebP
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/webp'
      }
      
      const compressedFile = await imageCompression(file, options)
      
      // 2. Fazer upload para o Supabase Storage (bucket 'produtos')
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
      const { data, error } = await supabase.storage
        .from('produtos')
        .upload(fileName, compressedFile, {
          contentType: 'image/webp',
          upsert: false
        })

      if (error) {
        if (error.message.includes('Bucket not found')) {
          toast.error('O bucket "produtos" não existe no Supabase Storage. Crie-o como público primeiro.')
        } else {
          throw error
        }
        return
      }

      // 3. Pegar a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(data.path)

      setImagemUrl(publicUrl)
      toast.success('Imagem enviada com sucesso!')
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao enviar imagem: ' + error.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAddIngrediente = () => {
    if (novoIngrediente.trim()) {
      setIngredientes([...ingredientes, novoIngrediente.trim()])
      setNovoIngrediente('')
    }
  }

  const handleAddAdicional = () => {
    if (novoAddNome.trim() && novoAddPreco.trim()) {
      setAdicionais([...adicionais, { 
        nome: novoAddNome.trim(), 
        preco: parseFloat(novoAddPreco.replace(',', '.')) 
      }])
      setNovoAddNome('')
      setNovoAddPreco('')
    }
  }

  return (
    <form action={async (formData) => { await salvarProduto(formData) }} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <input type="hidden" name="id" value={produto?.id || ''} />
      <input type="hidden" name="ingredientes_base" value={JSON.stringify(ingredientes)} />
      <input type="hidden" name="adicionais" value={JSON.stringify(adicionais)} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Produto</label>
            <input 
              type="text" 
              name="nome"
              required
              defaultValue={produto?.nome}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
            <textarea 
              name="descricao"
              rows={3}
              defaultValue={produto?.descricao}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Preço Base (R$)</label>
              <input 
                type="number" 
                step="0.01"
                name="preco"
                required
                defaultValue={produto?.preco}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
              <select 
                name="categoria" 
                defaultValue={produto?.categoria || 'Artesanais'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand"
              >
                <option value="Artesanais">Artesanais</option>
                <option value="Smash">Smash</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Porções">Porções</option>
                <option value="Sobremesas">Sobremesas</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Imagem do Produto</label>
            <input type="hidden" name="imagem_url" value={imagemUrl} />
            
            <div className="flex items-center gap-4">
              {imagemUrl ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                  <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setImagemUrl('')} 
                    className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border border-dashed border-slate-700 flex items-center justify-center shrink-0 bg-slate-950/50">
                  <ImagePlus className="text-slate-500" size={24} />
                </div>
              )}

              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleUploadImagem}
                  className="hidden" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full md:w-auto bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {isUploading ? (
                    <><Loader2 size={16} className="animate-spin mr-2" /> Comprimindo e Enviando...</>
                  ) : (
                    <><ImagePlus size={16} className="mr-2" /> Escolher Foto</>
                  )}
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  A imagem será comprimida para economizar dados e convertida para o formato rápido (.webp).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              name="ativo" 
              id="ativo" 
              value="true"
              defaultChecked={produto ? produto.ativo : true} 
              className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-brand focus:ring-brand focus:ring-offset-slate-900" 
            />
            <label htmlFor="ativo" className="text-slate-300 font-medium">Produto Ativo (Visível para clientes)</label>
          </div>
        </div>

        {/* Coluna 2: Customizações */}
        <div className="space-y-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
          
          {/* Ingredientes Base */}
          <div>
            <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
              Ingredientes Base
              <span className="text-xs font-normal text-slate-500">(O cliente pode remover)</span>
            </h4>
            
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={novoIngrediente}
                onChange={e => setNovoIngrediente(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddIngrediente())}
                placeholder="Ex: Cebola Roxa"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" 
              />
              <Button type="button" onClick={handleAddIngrediente} variant="secondary" size="sm" className="bg-slate-800 hover:bg-slate-700">
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {ingredientes.map((ing, i) => (
                <div key={i} className="flex items-center gap-1 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md">
                  {ing}
                  <button type="button" onClick={() => setIngredientes(ingredientes.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {ingredientes.length === 0 && <span className="text-xs text-slate-500 italic">Nenhum ingrediente base.</span>}
            </div>
          </div>

          {/* Adicionais Pagos */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
              Adicionais Pagos
              <span className="text-xs font-normal text-slate-500">(O cliente pode adicionar)</span>
            </h4>
            
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={novoAddNome}
                onChange={e => setNovoAddNome(e.target.value)}
                placeholder="Ex: Bacon Extra"
                className="flex-[2] bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" 
              />
              <input 
                type="number" 
                step="0.01"
                value={novoAddPreco}
                onChange={e => setNovoAddPreco(e.target.value)}
                placeholder="R$ 0,00"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" 
              />
              <Button type="button" onClick={handleAddAdicional} variant="secondary" size="sm" className="bg-slate-800 hover:bg-slate-700">
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {adicionais.map((add, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-800/50 border border-slate-800 p-2 rounded-lg text-sm text-slate-300">
                  <span>{add.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-green-400">R$ {add.preco.toFixed(2).replace('.', ',')}</span>
                    <button type="button" onClick={() => setAdicionais(adicionais.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {adicionais.length === 0 && <span className="text-xs text-slate-500 italic">Nenhum adicional pago configurado.</span>}
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-slate-800 pt-6">
        <Link href="/admin/produtos">
          <Button type="button" variant="ghost" className="text-slate-400 hover:text-white">Cancelar</Button>
        </Link>
        <Button type="submit" className="bg-brand text-white hover:bg-orange-600 px-8 font-bold">
          {produto ? 'Salvar Alterações' : 'Cadastrar Produto'}
        </Button>
      </div>
    </form>
  )
}
