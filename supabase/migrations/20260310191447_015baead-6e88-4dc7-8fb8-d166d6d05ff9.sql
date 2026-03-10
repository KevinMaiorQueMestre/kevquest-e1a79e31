
-- Create provas table
CREATE TABLE public.provas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own provas" ON public.provas
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add prova_id FK to questoes (nullable, replaces text field)
ALTER TABLE public.questoes ADD COLUMN prova_id UUID REFERENCES public.provas(id) ON DELETE SET NULL;

-- Add refação scheduling columns
ALTER TABLE public.questoes ADD COLUMN refacao_etapa SMALLINT DEFAULT NULL;
ALTER TABLE public.questoes ADD COLUMN data_refacao_1 DATE DEFAULT NULL;
ALTER TABLE public.questoes ADD COLUMN data_refacao_2 DATE DEFAULT NULL;
ALTER TABLE public.questoes ADD COLUMN data_refacao_3 DATE DEFAULT NULL;
