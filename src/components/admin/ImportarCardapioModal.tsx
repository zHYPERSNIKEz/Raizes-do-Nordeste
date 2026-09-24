'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Upload, FileText, Check, X, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { analisarCardapioImagem, salvarDadosImportados } from '@/app/(admin)/admin/produtos/ia-actions'

export function ImportarCardapioModal({ lojaId, onSaved }: { lojaId: string, onSaved?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<{data: string, mimeType: string, url: string}[]>([])
  
  const [resultados, setResultados] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: {data: string, mimeType: string, url: string}[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
        newImages.push({
          data: base64.split(',')[1],
          mimeType: file.type,
          url: base64
        });
      }
      setImages([...images, ...newImages]);
    }
  }

  const handleAnalisar = async () => {
    if (images.length === 0) return
    setLoading(true)

    // @ts-ignore
    const res = await analisarCardapioImagem(images.map(img => ({ data: img.data, mimeType: img.mimeType })))
    
    if (res.success) {
      setResultados(res.data)
      toast.success('Cardápio analisado com sucesso!')
    } else {
      toast.error('Erro na IA: ' + res.error)
    }
    
    setLoading(false)
  }

  const handleSalvar = async () => {
    if (!resultados) return
    setSaving(true)
    
    const res = await salvarDadosImportados(lojaId, resultados)
    
    if (res.success) {
      toast.success('Tudo importado com sucesso!')
      setOpen(false)
      setResultados(null)
      setImages([])
      if (onSaved) onSaved()
    } else {
      toast.error('Erro ao salvar no banco: ' + res.error)
    }
    
    setSaving(false)
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 gap-2 border border-indigo-500"
      >
        <Sparkles size={18} />
        Importar Cardápio por IA
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-400" /> 
                IA Gemini: Importador Mágico de Cardápios
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
              
              <div className="flex-1 flex flex-col gap-4">
                {!resultados && (
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-sm text-slate-300">
                    <p>Faça o upload das fotos do cardápio. A IA vai analisar todas as imagens juntas e extrair tudo!</p>
                  </div>
                )}

                {images.length === 0 ? (
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 transition-colors cursor-pointer min-h-[300px]">
                    <Upload size={40} className="text-slate-500 mb-4" />
                    <span className="text-slate-300 font-medium">Clique para escolher imagens</span>
                    <span className="text-slate-500 text-sm mt-2">Você pode selecionar várias páginas (JPG, PNG)</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 flex-1 min-h-[300px] flex flex-col bg-slate-950 p-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto max-h-[300px]">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-auto bg-black rounded-lg overflow-hidden border border-slate-700">
                           <img src={img.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain max-h-32" />
                        </div>
                      ))}
                      {!resultados && (
                        <label className="border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-800 cursor-pointer min-h-[100px]">
                          <Plus className="text-slate-500" size={24} />
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>

                    {!resultados && (
                      <div className="mt-4 flex justify-center pb-2">
                        <Button 
                          size="lg"
                          onClick={handleAnalisar}
                          disabled={loading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold text-lg px-8 py-6 rounded-2xl shadow-xl shadow-indigo-600/20 w-full max-w-sm"
                        >
                          {loading ? (
                            <><Loader2 className="animate-spin" /> Lendo Imagens...</>
                          ) : (
                            <><Sparkles /> Começar Mágica ({images.length})</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {images.length > 0 && !resultados && !loading && (
                   <Button variant="outline" size="sm" onClick={() => setImages([])} className="border-slate-700 text-slate-400">
                     Limpar Imagens
                   </Button>
                )}
              </div>

              {resultados && (
                <div className="flex-1 flex flex-col gap-4 max-h-full">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                      <Check size={20} />
                    </div>
                    <div>
                      <h4 className="text-emerald-400 font-bold mb-1">Análise Concluída!</h4>
                      <p className="text-sm text-slate-300">Confira o que a IA encontrou. Se estiver tudo certo, você pode salvar tudo no banco de dados.</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                    {resultados.categorias?.map((cat: any, i: number) => (
                      <div key={i} className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                        <h4 className="font-bold text-slate-200 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2">
                          <FileText size={16} className="text-indigo-400" /> {cat.nome}
                        </h4>
                        <ul className="space-y-3">
                          {cat.produtos?.map((p: any, j: number) => (
                            <li key={j} className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm text-slate-300">{p.nome}</p>
                                {p.descricao && <p className="text-xs text-slate-500 mt-0.5">{p.descricao}</p>}
                              </div>
                              <span className="text-sm font-bold text-brand bg-brand/10 px-2 py-0.5 rounded whitespace-nowrap">
                                R$ {Number(p.preco || 0).toFixed(2).replace('.', ',')}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {resultados.grupos_complementos?.length > 0 && (
                      <div className="bg-indigo-950/30 rounded-lg p-4 border border-indigo-900/50">
                        <h4 className="font-bold text-indigo-300 mb-3 pb-2 border-b border-indigo-900/50 flex items-center gap-2">
                          <Sparkles size={16} /> Grupos de Complementos Encontrados
                        </h4>
                        <div className="space-y-4">
                          {resultados.grupos_complementos.map((g: any, i: number) => (
                            <div key={i} className="bg-slate-900 rounded p-3 border border-slate-800">
                              <p className="font-medium text-sm text-slate-200">{g.nome}</p>
                              <p className="text-xs text-slate-500 mb-2">Max escolhas: {g.max_escolhas}</p>
                              <div className="flex flex-wrap gap-2">
                                {g.itens?.map((it: any, j: number) => (
                                  <span key={j} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                                    {it.nome} {it.preco > 0 ? `(+R$ ${Number(it.preco).toFixed(2)})` : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleSalvar}
                    disabled={saving}
                    className="w-full bg-brand hover:bg-orange-600 text-white font-bold py-6"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : 'Salvar Tudo no Banco de Dados'}
                  </Button>
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}
    </>
  )
}
