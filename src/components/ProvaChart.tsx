import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuestoes } from "@/hooks/useKevQuest";

const COLORS = [
  "hsl(220, 70%, 55%)",
  "hsl(35, 90%, 55%)",
  "hsl(0, 72%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(145, 60%, 42%)",
  "hsl(190, 70%, 50%)",
  "hsl(45, 80%, 50%)",
];

export function ProvaChart() {
  const { data: questoes } = useQuestoes();

  const chartData = useMemo(() => {
    if (!questoes) return [];
    const map: Record<string, { nome: string; count: number }> = {};
    for (const q of questoes) {
      const nome = (q as any).provas?.nome || q.identificador_prova || null;
      if (!nome) continue;
      if (!map[nome]) map[nome] = { nome, count: 0 };
      map[nome].count++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [questoes]);

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Questões por Prova</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="nome" width={120} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Questões" radius={[0, 6, 6, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
