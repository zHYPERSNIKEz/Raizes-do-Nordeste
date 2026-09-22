'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarConfiguracoesLoja(formData: FormData) {
  const supabase = await createClient()

  // Verificacao de admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }
  const { data: perfil } = await supabase.from('perfis').select('cargo').eq('id', user.id).single()
  if (perfil?.cargo !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  const id = formData.get('id') as string
  const nome = formData.get('nome') as string
  const aberta = formData.get('aberta') === 'true'
  const taxa_entrega = parseFloat(formData.get('taxa_entrega') as string || '0')
  const horario_automatico = formData.get('horario_automatico') === 'true'
  const hora_abertura = formData.get('hora_abertura') as string || null
  const hora_fechamento = formData.get('hora_fechamento') as string || null
  
  // Novos campos: Dias da semana e Pausa (Férias)
  const diasStr = formData.get('dias_funcionamento') as string
  let dias_funcionamento = [1,2,3,4,5,6,0]
  if (diasStr) {
    try {
      dias_funcionamento = JSON.parse(diasStr)
    } catch(e) {}
  }

  const em_pausa = formData.get('em_pausa') === 'true'
  const pausa_fim = formData.get('pausa_fim') as string || null
  const mensagem_fechado = formData.get('mensagem_fechado') as string || null

  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminClient
    .from('lojas')
    .update({ 
      nome, 
      aberta, 
      taxa_entrega,
      horario_automatico,
      hora_abertura,
      hora_fechamento,
      dias_funcionamento,
      em_pausa,
      pausa_fim,
      mensagem_fechado
    })
    .eq('id', id)

  if (error) {
    if (error.code === 'PGRST205' || error.message.includes('column')) {
      return { success: false, error: 'COLUNAS_FALTANDO' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/configuracoes')
  revalidatePath('/checkout')
  return { success: true }
}
