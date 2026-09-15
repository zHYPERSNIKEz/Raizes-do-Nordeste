import { ProdutoForm } from '@/components/admin/ProdutoForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NovoProdutoPage() {
  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/produtos" className="p-2 bg-slate-900 rounded-full border border-slate-800 hover:bg-slate-800 text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Novo Produto</h1>
          <p className="text-slate-400 mt-1">Preencha os dados do novo item do cardápio.</p>
        </div>
      </div>
      
      <ProdutoForm />
    </main>
  )
}
