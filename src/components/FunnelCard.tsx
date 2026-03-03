import { Shield, Stethoscope, HeartPulse, RotateCcw, CheckCircle2, type LucideIcon } from "lucide-react";
import { type EstagioFunil, ESTAGIO_LABELS } from "@/hooks/useKevQuest";

interface FunnelCardProps {
  stage: EstagioFunil;
  count: number;
  total: number;
  index: number;
}

const stageIcons: Record<EstagioFunil, LucideIcon> = {
  Quarentena: Shield,
  Diagnostico: Stethoscope,
  UTI: HeartPulse,
  Refacao: RotateCcw,
  Consolidada: CheckCircle2,
};

const stageColors: Record<EstagioFunil, string> = {
  Quarentena: "bg-stage-quarentena",
  Diagnostico: "bg-stage-diagnostico",
  UTI: "bg-stage-uti",
  Refacao: "bg-stage-refacao",
  Consolidada: "bg-stage-consolidada",
};

const stageTextColors: Record<EstagioFunil, string> = {
  Quarentena: "text-stage-quarentena",
  Diagnostico: "text-stage-diagnostico",
  UTI: "text-stage-uti",
  Refacao: "text-stage-refacao",
  Consolidada: "text-stage-consolidada",
};

export function FunnelCard({ stage, count, total, index }: FunnelCardProps) {
  const Icon = stageIcons[stage];
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${stageColors[stage]} bg-opacity-15`}>
          <Icon className={`h-5 w-5 ${stageTextColors[stage]}`} />
        </div>
        <span className="text-2xl font-display font-bold text-foreground">{count}</span>
      </div>
      <h3 className="font-display font-semibold text-sm text-foreground mb-1">
        {ESTAGIO_LABELS[stage]}
      </h3>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${stageColors[stage]} transition-all duration-700`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{percentage}%</span>
      </div>
    </div>
  );
}
