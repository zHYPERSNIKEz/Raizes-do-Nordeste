'use client'

import { useState } from 'react'
import { AddToCartButton } from '@/components/cliente/AddToCartButton'
import { Search } from 'lucide-react'

export function CatalogoVitrineClient({ produtos }: { produtos: any[] }) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Todos')
  const [busca, setBusca] = useState<string>('')

  // Extrair categorias únicas na ordem lógica do cardápio
  const ordemPreferida = [
    'Todos',
    'Pratos Principais',
    'Carnes de Sol & Assados',
    'Porções & Petiscos',
    'Bebidas',
    'Sobremesas Regionais',
  ]
  const categoriasDoBanco = Array.from(
    new Set(produtos.map((p) => p.categoria).filter(Boolean))
  ) as string[]

  const categoriasUnicas = [
    'Todos',
    ...categoriasDoBanco.sort((a, b) => {
      const idxA = ordemPreferida.indexOf(a)
      const idxB = ordemPreferida.indexOf(b)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a.localeCompare(b)
    }),
  ]

  const produtosFiltrados = produtos.filter((p) => {
    const matchCategoria =
      categoriaSelecionada === 'Todos' || p.categoria === categoriaSelecionada
    const matchBusca =
      p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      (p.descricao && p.descricao.toLowerCase().includes(busca.toLowerCase()))
    return matchCategoria && matchBusca
  })

  return (
    <div className="flex flex-col w-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      {/* Área de Busca e Filtros */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl pb-4 pt-4 -mx-6 px-6 sm:mx-0 sm:px-0 border-b border-border/20 mb-10 transition-all shadow-sm">
        {/* Barra de Pesquisa Minimalista */}
        <div className="relative max-w-2xl mx-auto mb-4 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="O que você está com vontade de comer hoje?"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-secondary/30 hover:bg-secondary/50 border border-border/30 focus:border-primary/50 focus:bg-background rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-base"
          />
        </div>

        {/* Abas de Categorias */}
        {categoriasUnicas.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 py-1">
            {categoriasUnicas.map((cat) => {
              const ativa = categoriaSelecionada === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaSelecionada(cat)}
                  className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    ativa
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {produtosFiltrados && produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((produto, index) => (
            <div
              key={produto.id}
              className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-in fade-in flex flex-col border border-border/50 group"
              style={{
                animationDelay: `${(index % 6) * 50}ms`,
                animationFillMode: 'both',
              }}
            >
              {produto.imagem_url ? (
                <div className="h-56 overflow-hidden bg-muted relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={produto.imagem_url}
                    alt={produto.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              ) : (
                <div className="w-full h-56 bg-secondary flex items-center justify-center font-display text-2xl text-secondary-foreground/40">
                  S/ Imagem
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow relative z-20">
                <span className="text-xs font-bold uppercase tracking-wider text-primary/80 mb-1">
                  {produto.categoria}
                </span>
                <h3 className="font-display text-2xl text-foreground mb-2">
                  {produto.nome}
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow text-base leading-relaxed line-clamp-3">
                  {produto.descricao ||
                    'Prato típico preparado com ingredientes selecionados.'}
                </p>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
                  <span className="font-display text-2xl text-primary font-bold">
                    R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                  </span>
                  <div className="[&>button]:font-bold [&>button]:rounded-full [&>button]:px-6 [&>button]:py-5 [&>button]:shadow-md hover:[&>button]:scale-105 [&>button]:transition-transform">
                    <AddToCartButton produto={produto} />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-card rounded-3xl border border-border border-dashed flex flex-col items-center justify-center">
            <Search size={48} className="text-muted-foreground/30 mb-4" />
            <p className="font-display text-3xl text-foreground">
              Nenhum produto encontrado
            </p>
            <p className="text-muted-foreground mt-2">
              Tente buscar por outro nome ou trocar a categoria.
            </p>
            <button
              onClick={() => {
                setBusca('')
                setCategoriaSelecionada('Todos')
              }}
              className="mt-6 text-primary font-bold hover:underline"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
