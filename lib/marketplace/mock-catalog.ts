import { getMockConstitutionRecords } from "@/lib/constitution/mock-data";
import { computeArenaScore, isTournamentTested } from "@/lib/marketplace/arena-score";
import type {
  ComponentPerformanceProof,
  ComponentSortKey,
  ComponentType,
  MarketplaceComponent,
  ProviderId,
} from "@/lib/marketplace/types";

const NOW = "2026-06-14T12:00:00.000Z";

function proof(
  partial: Partial<ComponentPerformanceProof> & Pick<ComponentPerformanceProof, "avg_score">,
): ComponentPerformanceProof {
  return {
    win_rate: partial.win_rate ?? 0.55,
    avg_score: partial.avg_score,
    avg_cost_usd: partial.avg_cost_usd ?? 0.003,
    avg_tokens: partial.avg_tokens ?? 2200,
    best_category: partial.best_category ?? "cost efficiency",
    worst_category: partial.worst_category ?? "latency",
    tournament_runs: partial.tournament_runs ?? 12,
    benchmark_history: partial.benchmark_history ?? [
      { round: 1, score: partial.avg_score - 4, cost: partial.avg_cost_usd ?? 0.003 },
      { round: 2, score: partial.avg_score - 2, cost: (partial.avg_cost_usd ?? 0.003) * 0.95 },
      { round: 3, score: partial.avg_score, cost: partial.avg_cost_usd ?? 0.003 },
    ],
    recommended_use_cases: partial.recommended_use_cases ?? ["Executive summaries", "Ops briefs"],
    last_tournament_at: partial.last_tournament_at ?? NOW,
  };
}

function mk(
  id: string,
  type: ComponentType,
  title: string,
  description: string,
  p: ComponentPerformanceProof,
  extra?: Partial<MarketplaceComponent>,
): MarketplaceComponent {
  const arena_score = computeArenaScore(p, {
    popularity: extra?.arena_score?.popularity,
    compatibility: extra?.arena_score?.compatibility,
  });
  return {
    id,
    slug: id,
    type,
    title,
    description,
    author: "tournament",
    version: extra?.version ?? "v1.0",
    tags: extra?.tags ?? [type.replace(/_/g, "-")],
    categories: extra?.categories ?? ["executive-summary"],
    compatible_providers: extra?.compatible_providers ?? ["groq", "mock"],
    compatible_ides: extra?.compatible_ides ?? ["cursor", "claude-code"],
    source_tournament_id: extra?.source_tournament_id ?? "tournament-default",
    source_round: extra?.source_round ?? 3,
    status: extra?.status ?? "published",
    proof: p,
    arena_score,
    tournament_tested: isTournamentTested(p),
    payload_preview: extra?.payload_preview ?? description.slice(0, 160),
    install_notes: extra?.install_notes ?? "Add to stack and export to Cursor or Claude Code.",
    usage_examples: extra?.usage_examples ?? ["Run on board brief challenge"],
    suggested_price_usd: extra?.suggested_price_usd ?? 12,
    created_at: extra?.created_at ?? NOW,
    updated_at: extra?.updated_at ?? NOW,
  };
}

function constitutionComponents(): MarketplaceComponent[] {
  return getMockConstitutionRecords().flatMap((record) => {
    const latest = record.versions[record.versions.length - 1]!;
    const score = latest.constitutionScore;
    const p = proof({
      avg_score: score,
      avg_cost_usd: record.agentId === "lean" ? 0.0018 : 0.006,
      avg_tokens: record.agentId === "lean" ? 850 : 2400,
      win_rate: record.agentId === "lean" ? 0.62 : 0.48,
      tournament_runs: record.agentId === "lean" ? 47 : 18,
      best_category: record.agentType === "judge" ? "reliability" : "cost efficiency",
      recommended_use_cases: [latest.marketplacePositioning.slice(0, 60)],
    });
    return [
      mk(
        `comp-${record.id}-${latest.version}`,
        record.agentType === "judge"
          ? "judge_rubric"
          : record.agentType === "creator"
            ? "challenge_template"
            : "agent_constitution",
        `${record.agentName} Constitution ${latest.version}`,
        latest.roleDefinition,
        p,
        {
          version: latest.version,
          payload_preview: latest.outputFormatContract,
          tags: [record.agentId, latest.version, "constitution"],
          suggested_price_usd: 9 + score * 0.15,
        },
      ),
    ];
  });
}

const STATIC_COMPONENTS: MarketplaceComponent[] = [
  mk(
    "comp-groq-tournament-router",
    "model_router",
    "Groq-First Tournament Router",
    "Routes challenge_generation, competitor_run, and preliminary_judge to Groq; final judge to mock.",
    proof({ avg_score: 81, avg_cost_usd: 0.0012, avg_tokens: 1800, win_rate: 0.71, tournament_runs: 52 }),
    {
      compatible_providers: ["groq", "mock"],
      payload_preview: "task_routes: challenge_generation→groq, final_judge→mock",
      suggested_price_usd: 15,
      tags: ["groq", "routing", "tournament"],
    },
  ),
  mk(
    "comp-lean-cost-policy",
    "cost_policy",
    "Lean Hard Cap Cost Policy",
    "Hard cap $0.002/run with 80% abort threshold on self-review.",
    proof({ avg_score: 78, avg_cost_usd: 0.0018, avg_tokens: 900, win_rate: 0.58, tournament_runs: 47 }),
    { tags: ["cost", "lean"], suggested_price_usd: 7.5 },
  ),
  mk(
    "comp-exec-summary-workflow",
    "workflow_template",
    "Executive Summary 3-Step Workflow",
    "Extract → structure → self-review workflow for board briefs.",
    proof({ avg_score: 83, avg_cost_usd: 0.004, avg_tokens: 2100, win_rate: 0.54, tournament_runs: 31 }),
    {
      payload_preview: "1. Parse source 2. Draft sections 3. Self-review checklist",
      categories: ["executive-summary", "workflow"],
    },
  ),
  mk(
    "comp-quality-judge-rubric",
    "judge_rubric",
    "Quality Judge Rubric v1",
    "Accuracy, completeness, structure, usefulness with hallucination penalties.",
    proof({
      avg_score: 88,
      avg_cost_usd: 0.0025,
      avg_tokens: 400,
      win_rate: 0.82,
      tournament_runs: 60,
      best_category: "reliability",
    }),
    { tags: ["judge", "rubric"] },
  ),
  mk(
    "comp-q4-board-challenge",
    "challenge_template",
    "Q4 Board Risk Brief",
    "Strategic challenge template from tournament round 3.",
    proof({ avg_score: 76, avg_cost_usd: 0, avg_tokens: 0, win_rate: 0.65, tournament_runs: 22 }),
    { categories: ["challenge", "strategy"] },
  ),
  mk(
    "comp-format-evaluation-hook",
    "evaluation_hook",
    "Format Compliance Hook",
    "Post-run validation for required markdown sections.",
    proof({ avg_score: 79, avg_cost_usd: 0.0001, avg_tokens: 50, win_rate: 0.77, tournament_runs: 38 }),
    { tags: ["hook", "format"] },
  ),
  mk(
    "comp-supabase-read-mcp",
    "mcp_integration",
    "Supabase Read MCP Pack",
    "Read-only MCP tools for tournament data and submissions.",
    proof({ avg_score: 74, avg_cost_usd: 0.005, avg_tokens: 800, win_rate: 0.5, tournament_runs: 8 }),
    {
      compatible_providers: ["anthropic", "openai"] as ProviderId[],
      tags: ["mcp", "supabase"],
    },
  ),
  mk(
    "comp-lean-vs-premium-report",
    "benchmark_report",
    "Lean vs Premium Benchmark Q1",
    "Cross-agent benchmark report from 12 tournament rounds.",
    proof({ avg_score: 85, avg_cost_usd: 0, avg_tokens: 0, win_rate: 0.6, tournament_runs: 12 }),
    { categories: ["benchmark", "report"] },
  ),
  mk(
    "comp-exec-summary-pack",
    "tournament_pack",
    "Executive Summary Battle Pack",
    "Challenge + 5 agents + judge rubric + router bundle.",
    proof({ avg_score: 86, avg_cost_usd: 0.008, avg_tokens: 3500, win_rate: 0.68, tournament_runs: 15 }),
    { tags: ["pack", "bundle"], suggested_price_usd: 29 },
  ),
  mk(
    "comp-exec-summary-prompt",
    "prompt_template",
    "Executive Summary System Prompt",
    "Single-task prompt for structured board summaries.",
    proof({ avg_score: 72, avg_cost_usd: 0.002, avg_tokens: 1200, win_rate: 0.52, tournament_runs: 25 }),
  ),
  mk(
    "comp-tournament-round-storage-hook",
    "storage_hook",
    "Tournament Round Saver Hook",
    "Supabase upsert hook for tournament_rounds payload JSON.",
    proof({ avg_score: 80, avg_cost_usd: 0, avg_tokens: 0, win_rate: 0.9, tournament_runs: 40 }),
    { compatible_ides: ["generic", "cursor"] },
  ),
  mk(
    "comp-ai-arena-cursor-setup",
    "setup_pack",
    "AI ARENA Cursor Setup Pack",
    "Rules, skills references, and tournament runner stubs for Cursor.",
    proof({ avg_score: 77, avg_cost_usd: 0, avg_tokens: 0, win_rate: 0.55, tournament_runs: 6 }),
    { compatible_ides: ["cursor"], tags: ["cursor", "setup"] },
  ),
  mk(
    "comp-hybrid-quality-router",
    "model_router",
    "Hybrid Quality Router",
    "Groq agent loop + mock final judge for cost/quality balance.",
    proof({ avg_score: 84, avg_cost_usd: 0.0025, avg_tokens: 2000, win_rate: 0.66, tournament_runs: 28 }),
    { tags: ["hybrid", "groq"], version: "v1.1" },
  ),
  mk(
    "comp-premium-cost-policy",
    "cost_policy",
    "Premium Soft Cap Policy",
    "Soft cap $0.008/run — quality overrides cost up to cap.",
    proof({ avg_score: 82, avg_cost_usd: 0.007, avg_tokens: 3200, win_rate: 0.45, tournament_runs: 19 }),
    { tags: ["premium", "cost"] },
  ),
  mk(
    "comp-rate-limit-guard-hook",
    "evaluation_hook",
    "Rate Limit Guard Hook",
    "Pre-loop assessment for Groq RPM/RPD with mock fallback.",
    proof({ avg_score: 86, avg_cost_usd: 0, avg_tokens: 0, win_rate: 0.88, tournament_runs: 35 }),
  ),
  mk(
    "comp-claude-code-arena-setup",
    "setup_pack",
    "Claude Code Arena Setup",
    "CLAUDE.md + commands for tournament-tested workflow installs.",
    proof({ avg_score: 75, avg_cost_usd: 0, avg_tokens: 0, win_rate: 0.5, tournament_runs: 5 }),
    { compatible_ides: ["claude-code"] },
  ),
];

// Fix mcp and cursor setup - tournament_tested is computed from proof
function finalize(c: MarketplaceComponent): MarketplaceComponent {
  return {
    ...c,
    tournament_tested: isTournamentTested(c.proof),
    arena_score: computeArenaScore(c.proof),
  };
}

let _catalog: MarketplaceComponent[] | null = null;

export function getMockComponentCatalog(): MarketplaceComponent[] {
  if (!_catalog) {
    const merged = [...constitutionComponents(), ...STATIC_COMPONENTS.map(finalize)];
    const byId = new Map<string, MarketplaceComponent>();
    for (const c of merged) {
      byId.set(c.id, finalize(c));
    }
    _catalog = [...byId.values()];
  }
  return _catalog;
}

export function getComponentById(id: string): MarketplaceComponent | undefined {
  return getMockComponentCatalog().find((c) => c.id === id || c.slug === id);
}

export function getFeaturedComponents(limit = 4): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .filter((c) => c.tournament_tested)
    .sort((a, b) => b.arena_score.total - a.arena_score.total)
    .slice(0, limit);
}

export function getTrendingComponents(limit = 6): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .sort((a, b) => b.arena_score.freshness + b.arena_score.popularity - (a.arena_score.freshness + a.arena_score.popularity))
    .slice(0, limit);
}

export function getComponentsByType(type: ComponentType): MarketplaceComponent[] {
  return getMockComponentCatalog().filter((c) => c.type === type);
}

export function filterComponents(
  filters: import("@/lib/marketplace/types").ComponentFilters,
  sort: import("@/lib/marketplace/types").ComponentSortKey = "arena_score",
): MarketplaceComponent[] {
  let list = getMockComponentCatalog();

  if (filters.type) list = list.filter((c) => c.type === filters.type);
  if (filters.category) list = list.filter((c) => c.categories.includes(filters.category!));
  if (filters.min_arena_score != null) {
    list = list.filter((c) => c.arena_score.total >= filters.min_arena_score!);
  }
  if (filters.max_avg_cost != null) {
    list = list.filter((c) => c.proof.avg_cost_usd <= filters.max_avg_cost!);
  }
  if (filters.provider) {
    list = list.filter((c) => c.compatible_providers.includes(filters.provider!));
  }
  if (filters.tournament_tested_only) {
    list = list.filter((c) => c.tournament_tested);
  }
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q)),
    );
  }

  const sorters: Record<ComponentSortKey, (a: MarketplaceComponent, b: MarketplaceComponent) => number> = {
    arena_score: (a, b) => b.arena_score.total - a.arena_score.total,
    cost_efficiency: (a, b) => b.arena_score.cost_efficiency - a.arena_score.cost_efficiency,
    freshness: (a, b) => b.arena_score.freshness - a.arena_score.freshness,
    popularity: (a, b) => b.arena_score.popularity - a.arena_score.popularity,
    avg_score: (a, b) => b.proof.avg_score - a.proof.avg_score,
  };

  return [...list].sort(sorters[sort]);
}

export const COMPONENT_CATEGORIES = [
  "executive-summary",
  "workflow",
  "challenge",
  "benchmark",
  "routing",
  "report",
] as const;
