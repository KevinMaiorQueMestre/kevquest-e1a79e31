
-- Fix RLS policies: drop restrictive policies and recreate as permissive
-- provas
DROP POLICY IF EXISTS "Users manage own provas" ON public.provas;
CREATE POLICY "Users manage own provas"
  ON public.provas
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- disciplinas
DROP POLICY IF EXISTS "Users manage own disciplinas" ON public.disciplinas;
CREATE POLICY "Users manage own disciplinas"
  ON public.disciplinas
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- conteudos
DROP POLICY IF EXISTS "Users manage own conteudos" ON public.conteudos;
CREATE POLICY "Users manage own conteudos"
  ON public.conteudos
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- motivos_erro
DROP POLICY IF EXISTS "Users manage own motivos_erro" ON public.motivos_erro;
CREATE POLICY "Users manage own motivos_erro"
  ON public.motivos_erro
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- questoes
DROP POLICY IF EXISTS "Users manage own questoes" ON public.questoes;
CREATE POLICY "Users manage own questoes"
  ON public.questoes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- profiles
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- whatsapp_logs
DROP POLICY IF EXISTS "Service can insert logs" ON public.whatsapp_logs;
CREATE POLICY "Service can insert logs"
  ON public.whatsapp_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users read own whatsapp logs" ON public.whatsapp_logs;
CREATE POLICY "Users read own whatsapp logs"
  ON public.whatsapp_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- detalhamentos_prova
DROP POLICY IF EXISTS "Users manage own detalhamentos_prova" ON public.detalhamentos_prova;
CREATE POLICY "Users manage own detalhamentos_prova"
  ON public.detalhamentos_prova
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
