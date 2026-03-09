import { useState, useEffect } from "react";
import { Phone, Save, MessageSquare, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile, useWhatsAppLogs } from "@/hooks/useProfile";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 4) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 9) return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`;
}

function validateWhatsApp(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 12 && digits.length <= 13;
}

const statusConfig = {
  sent: { icon: CheckCircle2, label: "Enviado", className: "bg-stage-consolidada/15 text-stage-consolidada" },
  failed: { icon: XCircle, label: "Falhou", className: "bg-destructive/15 text-destructive" },
  pending: { icon: Clock, label: "Pendente", className: "bg-stage-diagnostico/15 text-stage-diagnostico" },
};

export default function Perfil() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: logs } = useWhatsAppLogs();
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    if (profile?.whatsapp_number) {
      setWhatsapp(formatWhatsApp(profile.whatsapp_number));
    }
  }, [profile]);

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsApp(e.target.value));
  };

  const handleSave = async () => {
    const digits = whatsapp.replace(/\D/g, "");
    if (digits && !validateWhatsApp(whatsapp)) {
      toast.error("Número inválido. Use o formato: +55 11 99999-9999");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        whatsapp_number: digits ? `+${digits}` : null,
      });
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao salvar perfil");
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Perfil</h2>
        <p className="text-sm text-muted-foreground">Gerencie suas informações e integrações</p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">E-mail</Label>
            <Input value={user?.email ?? ""} disabled className="bg-muted/50" />
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-stage-consolidada" />
            Integração WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cadastre seu número para receber lembretes de revisão de questões erradas diretamente no WhatsApp.
          </p>
          <div className="space-y-2">
            <Label>Número de WhatsApp</Label>
            <div className="flex gap-2">
              <Input
                placeholder="+55 11 99999-9999"
                value={whatsapp}
                onChange={handleWhatsAppChange}
                maxLength={19}
                className="font-mono"
              />
              <Button onClick={handleSave} disabled={updateProfile.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {updateProfile.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Formato: Código do país + DDD + Número (ex: +55 11 99999-9999)
            </p>
            {whatsapp && !validateWhatsApp(whatsapp) && (
              <p className="text-xs text-destructive">Número incompleto ou inválido</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Histórico de Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma mensagem enviada ainda.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {logs.map((log) => {
                const config = statusConfig[log.status as keyof typeof statusConfig] ?? statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{log.message_body.slice(0, 80)}...</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        {" · "}
                        {log.whatsapp_number}
                      </p>
                      {log.error_message && (
                        <p className="text-xs text-destructive mt-0.5">{log.error_message}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={`ml-3 gap-1 ${config.className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
