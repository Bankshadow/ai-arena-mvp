"use client";

import { useState } from "react";

import { ActiveBattlePanel } from "@/components/tournament/active-battle-panel";
import { AgentPreparationPanel } from "@/components/workflow/agent-preparation-panel";
import { TournamentStageShell } from "@/components/tournament/os/tournament-stage-shell";
import { useTranslations } from "@/components/i18n/locale-provider";
import type { AgentRun, Evaluation } from "@/lib/tournament/types";
import type { TournamentViewMode } from "@/lib/tournament/view-mode-labels";
import { cn } from "@/lib/utils";

type Tab = "prep" | "battles" | "outputs";

type Props = {
  runs: AgentRun[];
  evaluations: Evaluation[];
  agentModels?: Record<string, string>;
  viewMode: TournamentViewMode;
};

export function AgentsStage({ runs, evaluations, agentModels, viewMode }: Props) {
  const tabs = useTranslations().tournament.os.agents.tabs;
  const [tab, setTab] = useState<Tab>("battles");

  return (
    <TournamentStageShell phase="agents">
      <div className="flex gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
        {(["prep", "battles", "outputs"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-xs font-medium transition",
              tab === key ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {tabs[key]}
          </button>
        ))}
      </div>

      {tab === "prep" && (
        <AgentPreparationPanel runs={runs} agentModels={agentModels} embedded />
      )}
      {tab === "battles" && (
        <ActiveBattlePanel
          runs={runs}
          evaluations={evaluations}
          agentModels={agentModels}
          viewMode={viewMode}
          embedded
        />
      )}
      {tab === "outputs" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {runs.map((run) => (
            <article key={run.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
              <p className="font-medium text-zinc-200">{run.agentName}</p>
              <p className="mt-2 max-h-32 overflow-y-auto text-[11px] leading-relaxed text-zinc-500">
                {run.outputPreview || run.fullOutput.slice(0, 400)}
              </p>
            </article>
          ))}
          {runs.length === 0 && (
            <p className="col-span-full text-center text-sm text-zinc-600">No agent outputs yet.</p>
          )}
        </div>
      )}
    </TournamentStageShell>
  );
}
