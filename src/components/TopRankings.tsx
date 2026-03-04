import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuestoes, useConteudos, useDisciplinas, ESTAGIO_LABELS, type EstagioFunil } from "@/hooks/useKevQuest";

const stageBadge: Record<EstagioFunil, string> = {
  Quarentena: "bg-stage-quarentena/15 text-stage-quarentena",
  Diagnostico: "bg-stage-diagnostico/15 text-stage-diagnostico",
  UTI: "bg-stage-uti/15 text-stage-uti",
  Refacao: "bg-stage-refacao/15 text-stage-refacao",
  Consolidada: "bg-stage-consolidada/15 text-stage-consolidada",
};

export function TopRankings() {
  const { data: questoes } = useQuestoes();
  const { data: disciplinas } = useDisciplinas();
  const [showAllConteudos, setShowAllConteudos] = useState(false);
  const [showAllSubs, setShowAllSubs] = useState(false);

  const conteudoRanking = useMemo(() => {
    if (!questoes) return [];
    const map: Record<string, { nome: string; disciplina: string; count: number }> = {};
    for (const q of questoes) {
      if (q.estagio_funil !== "Consolidada") {
        const key = q.conteudo_id;
        if (!map[key]) {
          map[key] = {
            nome: (q as any).conteudos?.nome || "—",
            disciplina: (q as any).disciplinas?.nome || "—",
            count: 0,
          };
        }
        map[key].count++;
      }
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [questoes]);

  const subRanking = useMemo(() => {
    if (!questoes) return [];
    const map: Record<string, { sub: string; disciplina: string; conteudo: string; count: number }> = {};
    for (const q of questoes) {
      if (q.estagio_funil !== "Consolidada" && q.sub_conteudo) {
        const key = `${q.conteudo_id}::${q.sub_conteudo}`;
        if (!map[key]) {
          map[key] = {
            sub: q.sub_conteudo,
            disciplina: (q as any).disciplinas?.nome || "—",
            conteudo: (q as any).conteudos?.nome || "—",
            count: 0,
          };
        }
        map[key].count++;
      }
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [questoes]);

  const visibleConteudos = showAllConteudos ? conteudoRanking : conteudoRanking.slice(0, 5);
  const visibleSubs = showAllSubs ? subRanking : subRanking.slice(0, 5);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Top Conteúdos */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Top Conteúdos com Mais Erros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {visibleConteudos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>
          )}
          {visibleConteudos.map((item, i) => (
            <div
              key={`${item.nome}-${item.disciplina}`}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-muted-foreground w-6">#{i + 1}</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{item.nome}</p>
                  <p className="text-xs text-muted-foreground">{item.disciplina}</p>
                </div>
              </div>
              <span className="font-display font-bold text-lg text-foreground">{item.count}</span>
            </div>
          ))}
          {conteudoRanking.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-1 text-muted-foreground"
              onClick={() => setShowAllConteudos(!showAllConteudos)}
            >
              {showAllConteudos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAllConteudos ? "Mostrar menos" : `Ver todos (${conteudoRanking.length})`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Top Sub-conteúdos */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Top Sub-conteúdos com Mais Erros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {visibleSubs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>
          )}
          {visibleSubs.map((item, i) => (
            <div
              key={`${item.sub}-${item.conteudo}`}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-muted-foreground w-6">#{i + 1}</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{item.sub}</p>
                  <p className="text-xs text-muted-foreground">{item.conteudo} · {item.disciplina}</p>
                </div>
              </div>
              <span className="font-display font-bold text-lg text-foreground">{item.count}</span>
            </div>
          ))}
          {subRanking.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-1 text-muted-foreground"
              onClick={() => setShowAllSubs(!showAllSubs)}
            >
              {showAllSubs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAllSubs ? "Mostrar menos" : `Ver todos (${subRanking.length})`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
