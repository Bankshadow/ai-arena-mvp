"use client";

import Link from "next/link";

import { ArenaScoreBadge } from "@/components/marketplace/arena-score-badge";
import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import { TournamentTestedBadge } from "@/components/marketplace/tournament-tested-badge";
import { enrichLegacyCandidates } from "@/lib/marketplace/candidate-detector";
import type { TournamentState } from "@/lib/tournament/types";

type Props = { state: TournamentState };

export function MarketplaceSeedPanel({ state }: Props) {
  const candidates = enrichLegacyCandidates(state);

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-emerald-500/15">
      <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/5 to-transparent px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          8 · Marketplace candidates
        </h3>
        <p className="text-xs text-zinc-500">
          Tournament-detected components ready for marketplace review
        </p>
      </div>

      {candidates.length === 0 ? (
        <p className="p-8 text-center text-sm text-zinc-600">
          Run a tournament loop to detect marketplace candidates
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-white/5 text-left text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-2.5">Component</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5 text-right">Arena</th>
                <th className="px-4 py-2.5 text-right">Score</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-200">{c.title}</p>
                    {c.agent_name && (
                      <p className="text-xs text-zinc-500">{c.agent_name}</p>
                    )}
                    {c.proof.tournament_runs >= 5 && (
                      <div className="mt-1">
                        <TournamentTestedBadge compact />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ComponentTypeBadge type={c.type} small />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ArenaScoreBadge score={c.arena_score} showBar={false} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-300">
                    {c.total_score}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/components/${c.component_id}`}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: "seed" | "review" | "listed" }) {
  const styles = {
    seed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    review: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    listed: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
