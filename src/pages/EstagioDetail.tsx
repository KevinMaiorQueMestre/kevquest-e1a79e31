import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionsTable } from "@/components/QuestionsTable";
import {
  useQuestoes,
  ESTAGIO_LABELS,
  ESTAGIO_ORDER,
  type EstagioFunil,
} from "@/hooks/useKevQuest";

export default function EstagioDetail() {
  const { stage } = useParams<{ stage: string }>();
  const estagio = stage as EstagioFunil;
  const { data: questoes, isLoading } = useQuestoes();

  const stageQuestoes = useMemo(() => {
    return (questoes ?? []).filter((q) => q.estagio_funil === estagio);
  }, [questoes, estagio]);

  // Priority lists: top 3 disciplinas, conteúdos, sub-conteúdos
  const priorities = useMemo(() => {
    const discMap: Record<string, { nome: string; count: number }> = {};
    const contMap: Record<string, { nome: string; disc: string; count: number }> = {};
    const subMap: Record<string, { nome: string; cont: string; count: number }> = {};

    for (const q of stageQuestoes) {
      const dNome = (q as any).disciplinas?.nome || "—";
      const cNome = (q as any).conteudos?.nome || "—";

      discMap[q.disciplina_id] = discMap[q.disciplina_id] || { nome: dNome, count: 0 };
      discMap[q.disciplina_id].count++;

      contMap[q.conteudo_id] = contMap[q.conteudo_id] || { nome: cNome, disc: dNome, count: 0 };
      contMap[q.conteudo_id].count++;

      if (q.sub_conteudo) {
        const key = `${q.conteudo_id}::${q.sub_conteudo}`;
        subMap[key] = subMap[key] || { nome: q.sub_conteudo, cont: cNome, count: 0 };
        subMap[key].count++;
      }
    }

    return {
      disciplinas: Object.values(discMap).sort((a, b) => b.count - a.count).slice(0, 3),
      conteudos: Object.values(contMap).sort((a, b) => b.count - a.count).slice(0, 3),
      subConteudos: Object.values(subMap).sort((a, b) => b.count - a.count).slice(0, 3),
    };
  }, [stageQuestoes]);

  if (!ESTAGIO_ORDER.includes(estagio)) {
    return <div className="text-center py-12 text-muted-foreground">Estágio inválido</div>;
  }

  const stageColorMap: Record<EstagioFunil, string> = {
    Quarentena: "text-stage-quarentena",
    Diagnostico: "text-stage-diagnostico",
    UTI: "text-stage-uti",
    Refacao: "text-stage-refacao",
    Consolidada: "text-stage-consolidada",
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </Link>
      </div>

      <div>
        <h2 className={`font-display font-bold text-2xl ${stageColorMap[estagio]}`}>
          {ESTAGIO_LABELS[estagio]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {stageQuestoes.length} {stageQuestoes.length !== 1 ? "questões" : "questão"} neste estágio
        </p>
      </div>

      {/* Priority lists */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-sm text-muted-foreground">Top Disciplinas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorities.disciplinas.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
            {priorities.disciplinas.map((d, i) => (
              <div key={d.nome} className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">{i + 1}. {d.nome}</span>
                <span className="font-display font-bold text-foreground">{d.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-sm text-muted-foreground">Top Conteúdos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorities.conteudos.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
            {priorities.conteudos.map((c, i) => (
              <div key={c.nome + c.disc} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-foreground">{i + 1}. {c.nome}</span>
                  <span className="text-xs text-muted-foreground ml-1">({c.disc})</span>
                </div>
                <span className="font-display font-bold text-foreground">{c.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-sm text-muted-foreground">Top Sub-conteúdos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorities.subConteudos.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
            {priorities.subConteudos.map((s, i) => (
              <div key={s.nome + s.cont} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-foreground">{i + 1}. {s.nome}</span>
                  <span className="text-xs text-muted-foreground ml-1">({s.cont})</span>
                </div>
                <span className="font-display font-bold text-foreground">{s.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <QuestionsTable questoes={stageQuestoes as any} filterDisciplina="" filterEstagio="" />
      )}
    </div>
  );
}
