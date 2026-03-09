import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: { whatsapp_number?: string | null }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("user_id", user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useWhatsAppLogs() {
  return useQuery({
    queryKey: ["whatsapp_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useSendWhatsAppReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questaoId: string) => {
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: { questao_id: questaoId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp_logs"] }),
  });
}
