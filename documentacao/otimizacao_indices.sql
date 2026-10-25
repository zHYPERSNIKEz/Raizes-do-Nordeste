-- ==============================================================================
-- OTIMIZAÇÃO DE PERFORMANCE: ÍNDICES DO RESTAURANTE RAÍZES DO NORDESTE
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Acelera o Dashboard de Vendas (/admin/dashboard)
-- Filtro por loja_id, pago = true e ordenação por criado_em
CREATE INDEX IF NOT EXISTS idx_pedidos_dashboard 
ON pedidos(loja_id, pago, criado_em);

-- 2. Acelera o Kanban da Cozinha (/admin/cozinha)
-- Filtro por loja_id, status e ordenação cronológica da fila
CREATE INDEX IF NOT EXISTS idx_pedidos_cozinha 
ON pedidos(loja_id, status, criado_em);

-- 3. Acelera a Gestão de Pedidos (/admin/pedidos)
-- Ordenação dos pedidos mais recentes
CREATE INDEX IF NOT EXISTS idx_pedidos_criado_em 
ON pedidos(loja_id, criado_em DESC);

-- 4. Acelera a Lista de Produtos (/admin/produtos e Vitrine)
-- Agrupamento por categoria e ordenação por nome
CREATE INDEX IF NOT EXISTS idx_produtos_loja_categoria_nome 
ON produtos(loja_id, categoria, nome);

-- 5. Acelera o Join entre Itens do Pedido e Produtos
CREATE INDEX IF NOT EXISTS idx_itens_pedido_produto 
ON itens_pedido(produto_id);

-- 6. Acelera a consulta de Clientes (/admin/clientes)
CREATE INDEX IF NOT EXISTS idx_perfis_cargo 
ON perfis(cargo, criado_em DESC);
