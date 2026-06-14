"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { translateFlowStepStatus } from "@/lib/i18n/helpers";
import type { TournamentFlowStep } from "@/lib/tournament/mission-control-demo";

type Props = { steps: TournamentFlowStep[] };

const ICON = {
  complete: CheckCircle2,
  active: Loader2,
  pending: Circle,
};

const STYLE = {
  complete: "text-emerald-400 border-emerald-500/40",
  active: "text-cyan-400 border-cyan-500/40",
  pending: "text-zinc-600 border-white/10",
};

export function CompactFlowStepper({ steps }: Props) {
  const t = useTranslations();

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((step, i) => {
        const Icon = ICON[step.status];
        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${STYLE[step.status]}`}
              title={step.note}
            >
              <Icon className={`size-3 ${step.status === "active" ? "animate-spin" : ""}`} />
              <span className="max-w-[8rem] truncate sm:max-w-none">{step.label}</span>
              <span className="hidden text-zinc-600 sm:inline">
                · {translateFlowStepStatus(step.status, t)}
              </span>
            </span>
            {i < steps.length - 1 && <span className="text-zinc-700">→</span>}
          </li>
        );
      })}
    </ol>
  );
}
