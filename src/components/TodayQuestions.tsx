import { useMemo } from "react";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuestoes, useAdvanceRefacao, ESTAGIO_LABELS } from "@/hooks/useKevQuest";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function TodayQuestions() {
  const { data: questoes } = useQuestoes();
  const advanceRefacao = useAdvanceRefacao();

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todayItems = useMemo(() => {
    if (!questoes) return [];
    return questoes.filter((q) => {
      if (q.estagio_funil !== "Refacao") return false;
      const etapa = (q as any).refacao_etapa || 1;
      const dateField = etapa === 1 ? (q as any).data_refacao_1
        : etapa === 2 ? (q as any).data_refacao_2
        : (q as any).data_refacao_3;
      return dateField === today;
    });
  }, [questoes, today]);

  const handleComplete = async (q: any) => {
    try {
      await advanceRefacao.mutateAsync({ id: q.id, currentEtapa: q.refacao_etapa || 1 });
      if ((q.refacao_etapa || 1) >= 3) toast.success("Questão consolidada! 🎉");
      else toast.success(`Etapa ${(q.refacao_etapa || 1) + 1} agendada`);
    } catch { toast.error("Erro ao avançar"); }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-stage-refacao" />
            Questões de Hoje
          </CardTitle>
          <Link to="/calendario">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Ver calendário</Badge>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {todayItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma questão agendada para hoje 🎉</p>
        ) : (
          <div className="space-y-2">
            {todayItems.map((q: any) => (
              <div key={q.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{q.disciplinas?.nome}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground truncate">{q.conteudos?.nome}</span>
                  </div>
                  {q.sub_conteudo && <p className="text-xs text-muted-foreground mt-0.5">{q.sub_conteudo}</p>}
                </div>
                <Badge variant="outline" className="text-[10px] border-stage-refacao/30 text-stage-refacao shrink-0">
                  Etapa {q.refacao_etapa || 1}/3
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleComplete(q)}>
                      <ChevronRight className="h-4 w-4 text-stage-consolidada" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Marcar como feita</TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
