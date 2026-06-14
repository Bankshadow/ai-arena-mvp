"use client";

import Link from "next/link";

import { AddToStackButton } from "@/components/marketplace/add-to-stack-button";
import { ArenaScoreBadge } from "@/components/marketplace/arena-score-badge";
import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import { TournamentTestedBadge } from "@/components/marketplace/tournament-tested-badge";
import type { MarketplaceComponent } from "@/lib/marketplace/types";

type Props = {
  component: MarketplaceComponent;
  compact?: boolean;
};

export function ComponentCard({ component, compact }: Props) {
  return (
    <article
      className={`glass-card flex flex-col rounded-2xl border border-white/10 transition hover:border-violet-500/30 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ComponentTypeBadge type={component.type} small />
        {component.tournament_tested && <TournamentTestedBadge compact />}
      </div>

      <Link href={`/components/${component.id}`} className="mt-3 group">
        <h3 className="font-semibold text-zinc-100 group-hover:text-cyan-300">{component.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{component.description}</p>
      </Link>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>Win {(component.proof.win_rate * 100).toFixed(0)}%</span>
        <span>${component.proof.avg_cost_usd.toFixed(4)}/run</span>
        <span>{component.proof.tournament_runs} runs</span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/5 pt-4">
        <ArenaScoreBadge score={component.arena_score} size="sm" />
        <AddToStackButton component={component} />
      </div>
    </article>
  );
}
