import { useState } from "react";
import { Filter, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FunnelCard } from "@/components/FunnelCard";
import { AddQuestionDialog } from "@/components/AddQuestionDialog";
import { QuestionsTable } from "@/components/QuestionsTable";
import {
  useDisciplinas,
  useQuestoes,
  ESTAGIO_ORDER,
  ESTAGIO_LABELS,
  type EstagioFunil,
} from "@/hooks/useKevQuest";

export default function Dashboard() {
  const [filterDisciplina, setFilterDisciplina] = useState("");
  const [filterEstagio, setFilterEstagio] = useState("");
  const { data: disciplinas } = useDisciplinas();
  const { data: questoes, isLoading } = useQuestoes();

  const stageCounts = ESTAGIO_ORDER.reduce((acc, stage) => {
    acc[stage] = questoes?.filter((q) => q.estagio_funil === stage).length ?? 0;
    return acc;
  }, {} as Record<EstagioFunil, number>);

  const total = questoes?.length ?? 0;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Dashboard</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="font-display font-semibold text-foreground">{total}</span>
            <span>questões registradas</span>
            {total > 0 && (
              <>
                <span>·</span>
                <span className="text-stage-consolidada font-medium">
                  {stageCounts.Consolidada} consolidada{stageCounts.Consolidada !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>
        <AddQuestionDialog />
      </div>

      {/* Funnel Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {ESTAGIO_ORDER.map((stage, i) => (
          <FunnelCard key={stage} stage={stage} count={stageCounts[stage]} total={total} index={i} />
        ))}
      </div>

      {/* Filters + Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterDisciplina} onValueChange={setFilterDisciplina}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="Todas disciplinas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas disciplinas</SelectItem>
              {disciplinas?.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterEstagio} onValueChange={setFilterEstagio}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Todos estágios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos estágios</SelectItem>
              {ESTAGIO_ORDER.map((s) => (
                <SelectItem key={s} value={s}>{ESTAGIO_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : (
          <QuestionsTable
            questoes={(questoes as any) ?? []}
            filterDisciplina={filterDisciplina === "all" ? "" : filterDisciplina}
            filterEstagio={filterEstagio === "all" ? "" : filterEstagio}
          />
        )}
      </div>
    </div>
  );
}
