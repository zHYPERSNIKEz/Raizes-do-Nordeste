import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Se CRON_SECRET estiver definido na Vercel, valida o cabeçalho Authorization
    const cronSecret = process.env.CRON_SECRET?.trim()
    if (cronSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { ok: false, error: 'Não autorizado' },
          { status: 401 }
        )
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { ok: false, error: 'Variáveis do Supabase não configuradas no ambiente.' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Faz uma consulta real no PostgreSQL para registrar atividade no projeto Supabase
    const { data, error } = await supabase
      .from('lojas')
      .select('id, nome')
      .limit(1)

    if (error) {
      console.error('Erro no keep-alive do Supabase:', error)
      return NextResponse.json(
        { ok: false, error: error.message, timestamp: new Date().toISOString() },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Supabase ativo e respondendo normalmente.',
        lojaVerificada: data?.[0]?.nome || 'OK',
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    console.error('Erro inesperado no keep-alive:', error)
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Erro interno no keep-alive',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

