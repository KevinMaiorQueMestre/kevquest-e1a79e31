
-- Create enum for funnel stages
CREATE TYPE public.estagio_funil AS ENUM ('Quarentena', 'Diagnostico', 'UTI', 'Refacao', 'Consolidada');

-- Table: Disciplinas (Subjects)
CREATE TABLE public.disciplinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: Conteudos (Topics)
CREATE TABLE public.conteudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: Questoes (Questions)
CREATE TABLE public.questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_resolucao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  identificador_prova VARCHAR,
  estagio_funil public.estagio_funil NOT NULL DEFAULT 'Quarentena',
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id),
  conteudo_id UUID NOT NULL REFERENCES public.conteudos(id),
  sub_conteudo VARCHAR,
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth for V1 - single user app)
CREATE POLICY "Allow all access to disciplinas" ON public.disciplinas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to conteudos" ON public.conteudos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to questoes" ON public.questoes FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_questoes_disciplina ON public.questoes(disciplina_id);
CREATE INDEX idx_questoes_conteudo ON public.questoes(conteudo_id);
CREATE INDEX idx_questoes_estagio ON public.questoes(estagio_funil);
CREATE INDEX idx_conteudos_disciplina ON public.conteudos(disciplina_id);

-- Seed some common Brazilian exam subjects
INSERT INTO public.disciplinas (nome) VALUES
  ('Física'),
  ('Química'),
  ('Matemática'),
  ('Biologia'),
  ('História'),
  ('Geografia'),
  ('Português'),
  ('Literatura'),
  ('Filosofia'),
  ('Sociologia');
