import { CheckCircle2, Circle, Loader2 } from "lucide-react";

import type { TournamentFlowStep } from "@/lib/tournament/mission-control-demo";

type Props = { steps: TournamentFlowStep[] };

const STATUS_ICON = {
  complete: CheckCircle2,
  active: Loader2,
  pending: Circle,
};

const STATUS_STYLE = {
  complete: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  active: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10 animate-pulse",
  pending: "text-zinc-600 border-white/10 bg-black/20",
};

export function TournamentFlowTimeline({ steps }: Props) {
  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-violet-500/15">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-transparent px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Tournament flow timeline
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          End-to-end autonomous loop from challenge generation to marketplace seeding
        </p>
      </div>

      <ol className="divide-y divide-white/5">
        {steps.map((step, index) => {
          const Icon = STATUS_ICON[step.status];
          return (
            <li key={step.id} className="flex gap-4 px-5 py-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-8 items-center justify-center rounded-full border ${STATUS_STYLE[step.status]}`}
                >
                  <Icon className={`size-4 ${step.status === "active" ? "animate-spin" : ""}`} />
                </span>
                {index < steps.length - 1 && (
                  <span className="mt-1 h-full min-h-4 w-px bg-white/10" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-zinc-100">{step.label}</p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${STATUS_STYLE[step.status]}`}
                  >
                    {step.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-violet-300/80">{step.actor}</p>
                <p className="mt-1 text-sm text-zinc-400">{step.note}</p>
                {step.timestamp && (
                  <p className="mt-1 font-mono text-[10px] text-zinc-600">
                    {new Date(step.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
