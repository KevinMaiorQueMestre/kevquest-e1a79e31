import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * WHATSAPP PROVIDER INTERFACE
 * ============================
 * To plug in your WhatsApp provider (Twilio, Z-API, Evolution API, Meta Official, Baileys, etc.),
 * implement the `sendWhatsAppMessage` function below.
 *
 * It receives:
 *  - phoneNumber: string (E.164 format, e.g. "+5511999999999")
 *  - messageBody: string (the review message text)
 *
 * It should return:
 *  - { success: boolean; providerResponse?: any; error?: string }
 *
 * Example for Twilio:
 *   const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
 *   const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
 *   const fromNumber = Deno.env.get("TWILIO_WHATSAPP_FROM")!;
 *   const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
 *     method: "POST",
 *     headers: { "Authorization": `Basic ${btoa(accountSid + ":" + authToken)}`, "Content-Type": "application/x-www-form-urlencoded" },
 *     body: new URLSearchParams({ To: `whatsapp:${phoneNumber}`, From: `whatsapp:${fromNumber}`, Body: messageBody }),
 *   });
 *   const data = await response.json();
 *   return { success: response.ok, providerResponse: data, error: response.ok ? undefined : data.message };
 */
async function sendWhatsAppMessage(
  phoneNumber: string,
  messageBody: string
): Promise<{ success: boolean; providerResponse?: any; error?: string }> {
  // PLACEHOLDER: Replace with your WhatsApp provider integration
  console.log(`[WhatsApp] Would send to ${phoneNumber}: ${messageBody.slice(0, 100)}...`);

  // For now, simulate a successful send for development
  // Remove this and implement your provider when ready
  return {
    success: true,
    providerResponse: { simulated: true, timestamp: new Date().toISOString() },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Parse request body
    const { questao_id } = await req.json();
    if (!questao_id) {
      return new Response(
        JSON.stringify({ error: "questao_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's WhatsApp number from profile
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("whatsapp_number")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile?.whatsapp_number) {
      console.error("[WhatsApp] No WhatsApp number found for user:", userId);
      return new Response(
        JSON.stringify({ error: "Número de WhatsApp não cadastrado. Atualize seu perfil." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch question details with relations
    const { data: questao, error: questaoError } = await serviceClient
      .from("questoes")
      .select("*, disciplinas(nome), conteudos(nome), motivos_erro(nome)")
      .eq("id", questao_id)
      .eq("user_id", userId)
      .single();

    if (questaoError || !questao) {
      console.error("[WhatsApp] Question not found:", questao_id);
      return new Response(
        JSON.stringify({ error: "Questão não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build review message
    const disciplina = (questao as any).disciplinas?.nome ?? "—";
    const conteudo = (questao as any).conteudos?.nome ?? "—";
    const motivo = (questao as any).motivos_erro?.nome ?? "Não diagnosticado";
    const subConteudo = questao.sub_conteudo ? ` > ${questao.sub_conteudo}` : "";

    const messageBody = [
      "📚 *KevQuest — Lembrete de Revisão*",
      "",
      `📖 *Disciplina:* ${disciplina}`,
      `📝 *Conteúdo:* ${conteudo}${subConteudo}`,
      `🔍 *Diagnóstico:* ${motivo}`,
      `📋 *Prova:* ${questao.identificador_prova ?? "—"}`,
      `⚡ *Estágio:* ${questao.estagio_funil}`,
      "",
      questao.comentario ? `💬 _${questao.comentario}_` : "",
      "",
      "Hora de revisar esta questão! 💪",
    ]
      .filter(Boolean)
      .join("\n");

    // Send via WhatsApp provider
    const result = await sendWhatsAppMessage(profile.whatsapp_number, messageBody);

    // Log the attempt
    const { error: logError } = await serviceClient.from("whatsapp_logs").insert({
      user_id: userId,
      questao_id: questao_id,
      whatsapp_number: profile.whatsapp_number,
      message_body: messageBody,
      status: result.success ? "sent" : "failed",
      provider_response: result.providerResponse ?? null,
      error_message: result.error ?? null,
    });

    if (logError) {
      console.error("[WhatsApp] Failed to insert log:", logError);
    }

    console.log(
      `[WhatsApp] ${result.success ? "✓ Sent" : "✗ Failed"} to ${profile.whatsapp_number} for questao ${questao_id}`
    );

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.success
          ? "Mensagem enviada com sucesso!"
          : `Falha ao enviar: ${result.error}`,
      }),
      {
        status: result.success ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[WhatsApp] Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
