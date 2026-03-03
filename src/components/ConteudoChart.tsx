import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQuestoes, useConteudos } from "@/hooks/useKevQuest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  disciplinaId: string;
  disciplinaNome: string;
  onSelect: (conteudoId: string, nome: string) => void;
}

const BAR_COLORS = [
  "hsl(0, 72%, 55%)",
  "hsl(35, 90%, 55%)",
  "hsl(220, 70%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(145, 60%, 42%)",
  "hsl(190, 70%, 50%)",
];

export function ConteudoChart({ disciplinaId, disciplinaNome, onSelect }: Props) {
  const { data: questoes } = useQuestoes();
  const { data: conteudos } = useConteudos(disciplinaId);

  const chartData = useMemo(() => {
    if (!questoes || !conteudos) return [];
    const counts: Record<string, { nome: string; id: string; erros: number }> = {};
    for (const c of conteudos) {
      counts[c.id] = { nome: c.nome, id: c.id, erros: 0 };
    }
    for (const q of questoes) {
      if (q.disciplina_id === disciplinaId && q.estagio_funil !== "Consolidada" && counts[q.conteudo_id]) {
        counts[q.conteudo_id].erros++;
      }
    }
    return Object.values(counts)
      .filter((c) => c.erros > 0)
      .sort((a, b) => b.erros - a.erros);
  }, [questoes, conteudos, disciplinaId]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum erro encontrado para {disciplinaNome}.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Erros por Conteúdo — {disciplinaNome}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(250, chartData.length * 45)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="nome" width={140} tick={{ fontSize: 13 }} />
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
