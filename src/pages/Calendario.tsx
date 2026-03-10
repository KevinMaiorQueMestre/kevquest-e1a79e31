import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuestoes } from "@/hooks/useKevQuest";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth, isToday, isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

type DayItem = {
  id: string;
  etapa: number;
  disciplina: string;
  conteudo: string;
  sub_conteudo?: string | null;
};

export default function Calendario() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: questoes } = useQuestoes();

  // Build a map of date → questions due
  const dateMap = useMemo(() => {
    const map: Record<string, DayItem[]> = {};
    if (!questoes) return map;
    for (const q of questoes) {
      if (q.estagio_funil !== "Refacao") continue;
      const etapa = (q as any).refacao_etapa || 1;
      const dates = [
        { d: (q as any).data_refacao_1, e: 1 },
        { d: (q as any).data_refacao_2, e: 2 },
        { d: (q as any).data_refacao_3, e: 3 },
      ];
      for (const { d, e } of dates) {
        if (!d || e < etapa) continue; // skip past etapas
        if (!map[d]) map[d] = [];
        map[d].push({
          id: q.id,
          etapa: e,
          disciplina: (q as any).disciplinas?.nome || "—",
          conteudo: (q as any).conteudos?.nome || "—",
          sub_conteudo: q.sub_conteudo,
        });
      }
    }
    return map;
  }, [questoes]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getLoadColor = (count: number) => {
    if (count === 0) return "";
    if (count <= 2) return "bg-stage-consolidada/15 border-stage-consolidada/30";
    if (count <= 5) return "bg-stage-quarentena/15 border-stage-quarentena/30";
    return "bg-stage-uti/15 border-stage-uti/30";
  };

  const getLoadLabel = (count: number) => {
    if (count <= 2) return "Leve";
    if (count <= 5) return "Moderada";
    return "Pesada";
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Calendário de Revisões</h2>
        <p className="text-sm text-muted-foreground">Visualização read-only das questões agendadas pela repetição espaçada</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-stage-consolidada/30" />
          <span className="text-muted-foreground">Leve (1-2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-stage-quarentena/30" />
          <span className="text-muted-foreground">Moderada (3-5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-stage-uti/30" />
          <span className="text-muted-foreground">Pesada (6+)</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-display font-semibold text-lg capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const items = dateMap[key] || [];
              const inMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        relative min-h-[70px] rounded-lg border p-1.5 transition-colors
                        ${inMonth ? "bg-card" : "bg-muted/30 opacity-50"}
                        ${isCurrentDay ? "ring-2 ring-primary" : "border-border"}
                        ${items.length > 0 ? getLoadColor(items.length) : ""}
                      `}
                    >
                      <div className={`text-xs font-medium mb-1 ${isCurrentDay ? "text-primary font-bold" : "text-foreground"}`}>
                        {format(day, "d")}
                      </div>
                      {items.length > 0 && (
                        <div className="space-y-0.5">
                          {items.slice(0, 3).map((item, i) => (
                            <div key={`${item.id}-${item.etapa}-${i}`} className="text-[9px] leading-tight text-muted-foreground truncate">
                              {item.disciplina}
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="text-[9px] text-muted-foreground font-medium">+{items.length - 3} mais</div>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {items.length > 0 && (
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-semibold mb-1">{format(day, "dd/MM")} — Carga {getLoadLabel(items.length)} ({items.length})</p>
                      <div className="space-y-1">
                        {items.map((item, i) => (
                          <div key={`${item.id}-${item.etapa}-${i}`} className="text-xs">
                            <span className="font-medium">{item.disciplina}</span> · {item.conteudo}
                            {item.sub_conteudo && <span className="text-muted-foreground"> · {item.sub_conteudo}</span>}
                            <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0">E{item.etapa}</Badge>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
