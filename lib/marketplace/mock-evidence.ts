import type { JudgeNote, MarketplaceComponent, TournamentEvidence } from "@/lib/marketplace/types";

const TOURNAMENT_IDS = ["tournament-T-R12", "tournament-mock-5", "tournament-default"];

function evidenceId(componentId: string, round: number): string {
  return `ev-${componentId}-r${round}`;
}

/** Mock tournament evidence rows for component detail pages. */
export function buildMockEvidence(component: MarketplaceComponent): TournamentEvidence[] {
  const p = component.proof;
  const rounds = p.benchmark_history.length > 0 ? p.benchmark_history : [{ round: 3, score: p.avg_score, cost: p.avg_cost_usd }];
  const challenge =
    component.categories.includes("executive-summary")
      ? "Executive Summary Battle"
      : component.title;

  return rounds.map((b, i) => ({
    id: evidenceId(component.id, b.round),
    tournament_id: component.source_tournament_id ?? TOURNAMENT_IDS[i % TOURNAMENT_IDS.length]!,
    round: b.round,
    challenge_title: challenge,
    agent_name: component.tags.includes("lean") ? "Lean Agent" : "Tournament field",
    score: b.score,
    cost_usd: b.cost,
    tokens: Math.round(p.avg_tokens * (0.92 + i * 0.04)),
    latency_ms: Math.round(p.avg_latency_ms * (0.9 + i * 0.05)),
    passed: b.score >= 70,
    recorded_at: p.last_tournament_at,
  }));
}

export function buildMockJudgeNotes(component: MarketplaceComponent): JudgeNote[] {
  const p = component.proof;
  return [
    {
      id: `jn-${component.id}-quality`,
      dimension: "Quality",
      note: `Strong ${p.best_category}; avg ${p.avg_score.toFixed(0)}/100 across ${p.tournament_runs} runs.`,
      score_delta: 2,
    },
    {
      id: `jn-${component.id}-cost`,
      dimension: "Cost efficiency",
      note: `Average $${p.avg_cost_usd.toFixed(4)}/run at ${p.avg_tokens.toLocaleString()} tokens.`,
    },
    {
      id: `jn-${component.id}-format`,
      dimension: "Format compliance",
      note:
        p.worst_category === "latency"
          ? "Occasional latency spikes under parallel tournament load."
          : "Consistent markdown section compliance in mock judge runs.",
      score_delta: p.worst_category === "latency" ? -3 : 1,
    },
  ];
}

export function buildMockFailureCases(component: MarketplaceComponent): string[] {
  const w = component.known_weakness;
  return [
    w,
    `Degrades on ${component.proof.worst_category} when source docs exceed 8k tokens.`,
    "Not validated for multilingual board briefs in current tournament set.",
  ];
}
