# 🍔 Arte Burgueria - Sistema de Pedidos e Delivery

Plataforma completa de delivery e gestão de pedidos criada para a **Arte Burgueria**, focada em alta conversão visual, acompanhamento em tempo real e facilidade operacional.

## 🚀 Tecnologias Utilizadas
- **Framework:** Next.js (App Router, Server Actions, Server Components)
- **Estilização:** Tailwind CSS + shadcn/ui
- **Estado Global:** Zustand (para o carrinho de compras)
- **Banco de Dados & Backend:** Supabase (PostgreSQL, Row Level Security, Auth)
- **Tempo Real:** Supabase Realtime (para rastreamento de pedidos)
- **Ícones:** Lucide React

## 📦 Estrutura do Sistema

O sistema é dividido em grandes módulos operacionais:

### 1. Visão do Cliente (`/`)
- **Vitrine:** Cardápio dinâmico buscando produtos ativos do Supabase. Identidade visual ("Pop") com cores vibrantes (Azul Marinho e Laranja).
- **Carrinho e Checkout:** O cliente pode montar o pedido, adicionar observações, cadastrar endereços de entrega e finalizar a compra.
- **Histórico e Perfil:** Telas separadas (`/pedidos` e `/perfil`) para fácil navegação e gestão de dados.
- **Acompanhamento em Tempo Real:** Tela `/pedido/[id]` onde o cliente observa a barra de progresso do pedido avançar via WebSockets (Supabase Realtime) quando a cozinha atualiza o status.

### 2. Visão da Cozinha (`/admin/cozinha`)
- **Kanban de Produção:** Os cozinheiros recebem novos pedidos automaticamente e podem movê-los pelos estágios (`Na Fila` > `Preparando` > `Pronto`).

### 3. Visão do Caixa / Gestão (`/admin`)
- **Controle de Cardápio:** Adicionar, inativar e alterar preços dos produtos.
- **Controle de Lojas:** Definir taxa de entrega e abrir/fechar a loja.
- **Gestão de Pedidos:** Acompanhamento geral de todos os pedidos finalizados, despachados ou em andamento.

## ⚙️ Configuração Inicial (Supabase)

Para o sistema funcionar corretamente, é obrigatório rodar os scripts SQL no Supabase que criam a estrutura, habilitam as notificações e configuram as políticas de RLS.
Entre os requisitos fundamentais:
- Tabela `pedidos` (com RLS ativado para `INSERT` via auth e checagem de status contendo `NA_FILA`).
- Tabela `itens_pedido` (com RLS condicionado ao vínculo do pedido).

## 🏃 Como Rodar o Projeto

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env.local` na raiz e preencha as variáveis do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_aqui
   ```
4. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000` no navegador.

