
-- Table for diagnostic error reasons (motivos de erro)
CREATE TABLE public.motivos_erro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.motivos_erro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to motivos_erro" ON public.motivos_erro
  FOR ALL USING (true) WITH CHECK (true);

-- Add new columns to questoes
ALTER TABLE public.questoes
  ADD COLUMN data_limite TIMESTAMP WITH TIME ZONE,
  ADD COLUMN diagnostico_motivo_id UUID REFERENCES public.motivos_erro(id);

-- Seed some default motivos
INSERT INTO public.motivos_erro (nome) VALUES
  ('Desatenção'),
  ('Falta de conhecimento'),
  ('Erro de cálculo'),
  ('Interpretação errada'),
  ('Tempo insuficiente');
