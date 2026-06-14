"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ArenaScoreBadge } from "@/components/marketplace/arena-score-badge";
import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import { TournamentTestedBadge } from "@/components/marketplace/tournament-tested-badge";
import { enrichLegacyCandidates } from "@/lib/marketplace/candidate-detector";
import { DEMO_ROUND_ID } from "@/lib/tournament/mission-control-demo";
import type { TournamentState } from "@/lib/tournament/types";

const DEMO_LABELS = [
  "Low-Cost Executive Summary Workflow",
  "Lean Operator v1.2 Constitution",
  "Groq-first Cost Router",
];

type Props = { state: TournamentState };

export function MarketplaceSeedPanel({ state }: Props) {
  const candidates = enrichLegacyCandidates(state).slice(0, 3);

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-emerald-500/15">
      <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/5 to-transparent px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          8 · Marketplace candidates
        </h3>
        <p className="text-xs text-zinc-500">
          Tournament-detected components from {DEMO_ROUND_ID} · ready for review
        </p>
      </div>

      {candidates.length === 0 ? (
        <p className="p-8 text-center text-sm text-zinc-600">
          Run a tournament loop to detect marketplace candidates
        </p>
      ) : (
        <div className="grid gap-3 p-4 lg:grid-cols-3">
          {candidates.map((c, i) => (
            <article
              key={c.id}
              className="flex flex-col rounded-xl border border-white/10 bg-black/25 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-zinc-100">
                    {DEMO_LABELS[i] ?? c.title}
                  </p>
                  {c.agent_name && (
                    <p className="mt-0.5 text-xs text-zinc-500">{c.agent_name}</p>
                  )}
                </div>
                <TournamentTestedBadge compact />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <ComponentTypeBadge type={c.type} small />
                <StatusPill status={c.status} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-zinc-600">Source round</dt>
                  <dd className="font-mono text-violet-300">{DEMO_ROUND_ID}</dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Value score</dt>
                  <dd className="font-mono text-amber-300">{c.total_score}</dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Reusable</dt>
                  <dd className="text-emerald-300">{c.total_score >= 75 ? "Yes" : "Partial"}</dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Arena score</dt>
                  <dd>
                    <ArenaScoreBadge score={c.arena_score} showBar={false} size="sm" />
                  </dd>
                </div>
              </dl>

              <div className="mt-auto flex gap-2 pt-4">
                <Link
                  href={`/components/${c.component_id}`}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/20"
                >
                  Review candidate
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: "seed" | "review" | "listed" }) {
  const labels = { seed: "draft", review: "reviewed", listed: "listed" };
  const styles = {
    seed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    review: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    listed: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
