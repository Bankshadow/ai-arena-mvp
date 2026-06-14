"use client";

import Link from "next/link";

import { AddToStackButton } from "@/components/marketplace/add-to-stack-button";
import { ArenaScoreBadge } from "@/components/marketplace/arena-score-badge";
import { ComponentStatusBadge } from "@/components/marketplace/component-status-badge";
import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import { TournamentTestedBadge } from "@/components/marketplace/tournament-tested-badge";
import { battleScore } from "@/lib/marketplace/proof-status";
import type { MarketplaceComponent } from "@/lib/marketplace/types";

type Props = {
  component: MarketplaceComponent;
  compact?: boolean;
};

export function ComponentProofCard({ component, compact }: Props) {
  const p = component.proof;
  const score = battleScore(component);

  return (
    <article
      className={`glass-card flex h-full flex-col rounded-2xl border border-white/10 transition hover:border-violet-500/35 hover:shadow-[0_0_24px_rgba(139,92,246,0.08)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ComponentTypeBadge type={component.type} small />
        <div className="flex flex-wrap gap-1.5">
          <ComponentStatusBadge status={component.proof_status} small />
          {component.tournament_tested && <TournamentTestedBadge compact />}
        </div>
      </div>

      <Link href={`/components/${component.id}`} className="mt-3 group flex-1">
        <h3 className={`font-semibold text-zinc-100 group-hover:text-cyan-300 ${compact ? "text-sm" : "text-base"}`}>
          {component.title}
        </h3>
        <p className={`mt-1 text-zinc-500 ${compact ? "line-clamp-2 text-xs" : "line-clamp-3 text-sm"}`}>
          {component.description}
        </p>
      </Link>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] sm:grid-cols-3">
        <Metric label="Battle score" value={`${score.toFixed(0)}/100`} accent="text-emerald-300" />
        <Metric label="Win rate" value={`${(p.win_rate * 100).toFixed(0)}%`} />
        <Metric label="Avg cost" value={`$${p.avg_cost_usd.toFixed(4)}`} accent="text-cyan-300" />
        <Metric label="Avg tokens" value={p.avg_tokens.toLocaleString()} />
        <Metric label="Tested runs" value={String(p.tournament_runs)} />
        <Metric label="Evidence" value={String(component.evidence_count)} accent="text-violet-300" />
      </div>

      {!compact && (
        <>
          <p className="mt-3 text-xs text-zinc-500">
            <span className="text-zinc-600">Best for:</span> {component.best_use_case}
          </p>
          <p className="mt-1 text-xs text-amber-200/80">
            <span className="text-zinc-600">Weakness:</span> {component.known_weakness}
          </p>
          <p className="mt-2 text-[10px] text-zinc-600">
            Providers: {component.compatible_providers.join(", ")} · Source:{" "}
            {component.source_tournament_id ?? "tournament"}
          </p>
        </>
      )}

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/5 pt-4">
        <ArenaScoreBadge score={component.arena_score} size="sm" />
        <AddToStackButton component={component} />
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-zinc-600">{label}</p>
      <p className={`font-mono text-xs ${accent ?? "text-zinc-300"}`}>{value}</p>
    </div>
  );
}
