"use client";

import { useState } from "react";
import { Swords, Trophy } from "lucide-react";

import type { ConstitutionBattleResult } from "@/lib/constitution/types";

type Props = {
  onRunBattle: (agentId: string, versions: string[]) => Promise<ConstitutionBattleResult | null>;
  defaultResult?: ConstitutionBattleResult | null;
};

const LEAN_VERSIONS = ["v1.0", "v1.1", "v1.2"];

export function ConstitutionBattlePanel({ onRunBattle, defaultResult }: Props) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ConstitutionBattleResult | null>(defaultResult ?? null);

  async function runBattle() {
    setBusy(true);
    try {
      const r = await onRunBattle("lean", LEAN_VERSIONS);
      if (r) setResult(r);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-cyan-500/20">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-violet-500/5 px-5 py-4">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan-400/80">
          <Swords className="size-4" /> System Prompt Battle
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">
          Constitution Battle — same challenge, different operating specs
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Lean Operator v1.0 vs v1.1 vs v1.2 on identical challenge (mock scoring).
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={runBattle}
          className="mt-4 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
        >
          {busy ? "Running battle…" : "Run System Prompt Battle"}
        </button>
      </div>

      {result && (
        <div className="p-5">
          <p className="mb-4 text-sm text-zinc-400">
            Challenge: <span className="text-zinc-200">{result.battle.challengeTitle}</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs text-zinc-500">
                <tr>
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Version</th>
                  <th className="pb-2">Constitution</th>
                  <th className="pb-2 text-right">Total</th>
                  <th className="pb-2 text-right">Tokens</th>
                  <th className="pb-2 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {result.entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`border-t border-white/5 ${
                      entry.rank === 1 ? "bg-violet-500/5" : ""
                    }`}
                  >
                    <td className="py-3 font-mono text-zinc-400">
                      {entry.rank === 1 ? (
                        <span className="flex items-center gap-1 text-amber-300">
                          <Trophy className="size-3.5" /> 1
                        </span>
                      ) : (
                        entry.rank
                      )}
                    </td>
                    <td className="py-3">
                      <span className="rounded bg-violet-500/20 px-2 py-0.5 font-mono text-violet-300">
                        {entry.version}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-zinc-500">{entry.promptStrategySummary}</td>
                    <td className="py-3 text-right font-mono text-emerald-400">{entry.totalScore}</td>
                    <td className="py-3 text-right font-mono text-zinc-400">{entry.tokensOut}</td>
                    <td className="py-3 text-right font-mono text-cyan-400">${entry.costUsd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-violet-300">
            Winning constitution: {result.winnerVersion} ·{" "}
            {result.marketplaceCandidateIds.length > 0
              ? "Eligible for marketplace seed"
              : "Below marketplace threshold"}
          </p>
        </div>
      )}
    </section>
  );
}
