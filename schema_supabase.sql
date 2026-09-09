-- ==========================================
-- SCRIPT SQL: SAAS ARTE HAMBURGUERIA (SUPABASE)
-- ==========================================

-- 1. Tabela de Lojas (Iniciando o Multi-tenant)
CREATE TABLE lojas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- Ex: 'arte-hamburgueria' (usado na URL)
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Usuários / Funcionários (Extensão do auth.users do Supabase)
CREATE TABLE perfis (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL CHECK (cargo IN ('DONO', 'CAIXA', 'COZINHA', 'GARCOM')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Produtos (Cardápio)
CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL, -- Ex: 'Artesanais', 'Smash', 'Bebidas'
  imagem_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Caixa (Gestão de Turnos)
CREATE TABLE caixas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
  aberto_por UUID REFERENCES auth.users(id),
  aberto_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  fechado_em TIMESTAMP WITH TIME ZONE,
  saldo_inicial DECIMAL(10,2) DEFAULT 0.00,
  saldo_final DECIMAL(10,2),
  status TEXT DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'FECHADO'))
);

-- 5. Tabela de Pedidos
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
  caixa_id UUID REFERENCES caixas(id), -- Vincula a venda ao turno do caixa
  cliente_nome TEXT,
  telefone TEXT,
  tipo_consumo TEXT NOT NULL CHECK (tipo_consumo IN ('DELIVERY', 'LOCAL', 'BALCAO')),
  mesa TEXT, -- Usado se o tipo_consumo for LOCAL
  status TEXT DEFAULT 'NA_FILA' CHECK (status IN ('NA_FILA', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA', 'FINALIZADO', 'CANCELADO')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO')),
  pago BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Itens do Pedido
CREATE TABLE itens_pedido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL, -- Salva o preço na hora da compra (histórico não muda se o lanche ficar mais caro depois)
  observacao TEXT, -- Ex: 'Sem cebola', 'Carne bem passada'
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- INDEXAÇÃO PARA PERFORMANCE (ALTO FLUXO)
-- ==========================================
-- Criação de índices nas colunas mais buscadas para evitar travamentos
CREATE INDEX idx_produtos_loja ON produtos(loja_id);
CREATE INDEX idx_pedidos_loja_status ON pedidos(loja_id, status);
CREATE INDEX idx_itens_pedido ON itens_pedido(pedido_id);
