import { deriveProofStatus } from "@/lib/marketplace/proof-status";
import type {
  CandidateStatus,
  MarketplaceCandidateRecord,
  MarketplaceComponent,
} from "@/lib/marketplace/types";
import { newId } from "@/lib/tournament/engine-mock";

const GLOBAL_PUBLISHED = "__ai_arena_published_components__";

function getPublished(): Map<string, MarketplaceComponent> {
  const g = globalThis as typeof globalThis & { [GLOBAL_PUBLISHED]?: Map<string, MarketplaceComponent> };
  if (!g[GLOBAL_PUBLISHED]) {
    g[GLOBAL_PUBLISHED] = new Map();
  }
  return g[GLOBAL_PUBLISHED]!;
}

export function getPublishedComponents(): MarketplaceComponent[] {
  return [...getPublished().values()];
}

export function getPublishedComponentById(id: string): MarketplaceComponent | undefined {
  return getPublished().get(id);
}

export function registerPublishedComponent(component: MarketplaceComponent): MarketplaceComponent {
  getPublished().set(component.id, component);
  return component;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** Promote reviewed candidate → published catalog component (Stack Builder + export). */
export function promoteCandidateToComponent(
  candidate: MarketplaceCandidateRecord,
): { component: MarketplaceComponent; candidate: MarketplaceCandidateRecord } {
  const now = new Date().toISOString();
  const componentId =
    candidate.component_id ?? `comp-${slugify(candidate.title)}-${candidate.strategy_hash.slice(0, 6)}`;

  const component: MarketplaceComponent = {
    id: componentId,
    slug: componentId,
    type: candidate.component_type,
    title: candidate.title,
    description: candidate.description,
    author: "tournament",
    version: `v1.r${candidate.source_round}`,
    tags: [candidate.winning_agent, candidate.challenge_category, candidate.component_type],
    categories: [candidate.challenge_category],
    compatible_providers: ["groq", "mock"],
    compatible_ides: ["cursor", "claude-code"],
    source_tournament_id: candidate.tournament_id,
    source_round: candidate.source_round,
    status: "published",
    proof: candidate.proof,
    arena_score: candidate.arena_score,
    tournament_tested: candidate.tested_runs >= 5,
    proof_status: "battle_tested",
    known_weakness: `Weaker on ${candidate.proof.worst_category} under tight deadlines.`,
    best_use_case: candidate.proof.recommended_use_cases[0] ?? candidate.challenge_title ?? "Tournament workflows",
    evidence_count: candidate.evidence.length,
    evidence: candidate.evidence,
    judge_notes: candidate.judge_notes,
    failure_cases: [],
    compatible_stack_component_ids: [],
    payload_preview: candidate.description.slice(0, 160),
    install_notes: "Add to stack from /stack-builder and export to Cursor or Claude Code.",
    usage_examples: [`Used by ${candidate.agent_name ?? candidate.winning_agent} in round ${candidate.source_round}`],
    suggested_price_usd: Math.round((0.15 + candidate.marketplace_score * 0.08) * 100) / 100,
    created_at: now,
    updated_at: now,
  };

  component.proof_status = deriveProofStatus(component);
  registerPublishedComponent(component);

  const updatedCandidate: MarketplaceCandidateRecord = {
    ...candidate,
    component_id: componentId,
    status: "published" satisfies CandidateStatus,
    updated_at: now,
  };

  return { component, candidate: updatedCandidate };
}
