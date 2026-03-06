
-- Delete legacy data with no user_id
DELETE FROM public.questoes WHERE user_id IS NULL;
DELETE FROM public.conteudos WHERE user_id IS NULL;
DELETE FROM public.disciplinas WHERE user_id IS NULL;
DELETE FROM public.motivos_erro WHERE user_id IS NULL;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can manage own disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Users can manage own conteudos" ON public.conteudos;
DROP POLICY IF EXISTS "Users can manage own questoes" ON public.questoes;
DROP POLICY IF EXISTS "Users can manage own motivos_erro" ON public.motivos_erro;

-- Strict RLS: only authenticated users, only own data
CREATE POLICY "Users manage own disciplinas" ON public.disciplinas
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own conteudos" ON public.conteudos
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own questoes" ON public.questoes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own motivos_erro" ON public.motivos_erro
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Make user_id NOT NULL with default
ALTER TABLE public.disciplinas ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.disciplinas ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.conteudos ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.conteudos ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.questoes ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.questoes ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.motivos_erro ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.motivos_erro ALTER COLUMN user_id SET NOT NULL;
