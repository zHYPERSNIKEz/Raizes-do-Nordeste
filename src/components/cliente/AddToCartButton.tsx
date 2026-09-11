'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

type AddToCartButtonProps = {
  produto: {
    id: string
    nome: string
    preco: number
    imagem_url?: string
  }
}

export function AddToCartButton({ produto }: AddToCartButtonProps) {
  // Agora o botão não adiciona direto na sacola, ele leva para a tela de customização
  return (
    <Link 
      href={`/produto/${produto.id}`}
      className="bg-primary hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
    >
      <Plus size={16} />
      Adicionar
    </Link>
  )
}
