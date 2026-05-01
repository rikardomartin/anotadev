-- ============================================
-- AnotaDev - Setup do Banco de Dados Supabase
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- Tabela principal de projetos
CREATE TABLE IF NOT EXISTS projetos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  github_url TEXT DEFAULT '',
  contas_vinculadas JSONB DEFAULT '[]'::jsonb,
  descricao TEXT DEFAULT '',
  pendencias JSONB DEFAULT '[]'::jsonb,
  concluidos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem e gerenciam seus próprios projetos
-- IMPORTANTE: O user_id é o UID do Firebase (string), não o UUID do Supabase Auth
CREATE POLICY "Users can manage own projects"
  ON projetos
  FOR ALL
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Alternativa mais simples (sem RLS por JWT, usando anon key com user_id manual):
-- Se preferir desabilitar RLS temporariamente para testes:
-- ALTER TABLE projetos DISABLE ROW LEVEL SECURITY;

-- Índice para performance
CREATE INDEX IF NOT EXISTS projetos_user_id_idx ON projetos(user_id);
CREATE INDEX IF NOT EXISTS projetos_created_at_idx ON projetos(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projetos_updated_at
  BEFORE UPDATE ON projetos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
