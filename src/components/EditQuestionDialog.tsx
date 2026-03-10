import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useDisciplinas, useConteudos, useMotivosErro, useProvas, useUpdateQuestao,
  ESTAGIO_ORDER, ESTAGIO_LABELS, type EstagioFunil,
} from "@/hooks/useKevQuest";
import { toast } from "sonner";

interface EditQuestionDialogProps {
  questao: {
    id: string;
    disciplina_id: string;
    conteudo_id: string;
    sub_conteudo: string | null;
    identificador_prova: string | null;
    prova_id?: string | null;
    estagio_funil: EstagioFunil;
    comentario: string | null;
    data_limite: string | null;
    diagnostico_motivo_id: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  focusField?: "diagnostico" | "data_limite" | null;
}

export function EditQuestionDialog({ questao, open, onOpenChange, focusField }: EditQuestionDialogProps) {
  const [disciplinaId, setDisciplinaId] = useState("");
  const [conteudoId, setConteudoId] = useState("");
  const [subConteudo, setSubConteudo] = useState("");
  const [provaId, setProvaId] = useState("");
  const [estagio, setEstagio] = useState<string>("Quarentena");
  const [comentario, setComentario] = useState("");
  const [dataLimite, setDataLimite] = useState<Date | undefined>();
  const [motivoId, setMotivoId] = useState("");

  const { data: disciplinas } = useDisciplinas();
  const { data: conteudos } = useConteudos(disciplinaId || undefined);
  const { data: motivos } = useMotivosErro();
  const { data: provas } = useProvas();
  const updateQuestao = useUpdateQuestao();

  useEffect(() => {
    if (questao) {
      setDisciplinaId(questao.disciplina_id);
      setConteudoId(questao.conteudo_id);
      setSubConteudo(questao.sub_conteudo || "");
      setProvaId(questao.prova_id || "");
      setEstagio(questao.estagio_funil);
      setComentario(questao.comentario || "");
      setDataLimite(questao.data_limite ? new Date(questao.data_limite) : undefined);
      setMotivoId(questao.diagnostico_motivo_id || "");
    }
  }, [questao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questao) return;
    try {
      await updateQuestao.mutateAsync({
        id: questao.id,
        disciplina_id: disciplinaId,
        conteudo_id: conteudoId,
        sub_conteudo: subConteudo || null,
        prova_id: provaId && provaId !== "none" ? provaId : null,
        estagio_funil: estagio,
        comentario: comentario || null,
        data_limite: dataLimite ? dataLimite.toISOString() : null,
        diagnostico_motivo_id: motivoId && motivoId !== "none" ? motivoId : null,
      });
      toast.success("Questão atualizada!");
      onOpenChange(false);
    } catch { toast.error("Erro ao atualizar questão"); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display">Editar Questão</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Select value={disciplinaId} onValueChange={(v) => { setDisciplinaId(v); setConteudoId(""); }}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{disciplinas?.map((d) => (<SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estágio</Label>
              <Select value={estagio} onValueChange={setEstagio}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ESTAGIO_ORDER.map((s) => (<SelectItem key={s} value={s}>{ESTAGIO_LABELS[s]}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <Select value={conteudoId} onValueChange={setConteudoId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>{conteudos?.map((c) => (<SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sub-conteúdo</Label>
              <Input value={subConteudo} onChange={(e) => setSubConteudo(e.target.value)} placeholder="Ex: Resistores" />
            </div>
            <div className="space-y-2">
              <Label>Prova</Label>
              <Select value={provaId} onValueChange={setProvaId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {provas?.map((p) => (<SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className={cn("space-y-2 rounded-lg p-3 -mx-3", focusField === "diagnostico" && "bg-stage-diagnostico/10 border border-stage-diagnostico/30")}>
            <Label className={focusField === "diagnostico" ? "text-stage-diagnostico font-semibold" : ""}>Diagnóstico (motivo do erro)</Label>
            <Select value={motivoId} onValueChange={setMotivoId}>
              <SelectTrigger><SelectValue placeholder="Selecione o motivo..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {motivos?.map((m) => (<SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Limite */}
          <div className={cn("space-y-2 rounded-lg p-3 -mx-3", focusField === "data_limite" && "bg-stage-refacao/10 border border-stage-refacao/30")}>
            <Label className={focusField === "data_limite" ? "text-stage-refacao font-semibold" : ""}>Data limite para refação</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataLimite && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataLimite ? format(dataLimite, "dd/MM/yyyy") : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dataLimite} onSelect={setDataLimite} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Comentário</Label>
            <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Observações..." rows={3} />
          </div>

          <Button type="submit" className="w-full font-display" disabled={updateQuestao.isPending}>
            {updateQuestao.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
