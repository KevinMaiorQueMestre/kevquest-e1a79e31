
-- Add user_id column to all tables for future multi-user support
ALTER TABLE public.disciplinas ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.conteudos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.questoes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.motivos_erro ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access to disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Allow all access to conteudos" ON public.conteudos;
DROP POLICY IF EXISTS "Allow all access to questoes" ON public.questoes;
DROP POLICY IF EXISTS "Allow all access to motivos_erro" ON public.motivos_erro;

-- Create new RLS policies that allow access when user_id matches OR is null (backward compat)
CREATE POLICY "Users can manage own disciplinas" ON public.disciplinas FOR ALL USING (user_id IS NULL OR user_id = auth.uid()) WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can manage own conteudos" ON public.conteudos FOR ALL USING (user_id IS NULL OR user_id = auth.uid()) WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can manage own questoes" ON public.questoes FOR ALL USING (user_id IS NULL OR user_id = auth.uid()) WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can manage own motivos_erro" ON public.motivos_erro FOR ALL USING (user_id IS NULL OR user_id = auth.uid()) WITH CHECK (user_id IS NULL OR user_id = auth.uid());
