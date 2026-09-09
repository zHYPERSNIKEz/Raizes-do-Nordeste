# Stack Tecnológica - SaaS Arte Hamburgueria

Este documento consolida as tecnologias escolhidas para o desenvolvimento do sistema, focando em performance, escalabilidade e produtividade.

## Front-End (Interface e Roteamento)
* **React com Next.js (App Router):** Framework principal. O Next.js permite renderizar o cardápio no servidor (SSR) ou de forma estática (SSG), garantindo que a página do cliente abra instantaneamente, mesmo em conexões 3G. O App Router facilita a separação de layouts entre Cliente, Garçom e Admin.
* **Tailwind CSS:** Framework de estilização utilitária. Essencial para aplicar as variáveis de cores da marca (Azul, Laranja, Vermelho) e construir o Dark Mode do painel administrativo sem a necessidade de arquivos CSS complexos.
* **Shadcn/UI:** Biblioteca de componentes acessíveis e customizáveis (tabelas, modais, botões, formulários). Acelera drasticamente a construção do PDV e do dashboard, mantendo um design profissional e alinhado com o Tailwind.

## Back-End e Banco de Dados
* **Supabase:** Plataforma completa de Backend-as-a-Service (BaaS) baseada em PostgreSQL.
  * **Banco de Dados (Postgres):** Armazenamento relacional robusto, ideal para a estrutura multi-tenant (várias lojas) e para manter a integridade financeira dos pedidos e do caixa.
  * **Autenticação (Auth):** Gerenciamento seguro de login para os funcionários (Dono, Caixa, Cozinha, Garçom).
  * **Realtime (WebSockets):** O recurso mais crítico para a operação. Permite que o Kanban da cozinha seja atualizado em tempo real assim que um pedido é pago ou lançado pelo garçom, sem precisar recarregar a página.
  * **Storage:** Armazenamento otimizado para as fotos dos hambúrgueres.

## Hospedagem e Deploy
* **Vercel:** Plataforma de hospedagem nativa para Next.js. Oferece deploy automático via GitHub (Preview Deployments) e escala horizontalmente de forma automática nos dias de pico (ex: sexta e sábado à noite), evitando que o sistema caia pelo alto volume de clientes acessando o cardápio simultaneamente.
