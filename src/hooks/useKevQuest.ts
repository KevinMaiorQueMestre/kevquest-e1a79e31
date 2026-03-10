import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export type Disciplina = Tables<"disciplinas">;
export type Conteudo = Tables<"conteudos">;
export type Questao = Tables<"questoes">;
export type QuestaoInsert = TablesInsert<"questoes">;
export type ConteudoInsert = TablesInsert<"conteudos">;
export type DisciplinaInsert = TablesInsert<"disciplinas">;
export type MotivoErro = Tables<"motivos_erro">;
export type Prova = Tables<"provas">;

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

/** Add N days skipping Sundays */
export function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0) added++; // skip Sunday (0)
  }
  return result;
}

/** Calculate the 3 refação dates from a start date */
export function calcRefacaoDates(startDate: Date) {
  const d1 = addBusinessDays(startDate, 3);
  const d2 = addBusinessDays(d1, 7);
  const d3 = addBusinessDays(d2, 21);
  return {
    data_refacao_1: d1.toISOString().split("T")[0],
    data_refacao_2: d2.toISOString().split("T")[0],
    data_refacao_3: d3.toISOString().split("T")[0],
  };
}

// ─── Disciplinas ───
export function useDisciplinas() {
  return useQuery({
    queryKey: ["disciplinas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("disciplinas").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useAddDisciplina() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase.from("disciplinas").insert({ nome, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["disciplinas"] }),
  });
}

export function useUpdateDisciplina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      const { data, error } = await supabase.from("disciplinas").update({ nome }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["disciplinas"] }),
  });
}

export function useDeleteDisciplina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("disciplinas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disciplinas"] });
      qc.invalidateQueries({ queryKey: ["conteudos"] });
      qc.invalidateQueries({ queryKey: ["questoes"] });
    },
  });
}

// ─── Conteúdos ───
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

export function useAddConteudo() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (conteudo: ConteudoInsert) => {
      const { data, error } = await supabase.from("conteudos").insert({ ...conteudo, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conteudos"] }),
  });
}

export function useUpdateConteudo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      const { data, error } = await supabase.from("conteudos").update({ nome }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conteudos"] }),
  });
}

export function useDeleteConteudo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conteudos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conteudos"] });
      qc.invalidateQueries({ queryKey: ["questoes"] });
    },
  });
}

// ─── Motivos de Erro ───
export function useMotivosErro() {
  return useQuery({
    queryKey: ["motivos_erro"],
    queryFn: async () => {
      const { data, error } = await supabase.from("motivos_erro").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useAddMotivoErro() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase.from("motivos_erro").insert({ nome, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["motivos_erro"] }),
  });
}

export function useUpdateMotivoErro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      const { data, error } = await supabase.from("motivos_erro").update({ nome }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["motivos_erro"] }),
  });
}

export function useDeleteMotivoErro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("motivos_erro").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["motivos_erro"] }),
  });
}

// ─── Provas ───
export function useProvas() {
  return useQuery({
    queryKey: ["provas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("provas").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useAddProva() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase.from("provas").insert({ nome, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["provas"] }),
  });
}

export function useUpdateProva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      const { data, error } = await supabase.from("provas").update({ nome }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["provas"] }),
  });
}

export function useDeleteProva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("provas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provas"] });
      qc.invalidateQueries({ queryKey: ["questoes"] });
    },
  });
}

// ─── Questões ───
export function useQuestoes() {
  return useQuery({
    queryKey: ["questoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questoes")
        .select("*, disciplinas(nome), conteudos(nome), motivos_erro(nome), provas(nome)")
        .order("data_resolucao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddQuestao() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (questao: QuestaoInsert) => {
      const { data, error } = await supabase.from("questoes").insert({ ...questao, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questoes"] }),
  });
}

export function useUpdateQuestao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("questoes").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questoes"] }),
  });
}

export function useUpdateQuestaoStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estagio_funil }: { id: string; estagio_funil: EstagioFunil }) => {
      const { data, error } = await supabase.from("questoes").update({ estagio_funil }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questoes"] }),
  });
}

/** Move question to Refação with auto-scheduled dates */
export function useMoveToRefacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const dates = calcRefacaoDates(new Date());
      const { data, error } = await supabase
        .from("questoes")
        .update({
          estagio_funil: "Refacao" as any,
          refacao_etapa: 1,
          ...dates,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questoes"] }),
  });
}

/** Advance refação etapa or move to Consolidada */
export function useAdvanceRefacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, currentEtapa }: { id: string; currentEtapa: number }) => {
      if (currentEtapa >= 3) {
        // Move to Consolidada
        const { data, error } = await supabase
          .from("questoes")
          .update({ estagio_funil: "Consolidada" as any, refacao_etapa: null })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("questoes")
        .update({ refacao_etapa: currentEtapa + 1 })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questoes"] }),
  });
}

export function useDeleteQuestao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("questoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questoes"] }),
  });
}
