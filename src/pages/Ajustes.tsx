import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useDisciplinas, useConteudos, useAddDisciplina, useAddConteudo,
  useMotivosErro, useAddMotivoErro, useDeleteMotivoErro,
  useUpdateDisciplina, useDeleteDisciplina,
  useUpdateConteudo, useDeleteConteudo,
  useUpdateMotivoErro,
} from "@/hooks/useKevQuest";
import { toast } from "sonner";

function EditableItem({
  id, nome, onUpdate, onDelete, deletable = true,
}: {
  id: string; nome: string;
  onUpdate: (id: string, nome: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  deletable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(nome);

  const handleSave = async () => {
    if (!value.trim() || value.trim() === nome) { setEditing(false); setValue(nome); return; }
    try {
      await onUpdate(id, value.trim());
      setEditing(false);
      toast.success("Atualizado!");
    } catch { toast.error("Erro ao atualizar"); setValue(nome); setEditing(false); }
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-4 py-3">
      {editing ? (
        <>
          <Input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditing(false); setValue(nome); } }} className="h-8" autoFocus />
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={handleSave}><Check className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(false); setValue(nome); }}><X className="h-3.5 w-3.5" /></Button>
          </div>
        </>
      ) : (
        <>
          <span className="font-medium text-foreground">{nome}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /></Button>
            {deletable && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>Isso removerá "{nome}" e todos os dados associados. Essa ação não pode ser desfeita.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => { try { await onDelete(id); toast.success("Removido!"); } catch { toast.error("Erro ao remover"); } }}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function Ajustes() {
  const [novaDisciplina, setNovaDisciplina] = useState("");
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState("");
  const [novoConteudo, setNovoConteudo] = useState("");
  const [novoMotivo, setNovoMotivo] = useState("");

  const { data: disciplinas } = useDisciplinas();
  const { data: conteudos } = useConteudos(selectedDisciplinaId || undefined);
  const { data: motivos } = useMotivosErro();
  const addDisciplina = useAddDisciplina();
  const addConteudo = useAddConteudo();
  const addMotivo = useAddMotivoErro();
  const deleteMotivo = useDeleteMotivoErro();
  const updateDisciplina = useUpdateDisciplina();
  const deleteDisciplina = useDeleteDisciplina();
  const updateConteudo = useUpdateConteudo();
  const deleteConteudo = useDeleteConteudo();
  const updateMotivo = useUpdateMotivoErro();

  const handleAddDisciplina = async () => {
    if (!novaDisciplina.trim()) return;
    try {
      await addDisciplina.mutateAsync(novaDisciplina.trim());
      setNovaDisciplina("");
      toast.success("Disciplina adicionada!");
    } catch { toast.error("Erro ao adicionar disciplina"); }
  };

  const handleAddConteudo = async () => {
    if (!novoConteudo.trim() || !selectedDisciplinaId) return;
    try {
      await addConteudo.mutateAsync({ nome: novoConteudo.trim(), disciplina_id: selectedDisciplinaId });
      setNovoConteudo("");
      toast.success("Conteúdo adicionado!");
    } catch { toast.error("Erro ao adicionar conteúdo"); }
  };

  const handleAddMotivo = async () => {
    if (!novoMotivo.trim()) return;
    try {
      await addMotivo.mutateAsync(novoMotivo.trim());
      setNovoMotivo("");
      toast.success("Motivo adicionado!");
    } catch { toast.error("Erro ao adicionar motivo"); }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Ajustes</h2>
        <p className="text-sm text-muted-foreground">Gerencie disciplinas, conteúdos e motivos de erro</p>
      </div>

      {/* Disciplinas */}
      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Disciplinas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Nova disciplina..." value={novaDisciplina} onChange={(e) => setNovaDisciplina(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddDisciplina()} />
            <Button onClick={handleAddDisciplina} disabled={!novaDisciplina.trim() || addDisciplina.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {disciplinas?.map((d) => (
              <EditableItem
                key={d.id} id={d.id} nome={d.nome}
                onUpdate={async (id, nome) => { await updateDisciplina.mutateAsync({ id, nome }); }}
                onDelete={async (id) => { await deleteDisciplina.mutateAsync(id); }}
              />
            ))}
            {(!disciplinas || disciplinas.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma disciplina cadastrada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdos */}
      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Conteúdos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedDisciplinaId} onValueChange={setSelectedDisciplinaId}>
            <SelectTrigger><SelectValue placeholder="Selecione uma disciplina..." /></SelectTrigger>
            <SelectContent>
              {disciplinas?.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDisciplinaId && (
            <>
              <div className="flex gap-2">
                <Input placeholder="Novo conteúdo..." value={novoConteudo} onChange={(e) => setNovoConteudo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddConteudo()} />
                <Button onClick={handleAddConteudo} disabled={!novoConteudo.trim() || addConteudo.isPending}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {conteudos?.map((c) => (
                  <EditableItem
                    key={c.id} id={c.id} nome={c.nome}
                    onUpdate={async (id, nome) => { await updateConteudo.mutateAsync({ id, nome }); }}
                    onDelete={async (id) => { await deleteConteudo.mutateAsync(id); }}
                  />
                ))}
                {(!conteudos || conteudos.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum conteúdo nesta disciplina</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Motivos de Erro */}
      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Motivos de Erro (Diagnóstico)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Opções que aparecem ao diagnosticar o motivo do erro de uma questão.</p>
          <div className="flex gap-2">
            <Input placeholder="Novo motivo..." value={novoMotivo} onChange={(e) => setNovoMotivo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddMotivo()} />
            <Button onClick={handleAddMotivo} disabled={!novoMotivo.trim() || addMotivo.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {motivos?.map((m) => (
              <EditableItem
                key={m.id} id={m.id} nome={m.nome}
                onUpdate={async (id, nome) => { await updateMotivo.mutateAsync({ id, nome }); }}
                onDelete={async (id) => { await deleteMotivo.mutateAsync(id); }}
              />
            ))}
            {(!motivos || motivos.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum motivo cadastrado</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
