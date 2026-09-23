# Plano de Ação: Gestão de Cardápio e Inteligência Artificial

Este documento descreve o fluxo passo a passo para refatorar a estrutura de produtos e adicionar a importação automática de cardápio via Inteligência Artificial.

## Fase 1: Correções Imediatas
- [x] Corrigido o bug visual na tela de `Gestão de Produtos` onde o preço aparecia como `R$ NaN` (o campo correto no banco é `preco` e não `preco_base`).

## Fase 2: Estruturação do Banco de Dados (Supabase)
Criaremos o sistema de "Complementos Globais" para permitir a escalabilidade e reaproveitamento de adicionais.
- **Tabela `complemento_grupos`**: Armazena os grupos de opções.
  - Colunas: `id`, `loja_id`, `nome` (ex: "Escolha seu Pão"), `obrigatorio` (boolean), `min_escolhas`, `max_escolhas`.
- **Tabela `complemento_itens`**: Armazena as opções de dentro do grupo.
  - Colunas: `id`, `grupo_id`, `nome` (ex: "Pão Australiano"), `preco` (ex: 2.00), `ativo`.
- **Tabela `produto_complementos`**: Faz a ligação (vínculo) entre o Produto e o Grupo.
  - Colunas: `produto_id`, `grupo_id`.

## Fase 3: Interface do Administrador (Painel)
- Criar a nova tela **"Grupos e Adicionais"** (acessível pelo novo botão 🧩 na tela de Gestão de Produtos).
- Nesta tela, o administrador poderá criar, editar e excluir os Grupos Globais e seus respectivos Itens e Preços.
- Atualizar a tela **"Editar Produto"**:
  - Remover a ideia de pães/opções da antiga lista "Ingredientes Base".
  - Adicionar o botão **"➕ Vincular Grupo"**.
  - O administrador poderá clicar e marcar quais grupos globais pertencem àquele hambúrguer (ex: Vinculando o grupo "Pães Artesanais").

## Fase 4: Interface do Cliente (Vitrine e Carrinho)
- Atualizar a modal de "Adicionar ao Carrinho" na vitrine.
- Quando o cliente clicar no produto, o sistema buscará no Supabase todos os "Grupos" vinculados àquele item.
- Exibir dinamicamente os **Botões de Rádio (Radio Buttons)** para escolhas obrigatórias (ex: Escolher Pão) antes de deixar o cliente finalizar o item.
- Exibir os **Checkboxes** para opções não-obrigatórias (ex: Adicionar Bacon extra).
- Atualizar o cálculo do subtotal do carrinho para somar o valor do pão/adicional escolhido.

## Fase 5: A Mágica da IA (Importação Automática)
- Criar o botão **"✨ Importar Cardápio (PDF/Foto)"** na tela de Gestão de Produtos.
- Criar a **Server Action** (backend) que recebe a imagem e se conecta à **Google Gemini API**.
- Escrever um `prompt` rigoroso ordenando a IA a retornar o cardápio em formato JSON, mapeando automaticamente:
  - Nome, Descrição e Preço do produto.
  - Identificando padrões no texto como *(Acompanha Pão Brioche ou Australiano)* para transformar magicamente isso em "Grupos de Escolha" vinculados.
- Criar uma **Tela de Rascunho (Preview)** onde o gerente visualiza o que a IA leu antes de aprovar.
- Ao clicar em "Salvar", salvar tudo (produtos, grupos e vínculos) automaticamente no Supabase.

