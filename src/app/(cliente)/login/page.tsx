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
    
    // Chama a função do servidor dependendo do modo (login ou cadastro)
    const result = isLogin ? await login(formData) : await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {isLogin 
              ? 'Faça login para pedir seus hambúrgueres favoritos.' 
              : 'Cadastre-se rapidamente para fazer seu pedido.'}
          </p>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Nome completo</label>
              <input 
                type="text" 
                name="nome" 
                required 
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Seu nome"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input 
              type="password" 
              name="password" 
              required 
              minLength={6}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full bg-primary hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
          <button 
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
            }}
            className="ml-1 text-primary font-medium hover:underline"
          >
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </div>
      </div>
    </main>
  )
}
