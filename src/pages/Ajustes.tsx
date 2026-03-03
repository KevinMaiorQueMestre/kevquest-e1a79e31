import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDisciplinas,
  useConteudos,
  useAddDisciplina,
  useAddConteudo,
} from "@/hooks/useKevQuest";
import { toast } from "sonner";

export default function Ajustes() {
  const [novaDisciplina, setNovaDisciplina] = useState("");
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState("");
  const [novoConteudo, setNovoConteudo] = useState("");

  const { data: disciplinas } = useDisciplinas();
  const { data: conteudos } = useConteudos(selectedDisciplinaId || undefined);
  const addDisciplina = useAddDisciplina();
  const addConteudo = useAddConteudo();

  const handleAddDisciplina = async () => {
    if (!novaDisciplina.trim()) return;
    try {
      await addDisciplina.mutateAsync(novaDisciplina.trim());
      setNovaDisciplina("");
      toast.success("Disciplina adicionada!");
    } catch {
      toast.error("Erro ao adicionar disciplina");
    }
  };

  const handleAddConteudo = async () => {
    if (!novoConteudo.trim() || !selectedDisciplinaId) return;
    try {
      await addConteudo.mutateAsync({
        nome: novoConteudo.trim(),
        disciplina_id: selectedDisciplinaId,
      });
      setNovoConteudo("");
      toast.success("Conteúdo adicionado!");
    } catch {
      toast.error("Erro ao adicionar conteúdo");
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Ajustes</h2>
        <p className="text-sm text-muted-foreground">Gerencie disciplinas e conteúdos</p>
      </div>

      {/* Disciplinas */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Disciplinas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nova disciplina..."
              value={novaDisciplina}
              onChange={(e) => setNovaDisciplina(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDisciplina()}
            />
            <Button onClick={handleAddDisciplina} disabled={!novaDisciplina.trim() || addDisciplina.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {disciplinas?.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="font-medium text-foreground">{d.nome}</span>
              </div>
            ))}
            {(!disciplinas || disciplinas.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma disciplina cadastrada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdos */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Conteúdos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedDisciplinaId} onValueChange={setSelectedDisciplinaId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma disciplina..." />
            </SelectTrigger>
            <SelectContent>
              {disciplinas?.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedDisciplinaId && (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Novo conteúdo..."
                  value={novoConteudo}
                  onChange={(e) => setNovoConteudo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddConteudo()}
                />
                <Button onClick={handleAddConteudo} disabled={!novoConteudo.trim() || addConteudo.isPending}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {conteudos?.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <span className="text-foreground">{c.nome}</span>
                  </div>
                ))}
                {(!conteudos || conteudos.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum conteúdo nesta disciplina</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
