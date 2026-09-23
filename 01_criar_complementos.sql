-- Fase 2: Estrutura para Grupos e Complementos
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de Grupos de Complementos
CREATE TABLE IF NOT EXISTS public.complemento_grupos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    loja_id uuid REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
    nome text NOT NULL, -- Ex: "Escolha seu Pão"
    obrigatorio boolean DEFAULT false,
    min_escolhas integer DEFAULT 0,
    max_escolhas integer DEFAULT 1,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e criar políticas para complemento_grupos
ALTER TABLE public.complemento_grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de complemento_grupos"
    ON public.complemento_grupos FOR SELECT
    USING (true);

CREATE POLICY "Permitir tudo para usuários autenticados em complemento_grupos"
    ON public.complemento_grupos FOR ALL
    USING (auth.role() = 'authenticated');


-- 2. Tabela de Itens do Grupo (As opções, ex: "Pão Australiano")
CREATE TABLE IF NOT EXISTS public.complemento_itens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    grupo_id uuid REFERENCES public.complemento_grupos(id) ON DELETE CASCADE NOT NULL,
    nome text NOT NULL,
    preco numeric(10,2) DEFAULT 0.00,
    ativo boolean DEFAULT true,
    ordem integer DEFAULT 0, -- Para ordenar as opções
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e criar políticas para complemento_itens
ALTER TABLE public.complemento_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de complemento_itens"
    ON public.complemento_itens FOR SELECT
    USING (true);

CREATE POLICY "Permitir tudo para usuários autenticados em complemento_itens"
    ON public.complemento_itens FOR ALL
    USING (auth.role() = 'authenticated');


-- 3. Tabela de Vínculo: Quais produtos têm quais grupos
CREATE TABLE IF NOT EXISTS public.produto_complementos (
    produto_id uuid REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
    grupo_id uuid REFERENCES public.complemento_grupos(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (produto_id, grupo_id)
);

-- Habilitar RLS e criar políticas para produto_complementos
ALTER TABLE public.produto_complementos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de produto_complementos"
    ON public.produto_complementos FOR SELECT
    USING (true);

CREATE POLICY "Permitir tudo para usuários autenticados em produto_complementos"
    ON public.produto_complementos FOR ALL
    USING (auth.role() = 'authenticated');

