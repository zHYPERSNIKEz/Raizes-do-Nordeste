# Arquitetura e Mapa de Rotas — Raízes do Nordeste

Este documento descreve a organização arquitetural das rotas da aplicação **Raízes do Nordeste**, construída sobre o **Next.js 16 (App Router)** com Route Groups isolados por perfil de acesso (RBAC).

---

## 1. Visão Geral de Route Groups (`src/app`)

```text
src/app/
 ┣ (cliente)/                        # Layout público e área do cliente (Tema Claro/Escuro Regional)
 ┃ ┣ page.tsx                        # Vitrine principal, busca, categorias e status da loja
 ┃ ┣ produto/[id]/page.tsx           # Customização do prato (remoção de ingredientes e adicionais)
 ┃ ┣ checkout/page.tsx               # Checkout (Delivery / Balcão, endereços, Pix / Crédito / Débito)
 ┃ ┣ pedido/[id]/page.tsx            # Acompanhamento em tempo real (Realtime) + Pagamento Online
 ┃ ┣ pedidos/page.tsx                # Histórico de pedidos do cliente autenticado
 ┃ ┣ perfil/page.tsx                 # Gestão de dados cadastrais, senha e múltiplos endereços
 ┃ ┣ login/page.tsx                  # Autenticação e cadastro de clientes com aceite LGPD
 ┃ ┗ privacidade/page.tsx            # Política de Privacidade completa e direitos do titular (LGPD)
 ┃
 ┣ (admin-login)/
 ┃ ┗ admin/login/page.tsx            # Portal de acesso exclusivo para colaboradores (redireciona por cargo)
 ┃
 ┣ (admin)/                          # Painel Administrativo e Operacional (Dark Mode Profissional)
 ┃ ┣ admin/dashboard/page.tsx        # Indicadores financeiros, gráficos de vendas e ranking de produtos
 ┃ ┣ admin/caixa/page.tsx            # Abertura/fechamento de caixa, sangrias e suprimentos
 ┃ ┣ admin/pedidos/page.tsx          # Gestão de pedidos em tempo real com alerta sonoro e filtros
 ┃ ┣ admin/cozinha/page.tsx          # Kanban da Cozinha em tempo real (Na Fila -> Preparando -> Pronto)
 ┃ ┣ admin/produtos/page.tsx         # Gestão de cardápio + Importação automática via IA (Google Gemini)
 ┃ ┣ admin/complementos/page.tsx     # Gestão de grupos de complementos e adicionais
 ┃ ┣ admin/equipe/page.tsx           # Cadastro de colaboradores, cargos e permissões granulares
 ┃ ┣ admin/clientes/page.tsx         # Base de clientes cadastrados no restaurante
 ┃ ┗ admin/configuracoes/page.tsx    # Status da loja (Aberta/Fechada), tempo médio e taxa de entrega
 ┃
 ┣ (garcom)/                         # Módulo Mobile-First para Atendimento de Salão
 ┃ ┣ garcom/page.tsx                 # Mapa de mesas abertas, parciais e abertura de nova mesa
 ┃ ┣ garcom/mesa/[numero]/page.tsx   # Lançamento de pedidos na comanda da mesa direto para a cozinha
 ┃ ┗ garcom/mesa/[numero]/conta/     # Extrato por rodada e fechamento financeiro da conta da mesa
 ┃
 ┣ (entregador)/                     # Módulo Mobile-First para Logística de Entregas
 ┃ ┗ entregador/page.tsx             # Fila de coleta, integração GPS (Google Maps), WhatsApp e baixa
 ┃
 ┗ api/                              # Rotas de API Backend (Route Handlers)
   ┣ mercadopago/pagamento/route.ts  # Criação/consulta de pagamentos Pix, Cartão e Simulação Sandbox
   ┣ mercadopago/webhook/route.ts    # Recebimento de notificações assíncronas do Mercado Pago
   ┗ cron/keep-alive/route.ts        # Job periódico (Vercel Cron) para manter o banco ativo
```

---

## 2. Matriz de Controle de Acesso Baseado em Papéis (RBAC)

A validação de sessão é centralizada em `src/lib/admin.ts` através de `React.cache()`, garantindo verificação de segurança no servidor com apenas 1 consulta por requisição HTTP:

| Rota / Módulo | `CLIENTE` | `COZINHA` | `GARCOM` | `ENTREGADOR` | `GERENTE` | `ADMIN` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Vitrine, Sacola, Checkout e Meus Pedidos (`/`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kanban da Cozinha (`/admin/cozinha`) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Painel do Garçom e Mesas (`/garcom`) | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Painel do Entregador (`/entregador`) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gestão de Pedidos (`/admin/pedidos`) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Controle de Caixa (`/admin/caixa`) | ❌ | Permissão* | Permissão* | Permissão* | ✅ | ✅ |
| Gestão de Cardápio + IA (`/admin/produtos`) | ❌ | Permissão* | Permissão* | Permissão* | ✅ | ✅ |
| Dashboard e Relatórios (`/admin/dashboard`) | ❌ | Permissão* | Permissão* | Permissão* | ✅ | ✅ |
| Gestão de Equipe e Configurações (`/admin/equipe`) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*\*Qualquer colaborador pode receber permissões granulares individuais (`acesso_caixa`, `acesso_produtos`, `acesso_relatorios`) atribuídas pelo Administrador em `/admin/equipe`.*
