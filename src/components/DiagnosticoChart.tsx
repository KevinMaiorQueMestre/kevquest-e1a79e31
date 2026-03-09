import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQuestoes, useMotivosErro } from "@/hooks/useKevQuest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const BAR_COLORS = [
  "hsl(0, 72%, 55%)",
  "hsl(35, 90%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(220, 70%, 55%)",
  "hsl(15, 80%, 55%)",
  "hsl(330, 60%, 55%)",
  "hsl(190, 70%, 50%)",
  "hsl(260, 50%, 60%)",
  "hsl(50, 85%, 50%)",
  "hsl(145, 60%, 42%)",
];

export function DiagnosticoChart() {
  const { data: questoes } = useQuestoes();
  const { data: motivos } = useMotivosErro();

  const chartData = useMemo(() => {
    if (!questoes || !motivos) return [];

    const counts: Record<string, { nome: string; erros: number }> = {};

    // Initialize with all motivos
    for (const m of motivos) {
      counts[m.id] = { nome: m.nome, erros: 0 };
    }

    // Count questions that have a diagnostico_motivo_id and are NOT consolidated
    for (const q of questoes) {
      if (q.diagnostico_motivo_id && q.estagio_funil !== "Consolidada" && counts[q.diagnostico_motivo_id]) {
        counts[q.diagnostico_motivo_id].erros++;
      }
    }

    // Also count questions without a motivo as "Sem diagnóstico"
    const semDiag = questoes.filter(
      (q) => !q.diagnostico_motivo_id && q.estagio_funil !== "Consolidada"
    ).length;

    const result = Object.values(counts)
      .filter((d) => d.erros > 0)
      .sort((a, b) => b.erros - a.erros);

    if (semDiag > 0) {
      result.push({ nome: "Sem diagnóstico", erros: semDiag });
    }

    return result;
  }, [questoes, motivos]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>Nenhuma questão com diagnóstico encontrada.</p>
          <p className="text-xs mt-1">Adicione motivos de erro nas questões para ver este gráfico.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-stage-uti" />
          Erros por Diagnóstico
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Identifique quais fraquezas precisam de intervenção teórica
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(250, chartData.length * 45)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="nome"
              width={140}
              tick={{ fontSize: 13 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid hsl(220,15%,88%)",
                backgroundColor: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number) => [`${value} questões`, "Erros"]}
            />
            <Bar dataKey="erros" radius={[0, 6, 6, 0]}>
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
