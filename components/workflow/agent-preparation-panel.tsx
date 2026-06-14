"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { COMPETITOR_AGENTS } from "@/lib/tournament/agents";
import type { AgentRun, CompetitorAgentId } from "@/lib/tournament/types";

type Props = {
  runs: AgentRun[];
  agentModels?: Record<string, string>;
  embedded?: boolean;
};

export function AgentPreparationPanel({ runs, agentModels, embedded }: Props) {
  const a = useTranslations().workflow.agentPrep;
  const runByAgent = new Map<CompetitorAgentId, AgentRun>(runs.map((r) => [r.agentId, r]));

  return (
    <section
      className={
        embedded
          ? ""
          : "glass-card overflow-hidden rounded-2xl border border-cyan-500/15"
      }
    >
      {!embedded && (
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            5 · {a.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">{a.subtitle}</p>
        </div>
      )}
      <div className={`grid gap-2 ${embedded ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" : "p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"}`}>
        {COMPETITOR_AGENTS.map((agent) => {
          const agentId = agent.id as CompetitorAgentId;
          const run = runByAgent.get(agentId);
          const model = agentModels?.[agentId] ?? run?.modelUsed ?? "mock-groq-8b";
          return (
            <div
              key={agent.id}
              className="rounded-xl border border-white/10 bg-black/25 px-3 py-3"
            >
              <p className="text-sm font-medium text-zinc-200">{agent.name}</p>
              <dl className="mt-2 space-y-1 text-[10px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600">{a.constitution}</dt>
                  <dd className="font-mono text-violet-300">v1.2</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600">{a.model}</dt>
                  <dd className="truncate font-mono text-cyan-300">{model}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600">{a.status}</dt>
                  <dd className="text-emerald-400">{run ? a.ready : "—"}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}
