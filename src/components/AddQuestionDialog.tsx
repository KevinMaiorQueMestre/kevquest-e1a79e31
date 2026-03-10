import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useDisciplinas, useConteudos, useAddQuestao, useAddConteudo,
  useProvas, ESTAGIO_ORDER, ESTAGIO_LABELS,
} from "@/hooks/useKevQuest";
import { toast } from "sonner";

export function AddQuestionDialog() {
  const [open, setOpen] = useState(false);
  const [disciplinaId, setDisciplinaId] = useState("");
  const [conteudoId, setConteudoId] = useState("");
  const [subConteudo, setSubConteudo] = useState("");
  const [provaId, setProvaId] = useState("");
  const [estagio, setEstagio] = useState<string>("Quarentena");
  const [comentario, setComentario] = useState("");
  const [newConteudo, setNewConteudo] = useState("");

  const { data: disciplinas } = useDisciplinas();
  const { data: conteudos } = useConteudos(disciplinaId || undefined);
  const { data: provas } = useProvas();
  const addQuestao = useAddQuestao();
  const addConteudo = useAddConteudo();

  const handleAddConteudo = async () => {
    if (!newConteudo.trim() || !disciplinaId) return;
    try {
      const result = await addConteudo.mutateAsync({ nome: newConteudo.trim(), disciplina_id: disciplinaId });
      setConteudoId(result.id);
      setNewConteudo("");
      toast.success("Conteúdo adicionado!");
    } catch { toast.error("Erro ao adicionar conteúdo"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplinaId || !conteudoId) { toast.error("Selecione disciplina e conteúdo"); return; }
    try {
      await addQuestao.mutateAsync({
        disciplina_id: disciplinaId,
        conteudo_id: conteudoId,
        sub_conteudo: subConteudo || null,
        prova_id: provaId && provaId !== "none" ? provaId : null,
        estagio_funil: estagio as any,
        comentario: comentario || null,
      });
      toast.success("Questão registrada!");
      setOpen(false);
      resetForm();
    } catch { toast.error("Erro ao registrar questão"); }
  };

  const resetForm = () => {
    setDisciplinaId(""); setConteudoId(""); setSubConteudo("");
    setProvaId(""); setEstagio("Quarentena"); setComentario("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-display"><Plus className="h-4 w-4" />Nova Questão</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display">Registrar Questão</DialogTitle></DialogHeader>
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
            {disciplinaId ? (
              <div className="flex gap-2">
                <Select value={conteudoId} onValueChange={setConteudoId}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{conteudos?.map((c) => (<SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>))}</SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Input placeholder="Novo..." value={newConteudo} onChange={(e) => setNewConteudo(e.target.value)} className="w-28" />
                  <Button type="button" variant="outline" size="icon" onClick={handleAddConteudo} disabled={!newConteudo.trim()}><Plus className="h-3 w-3" /></Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Selecione uma disciplina primeiro</p>
            )}
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

          <div className="space-y-2">
            <Label>Comentário</Label>
            <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Observações..." rows={3} />
          </div>

          <Button type="submit" className="w-full font-display" disabled={addQuestao.isPending}>
            {addQuestao.isPending ? "Salvando..." : "Registrar Questão"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
