"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AgentPerformanceAnalytics } from "@/components/tournament/agent-performance-analytics";
import { ConstitutionTournamentPanel } from "@/components/tournament/constitution-tournament-panel";
import { MemoryTournamentPanel } from "@/components/tournament/memory-tournament-panel";
import { TournamentFlowTimeline } from "@/components/tournament/tournament-flow-timeline";
import { TournamentHistory } from "@/components/tournament/tournament-history";
import { EngineMap } from "@/components/workflow/engine-map";
import { useTranslations } from "@/components/i18n/locale-provider";
import type { TournamentFlowStep } from "@/lib/tournament/mission-control-demo";
import type { TournamentConstitutionMeta } from "@/lib/constitution/types";
import type { TournamentMemoryMeta } from "@/lib/memory/types";
import type {
  AgentRun,
  Evaluation,
  LeaderboardEntry,
  TournamentEvent,
} from "@/lib/tournament/types";

type Props = {
  flowSteps: TournamentFlowStep[];
  memory: TournamentMemoryMeta | undefined;
  events: TournamentEvent[];
  evaluations: Evaluation[];
  leaderboard: LeaderboardEntry[];
  constitution: TournamentConstitutionMeta | undefined;
  activeRuns: AgentRun[];
  onPromoteMarketplace: () => void;
};

export function TournamentSystemsDrawer({
  flowSteps,
  memory,
  events,
  evaluations,
  leaderboard,
  constitution,
  activeRuns,
  onPromoteMarketplace,
}: Props) {
  const os = useTranslations().tournament.os;
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {os.systems.eyebrow}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-zinc-200">{os.systems.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{os.systems.subtitle}</p>
        </div>
        <ChevronDown className={`size-5 shrink-0 text-zinc-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-6 border-t border-white/10 p-5">
          <SystemsBlock label={os.systems.timeline}>
            <TournamentFlowTimeline steps={flowSteps} compact />
          </SystemsBlock>
          <SystemsBlock label={os.systems.memory}>
            <MemoryTournamentPanel memory={memory} compact />
          </SystemsBlock>
          <SystemsBlock label={os.systems.replay}>
            <TournamentHistory events={events} compact />
          </SystemsBlock>
          <SystemsBlock label={os.systems.constitutions}>
            <ConstitutionTournamentPanel
              constitution={constitution}
              activeRuns={activeRuns}
              evaluations={evaluations}
              onPromoteMarketplace={onPromoteMarketplace}
              compact
            />
          </SystemsBlock>
          <SystemsBlock label={os.systems.analytics}>
            <AgentPerformanceAnalytics evaluations={evaluations} leaderboard={leaderboard} compact />
          </SystemsBlock>
          <EngineMap />
        </div>
      )}
    </section>
  );
}

function SystemsBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      {children}
    </div>
  );
}
