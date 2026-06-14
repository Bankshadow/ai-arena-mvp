"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, GitCompare, ShoppingBag, Trophy } from "lucide-react";

import { PromptDiffViewer } from "@/components/constitution/prompt-diff-viewer";
import {
  compareConstitutions,
  getVersionActualImpacts,
} from "@/lib/constitution/diff";
import { getConstitutionRecordByAgentId } from "@/lib/constitution/mock-data";
import type { TournamentConstitutionMeta } from "@/lib/constitution/types";
import type { AgentRun, Evaluation } from "@/lib/tournament/types";

type Props = {
  constitution: TournamentConstitutionMeta | undefined;
  activeRuns: AgentRun[];
  evaluations: Evaluation[];
  onPromoteMarketplace?: () => void;
};

export function ConstitutionTournamentPanel({
  constitution,
  activeRuns,
  evaluations,
  onPromoteMarketplace,
}: Props) {
  const [showDiff, setShowDiff] = useState(false);

  if (!constitution) {
    return (
      <section className="glass-card rounded-2xl p-5 text-sm text-zinc-600">
        Run a tournament loop to attach agent constitution versions.
      </section>
    );
  }

  const winnerRun = [...evaluations].sort((a, b) => b.totalScore - a.totalScore)[0];
  const leanRecord = getConstitutionRecordByAgentId("lean");
  const diff =
    leanRecord && showDiff
      ? compareConstitutions(
          leanRecord.versions.find((v) => v.version === "v1.1")!,
          leanRecord.versions.find((v) => v.version === "v1.2")!,
          getVersionActualImpacts("v1.1", "v1.2"),
        )
      : null;

  const tournamentTypeLabel =
    constitution.tournamentType === "system_prompt_battle"
      ? "System Prompt Battle"
      : "Standard tournament";

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-violet-500/25">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-transparent to-emerald-500/5 px-5 py-4">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-violet-400/80">
          <BookOpen className="size-4" /> Agent constitutions
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{tournamentTypeLabel}</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Each run stores which operating spec version was active.
        </p>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500">Active agent specs</p>
          <ul className="mt-3 space-y-2">
            {constitution.usages.slice(0, 5).map((u) => (
              <li
                key={u.versionId}
                className="rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-zinc-200">{u.agentName}</span>
                  <span className="rounded bg-violet-500/20 px-2 py-0.5 font-mono text-[10px] text-violet-300">
                    {u.version}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{u.promptStrategySummary}</p>
                <p className="mt-1 font-mono text-xs text-emerald-400">
                  Constitution score {u.constitutionScore}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          {constitution.winningVersion && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="flex items-center gap-2 text-xs uppercase text-amber-300">
                <Trophy className="size-4" /> Winning constitution
              </p>
              <p className="mt-2 font-mono text-lg text-white">{constitution.winningVersion}</p>
              {winnerRun && (
                <p className="text-xs text-zinc-500">
                  {winnerRun.agentName} · tournament score {winnerRun.totalScore}
                </p>
              )}
            </div>
          )}

          {activeRuns[0]?.promptStrategySummary && (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <p className="text-xs uppercase text-cyan-400">Prompt strategy (latest run)</p>
              <p className="mt-2 text-sm text-zinc-300">{activeRuns[0].promptStrategySummary}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowDiff((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
            >
              <GitCompare className="size-3.5" />
              {showDiff ? "Hide" : "Show"} version diff
            </button>
            <Link
              href="/agents/constitution-builder"
              className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 px-3 py-2 text-xs text-violet-200 hover:bg-violet-500/10"
            >
              Edit constitutions
            </Link>
            {constitution.marketplaceCandidateIds.length > 0 && (
              <button
                type="button"
                onClick={onPromoteMarketplace}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200"
              >
                <ShoppingBag className="size-3.5" />
                Marketplace candidate
              </button>
            )}
          </div>
        </div>
      </div>

      {showDiff && diff && (
        <div className="border-t border-white/10 p-5">
          <PromptDiffViewer diff={diff} />
        </div>
      )}
    </section>
  );
}
