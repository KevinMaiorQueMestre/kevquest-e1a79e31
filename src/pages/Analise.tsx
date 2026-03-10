import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DisciplinaChart } from "@/components/DisciplinaChart";
import { ConteudoChart } from "@/components/ConteudoChart";
import { SubTopicoRanking } from "@/components/SubTopicoRanking";
import { TopRankings } from "@/components/TopRankings";
import { DiagnosticoChart } from "@/components/DiagnosticoChart";
import { ProvaChart } from "@/components/ProvaChart";

export type AnaliseView =
  | { type: "disciplinas" }
  | { type: "conteudos"; disciplinaId: string; disciplinaNome: string }
  | { type: "subtopicos"; conteudoId: string; conteudoNome: string; disciplinaNome: string };

export default function Analise() {
  const [view, setView] = useState<AnaliseView>({ type: "disciplinas" });

  const breadcrumb = () => {
    if (view.type === "disciplinas") return null;
    if (view.type === "conteudos") {
      return (
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setView({ type: "disciplinas" })}>
          <ArrowLeft className="h-4 w-4" /> Voltar para disciplinas
        </Button>
      );
    }
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setView({ type: "disciplinas" })}>
          <ArrowLeft className="h-4 w-4" /> Disciplinas
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground"
          onClick={() => setView({ type: "conteudos", disciplinaId: "", disciplinaNome: view.disciplinaNome })}>
          › {view.disciplinaNome}
        </Button>
      </div>
    );
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Análise de Erros</h2>
        <p className="text-sm text-muted-foreground">Clique nas barras para navegar pelos detalhes</p>
      </div>

      {view.type === "disciplinas" && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <DiagnosticoChart />
            <ProvaChart />
          </div>
          <TopRankings />
        </>
      )}

      {breadcrumb()}
      {view.type === "disciplinas" && (
        <DisciplinaChart onSelect={(id, nome) => setView({ type: "conteudos", disciplinaId: id, disciplinaNome: nome })} />
      )}
      {view.type === "conteudos" && (
        <ConteudoChart disciplinaId={view.disciplinaId} disciplinaNome={view.disciplinaNome}
          onSelect={(id, nome) => setView({ type: "subtopicos", conteudoId: id, conteudoNome: nome, disciplinaNome: view.disciplinaNome })} />
      )}
      {view.type === "subtopicos" && (
        <SubTopicoRanking conteudoId={view.conteudoId} conteudoNome={view.conteudoNome} />
      )}
    </div>
  );
}
