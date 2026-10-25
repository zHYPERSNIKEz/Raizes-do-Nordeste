import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface AdminSession {
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, any>
  }
  perfil: {
    id: string
    cargo: string
    permissoes: string[]
    nome?: string
    loja_id?: string
  } | null
  cargo: string
  isMaster: boolean
  podeCaixa: boolean
  podeProdutos: boolean
  podeRelatorios: boolean
}

/**
 * Busca a sessão e o perfil do usuário autenticado uma ÚNICA VEZ por requisição HTTP.
 * Utiliza o cache nativo do React Server Components.
 * Qualquer componente (layout, páginas, subcomponentes) que chamar essa função
 * na mesma requisição recebe o resultado em 0ms sem disparar requisições extras ao Supabase.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: perfil } = await supabase
    .from('perfis')
    .select('id, cargo, permissoes, nome, loja_id')
    .eq('id', user.id)
    .single()

  const cargo = perfil?.cargo?.trim().toUpperCase() || ''
  const permissoes = Array.isArray(perfil?.permissoes) ? perfil.permissoes : []

  const isMaster =
    cargo === 'ADMIN' || cargo === 'GERENTE' || cargo === 'DONO'
  const podeCaixa = isMaster || permissoes.includes('acesso_caixa')
  const podeProdutos = isMaster || permissoes.includes('acesso_produtos')
  const podeRelatorios = isMaster || permissoes.includes('acesso_relatorios')

  return {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    },
    perfil: perfil as any,
    cargo,
    isMaster,
    podeCaixa,
    podeProdutos,
    podeRelatorios,
  }
})

/**
 * Cache em memória do ID da Loja.
 * Como o sistema possui apenas 1 restaurante (loja física/online única),
 * não é necessário consultar a tabela `lojas` a cada renderização de página.
 */
let memoryCachedLoja: { id: string; nome?: string } | null = null

export const getLojaUnica = cache(async () => {
  if (memoryCachedLoja) return memoryCachedLoja

  const supabase = await createClient()
  const { data: loja } = await supabase
    .from('lojas')
    .select('id, nome')
    .limit(1)
    .single()

  if (loja) {
    memoryCachedLoja = loja
  }
  return loja
})

