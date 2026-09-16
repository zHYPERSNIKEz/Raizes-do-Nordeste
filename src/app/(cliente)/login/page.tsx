'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = isLogin ? await login(formData) : await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-[2rem] shadow-xl border border-border p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-primary uppercase tracking-wide">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin 
              ? 'Faça login para pedir seus hambúrgueres favoritos.' 
              : 'Cadastre-se rapidamente para fazer seu pedido.'}
          </p>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Nome completo</label>
              <input 
                type="text" 
                name="nome" 
                required 
                className="px-4 py-3 bg-background text-foreground border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-0 transition-colors"
                placeholder="Seu nome"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">E-mail</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="px-4 py-3 bg-background text-foreground border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-0 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Senha</label>
            <input 
              type="password" 
              name="password" 
              required 
              minLength={6}
              className="px-4 py-3 bg-background text-foreground border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-0 transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-xl border-2 border-destructive/20 text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 w-full bg-primary hover:scale-[1.02] active:scale-[0.98] text-primary-foreground font-display text-xl uppercase py-4 rounded-full transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md"
          >
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground font-medium">
          {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
          <button 
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
            }}
            className="ml-2 text-primary font-bold hover:underline"
          >
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </div>
      </div>
    </main>
  )
}
