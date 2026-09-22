'use client'

import { useState } from 'react'
import { atualizarConfiguracoesLoja } from '@/app/(admin)/admin/configuracoes/actions'
import { Save, AlertTriangle, Calendar, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export function ConfiguracoesForm({ loja }: { loja: any }) {
  const [loading, setLoading] = useState(false)
  const [dbError, setDbError] = useState(false)

  const isAberta = loja.aberta !== undefined ? loja.aberta : true
  const taxaEntrega = loja.taxa_entrega !== undefined ? loja.taxa_entrega : 0
  const formatTime = (timeStr?: string) => timeStr ? timeStr.substring(0, 5) : ''

  const [isAuto, setIsAuto] = useState(loja.horario_automatico || false)
  const [horaAbre, setHoraAbre] = useState(formatTime(loja.hora_abertura))
  const [horaFecha, setHoraFecha] = useState(formatTime(loja.hora_fechamento))
  
  // Novos estados
  const [emPausa, setEmPausa] = useState(loja.em_pausa || false)
  const [mensagemFechado, setMensagemFechado] = useState(loja.mensagem_fechado || '')
  
  let diasIniciais = [1,2,3,4,5,6,0]
  if (Array.isArray(loja.dias_funcionamento)) {
    diasIniciais = loja.dias_funcionamento
  } else if (typeof loja.dias_funcionamento === 'string') {
    try {
      diasIniciais = JSON.parse(loja.dias_funcionamento)
    } catch(e) {}
  }
  const [diasFuncionamento, setDiasFuncionamento] = useState<number[]>(diasIniciais)

  const diasSemana = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
  ]

  const toggleDia = (dia: number) => {
    setDiasFuncionamento(prev => 
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    )
  }

  const applyMensagemPronta = (msg: string) => setMensagemFechado(msg)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setDbError(false)
    
    const res = await atualizarConfiguracoesLoja(formData)
    
    if (res.success) {
      toast.success('Configurações salvas com sucesso!')
      window.location.reload()
    } else if (res.error === 'COLUNAS_FALTANDO') {
      setDbError(true)
      toast.error('O banco de dados precisa ser atualizado primeiro.')
    } else {
      toast.error('Erro ao salvar: ' + res.error)
    }
    
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-sm">
      <input type="hidden" name="id" value={loja.id} />
      <input type="hidden" name="dias_funcionamento" value={JSON.stringify(diasFuncionamento)} />
      
      {dbError && (
        <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg flex gap-3 text-orange-200">
          <AlertTriangle className="shrink-0 mt-0.5 text-orange-400" size={20} />
          <div className="text-sm">
            <p className="font-bold mb-1">Atualização Necessária no Banco de Dados</p>
            <p className="mb-2">Parece que as novas colunas ainda não foram adicionadas à tabela <strong>lojas</strong> no Supabase.</p>
            <p>Para as configurações funcionarem, execute o seguinte comando no SQL Editor do Supabase:</p>
            <pre className="bg-black/50 p-3 rounded mt-2 text-orange-300 font-mono text-xs overflow-x-auto">
              ALTER TABLE lojas{'\n'}
              ADD COLUMN IF NOT EXISTS aberta boolean DEFAULT true,{'\n'}
              ADD COLUMN IF NOT EXISTS taxa_entrega numeric DEFAULT 0,{'\n'}
              ADD COLUMN IF NOT EXISTS horario_automatico boolean DEFAULT false,{'\n'}
              ADD COLUMN IF NOT EXISTS hora_abertura time,{'\n'}
              ADD COLUMN IF NOT EXISTS hora_fechamento time,{'\n'}
              ADD COLUMN IF NOT EXISTS dias_funcionamento jsonb DEFAULT '[1,2,3,4,5,6,0]',{'\n'}
              ADD COLUMN IF NOT EXISTS em_pausa boolean DEFAULT false,{'\n'}
              ADD COLUMN IF NOT EXISTS pausa_fim date,{'\n'}
              ADD COLUMN IF NOT EXISTS mensagem_fechado text;
            </pre>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Loja</label>
          <input 
            type="text" 
            name="nome"
            defaultValue={loja.nome}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box de Horários Automáticos */}
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg">
            <label className="block text-sm font-bold text-slate-300 mb-3">Status de Funcionamento</label>
            
            <div className="mb-4 pb-4 border-b border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input 
                  type="checkbox" 
                  name="horario_automatico" 
                  value="true" 
                  checked={isAuto} 
                  onChange={(e) => setIsAuto(e.target.checked)}
                  className="text-brand focus:ring-brand rounded" 
                />
                <span className="text-slate-300 font-medium text-sm">Automatizar abertura e fechamento</span>
              </label>
              
              {isAuto && (
                <div className="mt-4 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Abre às:</label>
                      <input type="time" name="hora_abertura" value={horaAbre} onChange={e => setHoraAbre(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Fecha às:</label>
                      <input type="time" name="hora_fechamento" value={horaFecha} onChange={e => setHoraFecha(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Selecione os dias em que a loja <strong>ABRE</strong>:</label>
                    <div className="flex flex-wrap gap-2">
                      {diasSemana.map(dia => (
                        <button
                          key={dia.value}
                          type="button"
                          onClick={() => toggleDia(dia.value)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            diasFuncionamento.includes(dia.value)
                              ? 'bg-brand/20 border-brand text-brand font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          {dia.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`flex gap-4 ${isAuto ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="aberta" value="true" defaultChecked={isAberta} className="text-brand focus:ring-brand" />
                <span className="text-emerald-400 font-medium text-sm">🟢 LOJA ABERTA</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="aberta" value="false" defaultChecked={!isAberta} className="text-red-400 focus:ring-brand" />
                <span className="text-red-400 font-medium text-sm">🔴 LOJA FECHADA</span>
              </label>
            </div>
            {!isAuto && (
              <p className="text-xs text-slate-500 mt-3">
                Controle manual. Se fechada, os clientes não poderão finalizar novos pedidos.
              </p>
            )}
          </div>

          <div className="space-y-6">
            {/* Box Taxa de Entrega */}
            <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg">
              <label className="block text-sm font-bold text-slate-300 mb-1">Taxa de Entrega Padrão (R$)</label>
              <p className="text-xs text-slate-500 mb-3">Valor cobrado adicionalmente em pedidos para Delivery.</p>
              <input 
                type="number" 
                step="0.01"
                name="taxa_entrega"
                defaultValue={taxaEntrega}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand" 
              />
            </div>

            {/* Box Férias e Feriados */}
            <div className={`p-4 border rounded-lg transition-colors ${emPausa ? 'bg-orange-950/30 border-orange-500/50' : 'bg-slate-950 border-slate-800'}`}>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input 
                  type="checkbox" 
                  name="em_pausa" 
                  value="true" 
                  checked={emPausa} 
                  onChange={(e) => setEmPausa(e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded" 
                />
                <span className={`font-bold text-sm ${emPausa ? 'text-orange-400' : 'text-slate-300'}`}>
                  Pausa Programada / Férias
                </span>
              </label>

              {emPausa && (
                <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <Calendar size={14} /> Data de Retorno (opcional):
                    </label>
                    <input 
                      type="date" 
                      name="pausa_fim" 
                      defaultValue={loja.pausa_fim} 
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" 
                    />
                    <span className="text-[10px] text-orange-400/80 mt-1 block">
                      * O dia selecionado é o último dia de folga. A loja reabre automaticamente no dia seguinte.
                    </span>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <MessageSquare size={14} /> Mensagem para os clientes:
                    </label>
                    <textarea 
                      name="mensagem_fechado" 
                      value={mensagemFechado}
                      onChange={e => setMensagemFechado(e.target.value)}
                      placeholder="Ex: Saímos de férias, voltamos dia 15/01!"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm h-20 resize-none mb-2" 
                    />
                    
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => applyMensagemPronta('🎉 Feriado Nacional! Hoje não abriremos.')} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300">
                        Feriado
                      </button>
                      <button type="button" onClick={() => applyMensagemPronta('🏖️ Saímos de férias! Voltaremos em breve com as energias recarregadas.')} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300">
                        Férias
                      </button>
                      <button type="button" onClick={() => applyMensagemPronta('🛠️ Manutenção urgente. Voltamos amanhã!')} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300">
                        Manutenção
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-lg font-bold transition disabled:opacity-50"
          >
            {loading ? 'Salvando...' : (
              <>
                <Save size={20} /> Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
