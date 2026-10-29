-- ============================================================================
-- SCRIPT SQL COMPLETO: RAÍZES DO NORDESTE - SISTEMA DE DELIVERY E GESTÃO (ERP)
-- Banco de Dados: PostgreSQL (Supabase)
-- ============================================================================

-- 1. Tabela de Lojas (Configurações Globais do Restaurante)
CREATE TABLE IF NOT EXISTS public.lojas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  aberta BOOLEAN DEFAULT TRUE,
  ativo BOOLEAN DEFAULT TRUE,
  taxa_entrega NUMERIC(10,2) DEFAULT 0.00,
  tempo_espera TEXT DEFAULT '30-45 min',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Perfis (Extensão de auth.users com RBAC e Endereços Salvos)
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  loja_id UUID REFERENCES public.lojas(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  cargo TEXT NOT NULL DEFAULT 'CLIENTE' CHECK (cargo IN ('ADMIN', 'GERENTE', 'COZINHA', 'GARCOM', 'ENTREGADOR', 'CLIENTE')),
  permissoes JSONB DEFAULT '[]'::jsonb,
  enderecos_salvos JSONB DEFAULT '[]'::jsonb,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Produtos (Cardápio)
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  imagem_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  ingredientes_base JSONB DEFAULT '[]'::jsonb,
  adicionais JSONB DEFAULT '[]'::jsonb,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabelas de Grupos de Complementos e Adicionais
CREATE TABLE IF NOT EXISTS public.complemento_grupos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  obrigatorio BOOLEAN DEFAULT FALSE,
  min_escolhas INT DEFAULT 0,
  max_escolhas INT DEFAULT 1,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.complemento_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo_id UUID REFERENCES public.complemento_grupos(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  preco NUMERIC(10,2) DEFAULT 0.00,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.produto_complementos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  grupo_id UUID REFERENCES public.complemento_grupos(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(produto_id, grupo_id)
);

-- 5. Tabelas Financeiras (Controle de Turnos de Caixa, Sangrias e Suprimentos)
CREATE TABLE IF NOT EXISTS public.caixas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'FECHADO')),
  valor_abertura NUMERIC(10,2) DEFAULT 0.00,
  valor_fechamento_sistema NUMERIC(10,2),
  valor_fechamento_real NUMERIC(10,2),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  fechado_em TIMESTAMP WITH TIME ZONE,
  observacoes TEXT
);

CREATE TABLE IF NOT EXISTS public.movimentacoes_caixa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caixa_id UUID REFERENCES public.caixas(id) ON DELETE CASCADE NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('SANGRIA', 'SUPRIMENTO')),
  valor NUMERIC(10,2) NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Pedidos (Delivery, Retirada no Balcão e Atendimento de Mesas)
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido SERIAL,
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  cliente_nome TEXT NOT NULL,
  telefone TEXT,
  tipo_consumo TEXT NOT NULL CHECK (tipo_consumo IN ('DELIVERY', 'LOCAL', 'BALCAO')),
  mesa TEXT,
  endereco JSONB,
  status TEXT DEFAULT 'NA_FILA' CHECK (status IN ('NA_FILA', 'PREPARANDO', 'PRONTO', 'DESPACHADO', 'ENTREGUE', 'FINALIZADO', 'CANCELADO')),
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'CARTAO')),
  pago BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS public.itens_pedido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE RESTRICT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10,2) NOT NULL,
  observacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- ÍNDICES COMPOSTOS DE ALTA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_pedidos_loja_status_criado ON public.pedidos (loja_id, status, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_loja_pago_criado ON public.pedidos (loja_id, pago, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON public.pedidos (user_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido_id ON public.itens_pedido (pedido_id);
CREATE INDEX IF NOT EXISTS idx_produtos_loja_categoria ON public.produtos (loja_id, categoria, nome);
CREATE INDEX IF NOT EXISTS idx_caixas_loja_status ON public.caixas (loja_id, status);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_caixa_id ON public.movimentacoes_caixa (caixa_id, criado_em DESC);
