'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cookie, ShieldCheck } from 'lucide-react'

const STORAGE_KEY = 'raizes-lgpd-cookie-consent'

export function CookieBanner() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY)
      if (!salvo) {
        setVisivel(true)
      }
    } catch {
      setVisivel(true)
    }
  }, [])

  const handleAceitar = (nivel: 'todos' | 'essenciais') => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          aceito: true,
          nivel,
          data: new Date().toISOString(),
        })
      )
    } catch {
      // Ignora erro caso localStorage esteja bloqueado no navegador
    }
    setVisivel(false)
  }

  if (!visivel) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de Cookies e Privacidade (LGPD)"
      className="fixed bottom-4 left-4 right-4 z-[90] max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500"
    >
      <div className="bg-card/95 backdrop-blur-md text-card-foreground border-2 border-border rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
            <Cookie size={24} />
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 font-bold text-foreground text-base">
              <span>Sua privacidade é nossa prioridade</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={12} /> LGPD
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
              Utilizamos cookies e armazenamento local essenciais para manter sua sessão segura,
              lembrar os itens da sua sacola de compras e processar seus pedidos de acordo com a{' '}
              <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>. Ao continuar,
              você concorda com a nossa{' '}
              <Link
                href="/privacidade"
                className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAceitar('essenciais')}
            className="flex-1 sm:flex-initial h-10 px-4 rounded-xl text-xs font-semibold"
          >
            Apenas Essenciais
          </Button>
          <Button
            type="button"
            onClick={() => handleAceitar('todos')}
            className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md"
          >
            Aceitar e Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}

