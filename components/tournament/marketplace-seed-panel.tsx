"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ArenaScoreBadge } from "@/components/marketplace/arena-score-badge";
import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import { TournamentTestedBadge } from "@/components/marketplace/tournament-tested-badge";
import { enrichLegacyCandidates } from "@/lib/marketplace/candidate-detector";
import {
  CANDIDATE_STATUS_LABELS,
  type CandidateStatus,
} from "@/lib/marketplace/types";
import type { TournamentState } from "@/lib/tournament/types";

type Props = { state: TournamentState };

export function MarketplaceSeedPanel({ state }: Props) {
  const candidates = enrichLegacyCandidates(state).slice(0, 6);

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-emerald-500/15">
      <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/5 to-transparent px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Marketplace proof pipeline
        </h3>
        <p className="text-xs text-zinc-500">
          Tournament → Proof → Component → Stack → Export · round {state.tournament.round || "—"}
        </p>
      </div>

      {candidates.length === 0 ? (
        <p className="p-8 text-center text-sm text-zinc-600">
          Run a tournament loop to detect marketplace candidates
        </p>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map((c) => (
            <article
              key={c.id}
              className="flex flex-col rounded-xl border border-white/10 bg-black/25 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-zinc-100">{c.title}</p>
                  {c.agent_name && (
                    <p className="mt-0.5 text-xs text-zinc-500">{c.agent_name}</p>
                  )}
                </div>
                <TournamentTestedBadge compact />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <ComponentTypeBadge type={c.type} small />
                <StatusPill status={c.candidate_status ?? legacyStatus(c.status)} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-zinc-600">Source round</dt>
                  <dd className="font-mono text-violet-300">R{c.round}</dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Battle score</dt>
                  <dd className="font-mono text-amber-300">{c.total_score.toFixed(0)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Tested runs</dt>
                  <dd className="font-mono text-zinc-300">{c.tested_runs ?? 1}</dd>
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
                  Review proof
                  <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/admin"
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Admin
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function legacyStatus(status: "seed" | "review" | "listed"): CandidateStatus {
  if (status === "listed") return "published";
  if (status === "review") return "review_needed";
  return "detected";
}

function StatusPill({ status }: { status: CandidateStatus }) {
  const styles: Record<CandidateStatus, string> = {
    detected: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    draft: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
    review_needed: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    published: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    archived: "border-red-500/40 bg-red-500/10 text-red-300",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${styles[status]}`}>
      {CANDIDATE_STATUS_LABELS[status]}
    </span>
  );
}
