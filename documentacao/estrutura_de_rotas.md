# Arquitetura de Rotas - SaaS Arte Hamburgueria

Este documento detalha o mapa de rotas e a estrutura de pastas do projeto, focado na utilização do Next.js (App Router) para separar as responsabilidades e layouts.

## 1. Módulo do Cliente (Público & Otimizado)
Focado em conversão e velocidade. Acessado via link público.
* `/[loja_slug]` : Vitrine e cardápio principal.
* `/[loja_slug]/produto/[id]` : Detalhes e personalização do item.
* `/[loja_slug]/carrinho` : Resumo do pedido.
* `/[loja_slug]/checkout` : Pagamento (Pix/Cartão) e identificação.
* `/[loja_slug]/acompanhar/[pedido_id]` : Tela de status do pedido em tempo real.

## 2. Módulo Administrativo / PDV (Protegido)
Focado na gestão da loja. Requer autenticação e possui layout denso (Dashboard).
* `/admin/login` : Autenticação de funcionários.
* `/admin/dashboard` : Métricas financeiras e de vendas.
* `/admin/pdv` : Ponto de Venda (lançamento rápido no balcão).
* `/admin/cozinha` : Kanban de pedidos (Supabase Realtime ativado).
* `/admin/produtos` : CRUD do cardápio e controle de estoque.
* `/admin/caixa` : Controle de turnos e fechamento financeiro.

## 3. Módulo Garçom (Protegido & Mobile-First)
Interface enxuta para uso em smartphones no salão.
* `/garcom` : Visão geral e status das mesas (Livre/Ocupada).
* `/garcom/mesa/[numero]` : Detalhes da comanda da mesa.
* `/garcom/mesa/[numero]/adicionar` : Lançamento rápido de novos itens na comanda.

---

## Estrutura de Pastas (Next.js App Router)
Crie as pastas no seu projeto seguindo este esqueleto para organizar os layouts:

```text
src/
 ┣ app/
 ┃ ┣ (cliente)/
 ┃ ┃ ┣ [loja_slug]/
 ┃ ┃ ┃ ┣ carrinho/page.tsx
 ┃ ┃ ┃ ┣ checkout/page.tsx
 ┃ ┃ ┃ ┣ produto/
 ┃ ┃ ┃ ┃ ┗ [id]/page.tsx
 ┃ ┃ ┃ ┗ page.tsx
 ┃ ┃ ┗ layout.tsx          <-- Layout claro, Navbar simplificada
 ┃ ┣ (admin)/
 ┃ ┃ ┣ admin/
 ┃ ┃ ┃ ┣ login/page.tsx
 ┃ ┃ ┃ ┣ pdv/page.tsx
 ┃ ┃ ┃ ┣ cozinha/page.tsx
 ┃ ┃ ┃ ┣ produtos/page.tsx
 ┃ ┃ ┃ ┗ dashboard/page.tsx
 ┃ ┃ ┗ layout.tsx          <-- Layout escuro, Sidebar completa (Shadcn/UI)
 ┃ ┣ (garcom)/
 ┃ ┃ ┣ garcom/
 ┃ ┃ ┃ ┣ mesa/
 ┃ ┃ ┃ ┃ ┗ [numero]/page.tsx
 ┃ ┃ ┃ ┗ page.tsx
 ┃ ┃ ┗ layout.tsx          <-- Layout mobile-first, Bottom navigation
```
