
-- Add numero_questao to questoes
ALTER TABLE public.questoes ADD COLUMN IF NOT EXISTS numero_questao varchar;

-- Create detalhamentos_prova table
CREATE TABLE IF NOT EXISTS public.detalhamentos_prova (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar NOT NULL,
  prova_id uuid NOT NULL REFERENCES public.provas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.detalhamentos_prova ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own detalhamentos_prova"
  ON public.detalhamentos_prova
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add detalhamento_prova_id to questoes
ALTER TABLE public.questoes ADD COLUMN IF NOT EXISTS detalhamento_prova_id uuid REFERENCES public.detalhamentos_prova(id) ON DELETE SET NULL;
