import { enrichLegacyCandidates } from "@/lib/marketplace/candidate-detector";
import { newId } from "@/lib/tournament/engine-mock";
import type { MarketplaceEvidenceNote, MemoryArticle } from "@/lib/memory/types";
import type { TournamentState } from "@/lib/tournament/types";

/** Attach evidence notes to marketplace candidates from memory articles. */
export function buildMarketplaceEvidence(
  state: TournamentState,
  articles: MemoryArticle[],
): MarketplaceEvidenceNote[] {
  const candidates = enrichLegacyCandidates(state);
  const notes: MarketplaceEvidenceNote[] = [];
  const now = new Date().toISOString();

  for (const cand of candidates) {
    const related = articles.filter(
      (a) =>
        a.agent_ids.includes(cand.agent_id ?? "") ||
        a.article_type === "marketplace_opportunity" ||
        a.article_type === "agent_pattern",
    );

    notes.push({
      id: newId(),
      marketplace_candidate_id: cand.id,
      component_id: cand.component_id,
      tournament_id: cand.tournament_id,
      round: cand.round,
      note: `Tournament round ${cand.round}: ${cand.title} scored ${cand.total_score}. ${related.length} knowledge articles support this candidate.`,
      evidence_article_ids: related.slice(0, 3).map((a) => a.id),
      confidence: cand.arena_score.total / 100,
      created_at: now,
    });
  }

  return notes;
}
