import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight, Edit2, MessageSquare, Trash2, Calendar } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  type EstagioFunil,
  ESTAGIO_ORDER,
  ESTAGIO_LABELS,
  getNextStage,
  useUpdateQuestaoStage,
  useUpdateQuestao,
  useDeleteQuestao,
} from "@/hooks/useKevQuest";
import { EditQuestionDialog } from "@/components/EditQuestionDialog";
import { toast } from "sonner";

type QuestaoWithRelations = {
  id: string;
  data_resolucao: string;
  identificador_prova: string | null;
  estagio_funil: EstagioFunil;
  disciplina_id: string;
  conteudo_id: string;
  sub_conteudo: string | null;
  comentario: string | null;
  created_at: string;
  data_limite: string | null;
  diagnostico_motivo_id: string | null;
  disciplinas: { nome: string } | null;
  conteudos: { nome: string } | null;
  motivos_erro: { nome: string } | null;
};

const stageBadgeColors: Record<EstagioFunil, string> = {
  Quarentena: "bg-stage-quarentena/15 text-stage-quarentena",
  Diagnostico: "bg-stage-diagnostico/15 text-stage-diagnostico",
  UTI: "bg-stage-uti/15 text-stage-uti",
  Refacao: "bg-stage-refacao/15 text-stage-refacao",
  Consolidada: "bg-stage-consolidada/15 text-stage-consolidada",
};

interface QuestionsTableProps {
  questoes: QuestaoWithRelations[];
  filterDisciplina: string;
  filterEstagio: string;
}

export function QuestionsTable({ questoes, filterDisciplina, filterEstagio }: QuestionsTableProps) {
  const updateStage = useUpdateQuestaoStage();
  const updateQuestao = useUpdateQuestao();
  const deleteQuestao = useDeleteQuestao();
  const [editQuestao, setEditQuestao] = useState<QuestaoWithRelations | null>(null);
  const [editFocus, setEditFocus] = useState<"diagnostico" | "data_limite" | null>(null);

  const filtered = questoes.filter((q) => {
    if (filterDisciplina && q.disciplina_id !== filterDisciplina) return false;
    if (filterEstagio && q.estagio_funil !== filterEstagio) return false;
    return true;
  });

  const handleStageChange = async (id: string, newStage: EstagioFunil) => {
    try {
      await updateStage.mutateAsync({ id, estagio_funil: newStage });
      toast.success(`Movido para ${ESTAGIO_LABELS[newStage]}`);
    } catch {
      toast.error("Erro ao atualizar estágio");
    }
  };

  const handleAdvanceStage = (q: QuestaoWithRelations) => {
    const next = getNextStage(q.estagio_funil);
    if (!next) return;

    // Quarentena → Diagnostico: open edit with diagnostico focus
    if (q.estagio_funil === "Quarentena" && next === "Diagnostico") {
      // Advance first, then open edit
      updateStage.mutateAsync({ id: q.id, estagio_funil: next }).then(() => {
        setEditFocus("diagnostico");
        setEditQuestao({ ...q, estagio_funil: next });
        toast.success(`Movido para ${ESTAGIO_LABELS[next]}`);
      });
      return;
    }

    // UTI → Refacao: open edit with data_limite focus
    if (q.estagio_funil === "UTI" && next === "Refacao") {
      updateStage.mutateAsync({ id: q.id, estagio_funil: next }).then(() => {
        setEditFocus("data_limite");
        setEditQuestao({ ...q, estagio_funil: next });
        toast.success(`Movido para ${ESTAGIO_LABELS[next]}`);
      });
      return;
    }

    // Default: just advance
    handleStageChange(q.id, next);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestao.mutateAsync(id);
      toast.success("Questão removida");
    } catch {
      toast.error("Erro ao remover questão");
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="font-display text-lg">Nenhuma questão encontrada</p>
        <p className="text-sm mt-1">Adicione sua primeira questão para começar!</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-display">Data</TableHead>
              <TableHead className="font-display">Disciplina</TableHead>
              <TableHead className="font-display">Conteúdo</TableHead>
              <TableHead className="font-display">Prova</TableHead>
              <TableHead className="font-display">Estágio</TableHead>
              <TableHead className="font-display w-[140px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((q, i) => {
              const nextStage = getNextStage(q.estagio_funil);
              return (
                <TableRow key={q.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <TableCell className="text-sm">
                    <div>
                      {format(new Date(q.data_resolucao), "dd/MM/yy", { locale: ptBR })}
                      {q.data_limite && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(q.data_limite), "dd/MM/yy")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{q.disciplinas?.nome}</TableCell>
                  <TableCell>
                    <div>
                      <span>{q.conteudos?.nome}</span>
                      {q.sub_conteudo && (
                        <span className="text-xs text-muted-foreground ml-1">· {q.sub_conteudo}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {q.identificador_prova || "—"}
                  </TableCell>
                  <TableCell>
                    <Select value={q.estagio_funil} onValueChange={(v) => handleStageChange(q.id, v as EstagioFunil)}>
                      <SelectTrigger className={`h-7 w-fit text-xs font-semibold border-0 ${stageBadgeColors[q.estagio_funil]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTAGIO_ORDER.map((s) => (
                          <SelectItem key={s} value={s}>{ESTAGIO_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {nextStage && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleAdvanceStage(q)}
                            >
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Avançar para {ESTAGIO_LABELS[nextStage]}</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => { setEditFocus(null); setEditQuestao(q); }}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      {q.comentario && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">{q.comentario}</TooltipContent>
                        </Tooltip>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <EditQuestionDialog
        questao={editQuestao}
        open={!!editQuestao}
        onOpenChange={(open) => { if (!open) setEditQuestao(null); }}
        focusField={editFocus}
      />
    </>
  );
}
