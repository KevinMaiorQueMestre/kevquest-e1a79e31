import { useMemo } from "react";
import { useQuestoes } from "@/hooks/useKevQuest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ESTAGIO_LABELS, type EstagioFunil } from "@/hooks/useKevQuest";

interface Props {
  conteudoId: string;
  conteudoNome: string;
}

const stageBadge: Record<EstagioFunil, string> = {
  Quarentena: "bg-stage-quarentena/15 text-stage-quarentena",
  Diagnostico: "bg-stage-diagnostico/15 text-stage-diagnostico",
  UTI: "bg-stage-uti/15 text-stage-uti",
  Refacao: "bg-stage-refacao/15 text-stage-refacao",
  Consolidada: "bg-stage-consolidada/15 text-stage-consolidada",
};

export function SubTopicoRanking({ conteudoId, conteudoNome }: Props) {
  const { data: questoes } = useQuestoes();

  const ranking = useMemo(() => {
    if (!questoes) return [];
    const map: Record<string, { sub: string; count: number; stages: Record<string, number> }> = {};
    for (const q of questoes) {
      if (q.conteudo_id === conteudoId && q.estagio_funil !== "Consolidada") {
        const key = q.sub_conteudo || "(sem sub-tópico)";
        if (!map[key]) map[key] = { sub: key, count: 0, stages: {} };
        map[key].count++;
        map[key].stages[q.estagio_funil] = (map[key].stages[q.estagio_funil] || 0) + 1;
      }
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [questoes, conteudoId]);

  if (ranking.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum sub-tópico com erros para {conteudoNome}.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Ranking de Sub-tópicos — {conteudoNome}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ranking.map((item, i) => (
          <div
            key={item.sub}
            className="flex items-center justify-between rounded-lg border border-border p-4 animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-lg text-muted-foreground w-8">
                #{i + 1}
              </span>
              <div>
                <p className="font-medium text-foreground">{item.sub}</p>
                <div className="flex gap-1.5 mt-1">
                  {Object.entries(item.stages).map(([stage, count]) => (
                    <span
                      key={stage}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${stageBadge[stage as EstagioFunil]}`}
                    >
                      {ESTAGIO_LABELS[stage as EstagioFunil]}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <span className="font-display font-bold text-2xl text-foreground">{item.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
