import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Disciplina = Tables<"disciplinas">;
export type Conteudo = Tables<"conteudos">;
export type Questao = Tables<"questoes">;
export type QuestaoInsert = TablesInsert<"questoes">;
export type ConteudoInsert = TablesInsert<"conteudos">;
export type DisciplinaInsert = TablesInsert<"disciplinas">;
export type MotivoErro = Tables<"motivos_erro">;

export type EstagioFunil = "Quarentena" | "Diagnostico" | "UTI" | "Refacao" | "Consolidada";

export const ESTAGIO_ORDER: EstagioFunil[] = ["Quarentena", "Diagnostico", "UTI", "Refacao", "Consolidada"];

export const ESTAGIO_LABELS: Record<EstagioFunil, string> = {
  Quarentena: "Quarentena",
  Diagnostico: "Diagnóstico",
  UTI: "UTI",
  Refacao: "Refação",
  Consolidada: "Consolidada",
};

export function getNextStage(current: EstagioFunil): EstagioFunil | null {
  const idx = ESTAGIO_ORDER.indexOf(current);
  if (idx < 0 || idx >= ESTAGIO_ORDER.length - 1) return null;
  return ESTAGIO_ORDER[idx + 1];
}

export function useDisciplinas() {
  return useQuery({
    queryKey: ["disciplinas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disciplinas")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useConteudos(disciplinaId?: string) {
  return useQuery({
    queryKey: ["conteudos", disciplinaId],
    queryFn: async () => {
      let query = supabase.from("conteudos").select("*").order("nome");
      if (disciplinaId) query = query.eq("disciplina_id", disciplinaId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useMotivosErro() {
  return useQuery({
    queryKey: ["motivos_erro"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motivos_erro")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useQuestoes() {
  return useQuery({
    queryKey: ["questoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questoes")
        .select("*, disciplinas(nome), conteudos(nome), motivos_erro(nome)")
        .order("data_resolucao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddQuestao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questao: QuestaoInsert) => {
      const { data, error } = await supabase.from("questoes").insert(questao).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questoes"] }),
  });
}

export function useUpdateQuestao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from("questoes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questoes"] }),
  });
}

export function useUpdateQuestaoStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estagio_funil }: { id: string; estagio_funil: EstagioFunil }) => {
      const { data, error } = await supabase
        .from("questoes")
        .update({ estagio_funil })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questoes"] }),
  });
}

export function useDeleteQuestao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("questoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questoes"] }),
  });
}

export function useAddDisciplina() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase.from("disciplinas").insert({ nome }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disciplinas"] }),
  });
}

export function useAddConteudo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conteudo: ConteudoInsert) => {
      const { data, error } = await supabase.from("conteudos").insert(conteudo).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conteudos"] }),
  });
}

export function useAddMotivoErro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase.from("motivos_erro").insert({ nome }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["motivos_erro"] }),
  });
}

export function useDeleteMotivoErro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("motivos_erro").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["motivos_erro"] }),
  });
}
