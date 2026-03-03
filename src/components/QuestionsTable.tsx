import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown, MessageSquare, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type EstagioFunil,
  ESTAGIO_ORDER,
  ESTAGIO_LABELS,
  useUpdateQuestaoStage,
  useDeleteQuestao,
} from "@/hooks/useKevQuest";
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
  disciplinas: { nome: string } | null;
  conteudos: { nome: string } | null;
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
  const deleteQuestao = useDeleteQuestao();

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
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-display">Data</TableHead>
            <TableHead className="font-display">Disciplina</TableHead>
            <TableHead className="font-display">Conteúdo</TableHead>
            <TableHead className="font-display">Prova</TableHead>
            <TableHead className="font-display">Estágio</TableHead>
            <TableHead className="font-display w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((q, i) => (
            <TableRow key={q.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              <TableCell className="text-sm">
                {format(new Date(q.data_resolucao), "dd/MM/yy", { locale: ptBR })}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
