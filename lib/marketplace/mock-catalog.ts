import { getMockConstitutionRecords } from "@/lib/constitution/mock-data";
import { getPublishedComponents } from "@/lib/marketplace/published-catalog";
import { computeArenaScore, isTournamentTested } from "@/lib/marketplace/arena-score";
import {
  buildMockEvidence,
  buildMockFailureCases,
  buildMockJudgeNotes,
} from "@/lib/marketplace/mock-evidence";
import { deriveProofStatus } from "@/lib/marketplace/proof-status";
import type {
  ComponentPerformanceProof,
  ComponentProofStatus,
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
    avg_latency_ms: partial.avg_latency_ms ?? 840,
    best_category: partial.best_category ?? "cost efficiency",
    worst_category: partial.worst_category ?? "latency",
    tournament_runs: partial.tournament_runs ?? 12,
    benchmark_history: partial.benchmark_history ?? [
      { round: 10, score: partial.avg_score - 4, cost: partial.avg_cost_usd ?? 0.003 },
      { round: 11, score: partial.avg_score - 2, cost: (partial.avg_cost_usd ?? 0.003) * 0.95 },
      { round: 12, score: partial.avg_score, cost: partial.avg_cost_usd ?? 0.003 },
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
  extra?: Partial<MarketplaceComponent> & { proof_status?: ComponentProofStatus },
): MarketplaceComponent {
  const base: MarketplaceComponent = {
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
    source_tournament_id: extra?.source_tournament_id ?? "tournament-T-R12",
    source_round: extra?.source_round ?? 12,
    status: extra?.status ?? "published",
    proof: p,
    arena_score: computeArenaScore(p, {
      popularity: extra?.arena_score?.popularity,
      compatibility: extra?.arena_score?.compatibility,
    }),
    tournament_tested: false,
    proof_status: extra?.proof_status ?? "battle_tested",
    known_weakness: extra?.known_weakness ?? `Weaker on ${p.worst_category} under tight deadlines.`,
    best_use_case: extra?.best_use_case ?? p.recommended_use_cases[0] ?? "Executive summary workflows",
    evidence_count: extra?.evidence_count ?? p.tournament_runs,
    evidence: extra?.evidence ?? [],
    judge_notes: extra?.judge_notes ?? [],
    failure_cases: extra?.failure_cases ?? [],
    compatible_stack_component_ids: extra?.compatible_stack_component_ids ?? [],
    payload_preview: extra?.payload_preview ?? description.slice(0, 160),
    install_notes: extra?.install_notes ?? "Add to stack and export to Cursor or Claude Code.",
    usage_examples: extra?.usage_examples ?? ["Run on board brief challenge"],
    suggested_price_usd: extra?.suggested_price_usd ?? 12,
    created_at: extra?.created_at ?? NOW,
    updated_at: extra?.updated_at ?? NOW,
  };
  return finalize(base);
}

function finalize(c: MarketplaceComponent): MarketplaceComponent {
  const evidence = c.evidence.length > 0 ? c.evidence : buildMockEvidence(c);
  const judge_notes = c.judge_notes.length > 0 ? c.judge_notes : buildMockJudgeNotes(c);
  const failure_cases =
    c.failure_cases.length > 0 ? c.failure_cases : buildMockFailureCases(c);
  const enriched: MarketplaceComponent = {
    ...c,
    evidence,
    judge_notes,
    failure_cases,
    evidence_count: evidence.length,
    tournament_tested: isTournamentTested(c.proof),
    arena_score: computeArenaScore(c.proof),
    proof_status: deriveProofStatus({ ...c, evidence, judge_notes, failure_cases }),
  };
  return enriched;
}

function constitutionComponents(): MarketplaceComponent[] {
  return getMockConstitutionRecords().flatMap((record) => {
    const latest = record.versions[record.versions.length - 1]!;
    const score = latest.constitutionScore;
    const p = proof({
      avg_score: score,
      avg_cost_usd: record.agentId === "lean" ? 0.0018 : 0.006,
      avg_tokens: record.agentId === "lean" ? 850 : 2400,
      avg_latency_ms: record.agentId === "lean" ? 620 : 1100,
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

/** Phase 1 featured proof components (stable IDs). */
const FEATURED_PROOF_COMPONENTS: MarketplaceComponent[] = [
  mk(
    "comp-low-cost-exec-workflow",
    "workflow_template",
    "Low-Cost Executive Summary Workflow",
    "Three-step extract → structure → self-review workflow tuned for sub-$0.003 runs on board briefs.",
    proof({
      avg_score: 91,
      avg_cost_usd: 0.0016,
      avg_tokens: 780,
      avg_latency_ms: 540,
      win_rate: 0.68,
      tournament_runs: 38,
      best_category: "cost efficiency",
      worst_category: "nuance on legal risk",
      recommended_use_cases: ["Weekly exec briefs", "Board prep under token caps"],
    }),
    {
      proof_status: "winner",
      known_weakness: "Skips deep competitive analysis when source doc exceeds 6k tokens.",
      compatible_providers: ["groq", "mock"],
      compatible_stack_component_ids: [
        "comp-business-quality-judge-rubric",
        "comp-groq-first-cost-router",
      ],
      payload_preview: "1. Parse memo 2. Draft 3 sections 3. Token-budget self-review",
      suggested_price_usd: 14,
      tags: ["workflow", "lean", "executive-summary"],
    },
  ),
  mk(
    "comp-lean-operator-v12",
    "agent_constitution",
    "Lean Operator v1.2 Constitution",
    "Token-minimal competitor constitution with hard self-review gates and outline-first drafting.",
    proof({
      avg_score: 84,
      avg_cost_usd: 0.0018,
      avg_tokens: 850,
      avg_latency_ms: 620,
      win_rate: 0.62,
      tournament_runs: 47,
      best_category: "cost efficiency",
      worst_category: "creative framing",
      recommended_use_cases: ["High-volume tournament loops", "Cost-capped production agents"],
    }),
    {
      version: "v1.2",
      proof_status: "battle_tested",
      known_weakness: "Creative framing and narrative polish trail premium agents by ~8 pts.",
      compatible_providers: ["groq", "anthropic", "mock"],
      compatible_stack_component_ids: ["comp-low-cost-exec-workflow", "comp-groq-first-cost-router"],
      payload_preview: "Role: minimize tokens · Self-review before submit · Abort if >900 tokens",
      suggested_price_usd: 11,
      tags: ["lean", "constitution", "v1.2"],
    },
  ),
  mk(
    "comp-groq-first-cost-router",
    "model_router",
    "Groq-first Cost Router",
    "Routes challenge generation and competitor runs to Groq; defers premium judge unless hybrid mode.",
    proof({
      avg_score: 81,
      avg_cost_usd: 0.0012,
      avg_tokens: 1800,
      avg_latency_ms: 710,
      win_rate: 0.71,
      tournament_runs: 52,
      best_category: "routing efficiency",
      worst_category: "final judge quality",
      recommended_use_cases: ["Autonomous tournament loops", "Free-tier Groq deployments"],
    }),
    {
      proof_status: "battle_tested",
      known_weakness: "Final judge quality capped when premium keys omitted (mock fallback).",
      compatible_providers: ["groq", "mock"],
      payload_preview: "task_routes: challenge_generation→groq, competitor_run→groq, final_judge→mock",
      suggested_price_usd: 15,
      tags: ["groq", "routing", "tournament"],
      categories: ["routing", "executive-summary"],
    },
  ),
  mk(
    "comp-business-quality-judge-rubric",
    "judge_rubric",
    "Business Quality Judge Rubric",
    "Accuracy, completeness, structure, and business usefulness with hallucination penalties.",
    proof({
      avg_score: 88,
      avg_cost_usd: 0.0025,
      avg_tokens: 400,
      avg_latency_ms: 380,
      win_rate: 0.82,
      tournament_runs: 60,
      best_category: "reliability",
      worst_category: "latency on long outputs",
      recommended_use_cases: ["Executive summary battles", "Enterprise review gates"],
    }),
    {
      proof_status: "enterprise_ready",
      known_weakness: "Latency increases when judging outputs over 3k tokens.",
      compatible_providers: ["groq", "anthropic", "openai", "mock"],
      compatible_stack_component_ids: ["comp-low-cost-exec-workflow"],
      tags: ["judge", "rubric", "business"],
    },
  ),
  mk(
    "comp-exec-summary-3step-prompt",
    "prompt_template",
    "Executive Summary 3-Step Prompt",
    "System prompt enforcing Extract → Structure → Self-check for board-ready markdown.",
    proof({
      avg_score: 86,
      avg_cost_usd: 0.002,
      avg_tokens: 1200,
      avg_latency_ms: 590,
      win_rate: 0.58,
      tournament_runs: 25,
      recommended_use_cases: ["Single-shot exec summaries", "Prompt library seeding"],
    }),
    {
      proof_status: "tested",
      known_weakness: "Needs pairing with judge rubric for production approval workflows.",
      payload_preview: "You are a board analyst. Step 1: extract facts. Step 2: three sections. Step 3: self-check.",
    },
  ),
  mk(
    "comp-supabase-tournament-storage-hook",
    "storage_hook",
    "Supabase Tournament Storage Hook",
    "Upsert hook for tournament_rounds JSON payloads with graceful mock fallback.",
    proof({
      avg_score: 80,
      avg_cost_usd: 0,
      avg_tokens: 0,
      avg_latency_ms: 120,
      win_rate: 0.9,
      tournament_runs: 40,
      best_category: "reliability",
      worst_category: "schema migration drift",
      recommended_use_cases: ["Persist tournament replay data", "Marketplace evidence sync"],
    }),
    {
      proof_status: "battle_tested",
      known_weakness: "Requires service role for admin writes; anon path is read-heavy only.",
      compatible_providers: ["mock"],
      compatible_ides: ["generic", "cursor"],
      categories: ["workflow", "executive-summary"],
    },
  ),
];

const STATIC_COMPONENTS: MarketplaceComponent[] = [
  ...FEATURED_PROOF_COMPONENTS,
  mk(
    "comp-lean-cost-policy",
    "cost_policy",
    "Lean Hard Cap Cost Policy",
    "Hard cap $0.002/run with 80% abort threshold on self-review.",
    proof({ avg_score: 78, avg_cost_usd: 0.0018, avg_tokens: 900, avg_latency_ms: 480, win_rate: 0.58, tournament_runs: 47 }),
    { tags: ["cost", "lean"], suggested_price_usd: 7.5 },
  ),
  mk(
    "comp-exec-summary-workflow",
    "workflow_template",
    "Executive Summary 3-Step Workflow",
    "Extract → structure → self-review workflow for board briefs.",
    proof({ avg_score: 83, avg_cost_usd: 0.004, avg_tokens: 2100, avg_latency_ms: 920, win_rate: 0.54, tournament_runs: 31 }),
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
      avg_latency_ms: 400,
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
    proof({ avg_score: 76, avg_cost_usd: 0, avg_tokens: 0, avg_latency_ms: 0, win_rate: 0.65, tournament_runs: 22 }),
    { categories: ["challenge", "strategy"] },
  ),
  mk(
    "comp-format-evaluation-hook",
    "evaluation_hook",
    "Format Compliance Hook",
    "Post-run validation for required markdown sections.",
    proof({ avg_score: 79, avg_cost_usd: 0.0001, avg_tokens: 50, avg_latency_ms: 45, win_rate: 0.77, tournament_runs: 38 }),
    { tags: ["hook", "format"] },
  ),
  mk(
    "comp-supabase-read-mcp",
    "mcp_integration",
    "Supabase Read MCP Pack",
    "Read-only MCP tools for tournament data and submissions.",
    proof({ avg_score: 74, avg_cost_usd: 0.005, avg_tokens: 800, avg_latency_ms: 650, win_rate: 0.5, tournament_runs: 8 }),
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
    proof({ avg_score: 85, avg_cost_usd: 0, avg_tokens: 0, avg_latency_ms: 0, win_rate: 0.6, tournament_runs: 12 }),
    { categories: ["benchmark", "report"] },
  ),
  mk(
    "comp-exec-summary-pack",
    "tournament_pack",
    "Executive Summary Battle Pack",
    "Challenge + 5 agents + judge rubric + router bundle.",
    proof({ avg_score: 86, avg_cost_usd: 0.008, avg_tokens: 3500, avg_latency_ms: 1400, win_rate: 0.68, tournament_runs: 15 }),
    { tags: ["pack", "bundle"], suggested_price_usd: 29 },
  ),
  mk(
    "comp-exec-summary-prompt",
    "prompt_template",
    "Executive Summary System Prompt",
    "Single-task prompt for structured board summaries.",
    proof({ avg_score: 72, avg_cost_usd: 0.002, avg_tokens: 1200, avg_latency_ms: 600, win_rate: 0.52, tournament_runs: 25 }),
  ),
  mk(
    "comp-tournament-round-storage-hook",
    "storage_hook",
    "Tournament Round Saver Hook",
    "Supabase upsert hook for tournament_rounds payload JSON.",
    proof({ avg_score: 80, avg_cost_usd: 0, avg_tokens: 0, avg_latency_ms: 130, win_rate: 0.9, tournament_runs: 40 }),
    { compatible_ides: ["generic", "cursor"] },
  ),
  mk(
    "comp-ai-arena-cursor-setup",
    "setup_pack",
    "AI ARENA Cursor Setup Pack",
    "Rules, skills references, and tournament runner stubs for Cursor.",
    proof({ avg_score: 77, avg_cost_usd: 0, avg_tokens: 0, avg_latency_ms: 0, win_rate: 0.55, tournament_runs: 6 }),
    { compatible_ides: ["cursor"], tags: ["cursor", "setup"] },
  ),
  mk(
    "comp-hybrid-quality-router",
    "model_router",
    "Hybrid Quality Router",
    "Groq agent loop + mock final judge for cost/quality balance.",
    proof({ avg_score: 84, avg_cost_usd: 0.0025, avg_tokens: 2000, avg_latency_ms: 880, win_rate: 0.66, tournament_runs: 28 }),
    { tags: ["hybrid", "groq"], version: "v1.1" },
  ),
  mk(
    "comp-premium-cost-policy",
    "cost_policy",
    "Premium Soft Cap Policy",
    "Soft cap $0.008/run — quality overrides cost up to cap.",
    proof({ avg_score: 82, avg_cost_usd: 0.007, avg_tokens: 3200, avg_latency_ms: 1200, win_rate: 0.45, tournament_runs: 19 }),
    { tags: ["premium", "cost"] },
  ),
  mk(
    "comp-rate-limit-guard-hook",
    "evaluation_hook",
    "Rate Limit Guard Hook",
    "Pre-loop assessment for Groq RPM/RPD with mock fallback.",
    proof({ avg_score: 86, avg_cost_usd: 0, avg_tokens: 0, avg_latency_ms: 30, win_rate: 0.88, tournament_runs: 35 }),
  ),
  mk(
    "comp-claude-code-arena-setup",
    "setup_pack",
    "Claude Code Arena Setup",
    "CLAUDE.md + commands for tournament-tested workflow installs.",
    proof({ avg_score: 75, avg_cost_usd: 0, avg_tokens: 0, avg_latency_ms: 0, win_rate: 0.5, tournament_runs: 5 }),
    { compatible_ides: ["claude-code"] },
  ),
];

let _catalog: MarketplaceComponent[] | null = null;

function buildCatalog(): MarketplaceComponent[] {
  const merged = [...constitutionComponents(), ...STATIC_COMPONENTS, ...getPublishedComponents()];
  const byId = new Map<string, MarketplaceComponent>();
  for (const c of merged) {
    byId.set(c.id, finalize(c));
  }
  return [...byId.values()];
}

export function getMockComponentCatalog(): MarketplaceComponent[] {
  if (!_catalog) {
    _catalog = buildCatalog();
  }
  return _catalog;
}

/** Call after admin publish so Stack Builder sees new components. */
export function refreshComponentCatalog(): void {
  _catalog = buildCatalog();
}

export function getComponentById(id: string): MarketplaceComponent | undefined {
  const aliases: Record<string, string> = {
    "comp-groq-tournament-router": "comp-groq-first-cost-router",
    "comp-exec-summary-workflow": "comp-low-cost-exec-workflow",
  };
  const resolved = aliases[id] ?? id;
  return getMockComponentCatalog().find((c) => c.id === resolved || c.slug === resolved);
}

export function getFeaturedComponents(limit = 4): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .filter((c) => c.tournament_tested)
    .sort((a, b) => b.arena_score.total - a.arena_score.total)
    .slice(0, limit);
}

export function getTrendingComponents(limit = 6): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .sort(
      (a, b) =>
        b.arena_score.freshness +
        b.arena_score.popularity -
        (a.arena_score.freshness + a.arena_score.popularity),
    )
    .slice(0, limit);
}

export function getComponentsByType(type: ComponentType): MarketplaceComponent[] {
  return getMockComponentCatalog().filter((c) => c.type === type);
}

export function filterComponents(
  filters: import("@/lib/marketplace/types").ComponentFilters,
  sort: ComponentSortKey = "arena_score",
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
