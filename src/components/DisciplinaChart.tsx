import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQuestoes, useDisciplinas } from "@/hooks/useKevQuest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  onSelect: (disciplinaId: string, nome: string) => void;
}

const BAR_COLORS = [
  "hsl(0, 72%, 55%)",
  "hsl(35, 90%, 55%)",
  "hsl(220, 70%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(145, 60%, 42%)",
  "hsl(190, 70%, 50%)",
  "hsl(15, 80%, 55%)",
  "hsl(260, 50%, 60%)",
  "hsl(50, 85%, 50%)",
  "hsl(330, 60%, 55%)",
];

export function DisciplinaChart({ onSelect }: Props) {
  const { data: questoes } = useQuestoes();
  const { data: disciplinas } = useDisciplinas();

  const chartData = useMemo(() => {
    if (!questoes || !disciplinas) return [];
    const counts: Record<string, { nome: string; id: string; erros: number }> = {};
    for (const d of disciplinas) {
      counts[d.id] = { nome: d.nome, id: d.id, erros: 0 };
    }
    for (const q of questoes) {
      if (q.estagio_funil !== "Consolidada" && counts[q.disciplina_id]) {
        counts[q.disciplina_id].erros++;
      }
    }
    return Object.values(counts)
      .filter((d) => d.erros > 0)
      .sort((a, b) => b.erros - a.erros);
  }, [questoes, disciplinas]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhuma questão não-consolidada encontrada.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Questões Não Consolidadas por Disciplina</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 45)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="nome" width={120} tick={{ fontSize: 13 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,88%)" }}
              formatter={(value: number) => [`${value} questões`, "Erros"]}
            />
            <Bar
              dataKey="erros"
              radius={[0, 6, 6, 0]}
              cursor="pointer"
              onClick={(entry: any) => onSelect(entry.id, entry.nome)}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
