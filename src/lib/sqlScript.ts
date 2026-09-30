/**
 * Script SQL para criar a tabela de chamados e as políticas de armazenamento (Storage e Tabelas) no Supabase.
 * O usuário pode copiar e colar este script no SQL Editor do Supabase (supabase.com).
 */
export const SUPABASE_SQL_SCRIPT = `-- ====================================================================
-- SCRIPT COMPLETO: BANCO DE DADOS & POLÍTICAS DE ARMAZENAMENTO (SUPABASE)
-- Execute no SQL Editor do seu projeto Supabase (supabase.com)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TABELA PRINCIPAL: chamados
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chamados (
    id TEXT PRIMARY KEY,
    codigo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    equipamento TEXT NOT NULL,
    setor TEXT NOT NULL,
    categoria TEXT NOT NULL,
    prioridade TEXT NOT NULL,
    descricao_problema TEXT NOT NULL,
    operador_nome TEXT NOT NULL,
    operador_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'aberto',
    
    -- Dados de atendimento e encerramento pelo Mecânico
    mecanico_nome TEXT,
    mecanico_id TEXT,
    descricao_solucao TEXT,
    causa_raiz TEXT,
    pecas_utilizadas TEXT,
    tempo_reparo_minutos INTEGER,
    maquina_liberada BOOLEAN DEFAULT true,
    recomendacoes TEXT,
    
    -- Anexos / Fotos (URLs armazenadas)
    foto_problema_url TEXT,
    foto_solucao_url TEXT,
    
    -- Datas de controle
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    data_atendimento TIMESTAMPTZ,
    data_encerramento TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- --------------------------------------------------------------------
-- 2. ÍNDICES DE PERFORMANCE
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_chamados_status ON public.chamados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_prioridade ON public.chamados(prioridade);
CREATE INDEX IF NOT EXISTS idx_chamados_created_at ON public.chamados(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chamados_setor ON public.chamados(setor);

-- --------------------------------------------------------------------
-- 3. POLÍTICAS DE SEGURANÇA (RLS - ROW LEVEL SECURITY) DA TABELA
-- --------------------------------------------------------------------
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;

-- Política de Leitura: Permite consultar os chamados
DROP POLICY IF EXISTS "Permitir leitura de chamados" ON public.chamados;
CREATE POLICY "Permitir leitura de chamados" 
ON public.chamados FOR SELECT 
TO public
USING (true);

-- Política de Inserção: Operadores e mecânicos podem registrar chamados
DROP POLICY IF EXISTS "Permitir insercao de chamados" ON public.chamados;
CREATE POLICY "Permitir insercao de chamados" 
ON public.chamados FOR INSERT 
TO public
WITH CHECK (true);

-- Política de Atualização: Permite ao mecânico assumir e encerrar chamados
DROP POLICY IF EXISTS "Permitir atualizacao de chamados" ON public.chamados;
CREATE POLICY "Permitir atualizacao de chamados" 
ON public.chamados FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Política de Exclusão: Permite remoção caso necessário
DROP POLICY IF EXISTS "Permitir delecao de chamados" ON public.chamados;
CREATE POLICY "Permitir delecao de chamados" 
ON public.chamados FOR DELETE 
TO public
USING (true);

-- --------------------------------------------------------------------
-- 4. BUCKET DE STORAGE (ARMAZENAMENTO DE FOTOS/ANEXOS) & POLÍTICAS
-- --------------------------------------------------------------------
-- Cria o bucket público 'anexos-chamados' para fotos das máquinas/peças
INSERT INTO storage.buckets (id, name, public)
VALUES ('anexos-chamados', 'anexos-chamados', true)
ON CONFLICT (id) DO NOTHING;

-- Política de Armazenamento: Permitir visualização pública de fotos
DROP POLICY IF EXISTS "Permitir download publico de anexos" ON storage.objects;
CREATE POLICY "Permitir download publico de anexos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'anexos-chamados');

-- Política de Armazenamento: Permitir upload de fotos/documentos
DROP POLICY IF EXISTS "Permitir upload de fotos de chamados" ON storage.objects;
CREATE POLICY "Permitir upload de fotos de chamados"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'anexos-chamados');

-- Política de Armazenamento: Permitir atualização de arquivos
DROP POLICY IF EXISTS "Permitir atualizacao de anexos" ON storage.objects;
CREATE POLICY "Permitir atualizacao de anexos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'anexos-chamados');

-- Política de Armazenamento: Permitir exclusão de arquivos
DROP POLICY IF EXISTS "Permitir exclusao de anexos" ON storage.objects;
CREATE POLICY "Permitir exclusao de anexos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'anexos-chamados');

-- --------------------------------------------------------------------
-- 5. ATIVAÇÃO DE TEMPO REAL (REALTIME)
-- --------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.chamados;
`;
