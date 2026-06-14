import { getComponentById } from "@/lib/marketplace/mock-catalog";
import type { VectorMemoryAdapter } from "@/lib/vector/adapter";
import { VectorIndexService } from "@/lib/vector/index-service";
import type { MarketplaceSemanticHit, MarketplaceSemanticSearchResult } from "@/lib/vector/types";

type QueryBoost = {
  match: RegExp;
  slugs: string[];
  stack_additions: string[];
};

const QUERY_BOOSTS: QueryBoost[] = [
  {
    match: /low.?cost|pdf|summary/i,
    slugs: ["groq-cost-policy", "lean-constitution-v2"],
    stack_additions: ["groq-cost-policy", "lean-constitution-v2"],
  },
  {
    match: /enterprise|risk.?review/i,
    slugs: ["premium-constitution-v1", "lean-constitution-v2"],
    stack_additions: ["premium-constitution-v1", "judge-efficiency-v1"],
  },
  {
    match: /groq|routing|model.?provider/i,
    slugs: ["groq-cost-policy"],
    stack_additions: ["groq-cost-policy"],
  },
  {
    match: /github|issue|triage|tool/i,
    slugs: ["minimal-tool-stack"],
    stack_additions: ["minimal-tool-stack"],
  },
];

function applyBoost(query: string, hits: MarketplaceSemanticHit[]): MarketplaceSemanticHit[] {
  const boost = QUERY_BOOSTS.find((b) => b.match.test(query));
  if (!boost) return hits;

  const boosted = [...hits];
  for (const slug of boost.slugs) {
    const comp = getComponentById(slug);
    if (!comp) continue;
    const existing = boosted.find((h) => h.slug === slug);
    const entry: MarketplaceSemanticHit = existing ?? {
      component_id: comp.id,
      slug: comp.slug,
      title: comp.title,
      similarity_score: 0.75,
      battle_score: comp.arena_score.battle,
      win_rate: comp.proof.win_rate,
      avg_cost_usd: comp.proof.avg_cost_usd,
      evidence_links: [`/research/evidence`, `/marketplace/${comp.slug}`],
      recommended_stack_additions: boost.stack_additions,
    };
    entry.similarity_score = Math.min(0.98, entry.similarity_score + 0.15);
    entry.recommended_stack_additions = boost.stack_additions;
    if (!existing) boosted.unshift(entry);
  }
  return boosted.sort((a, b) => b.similarity_score - a.similarity_score);
}

export async function searchMarketplaceSemantic(
  query: string,
  service: VectorIndexService,
): Promise<MarketplaceSemanticSearchResult> {
  const start = Date.now();
  const result = await service.search({
    text: query,
    collections: ["marketplace_component_vectors"],
    top_k: 8,
    min_score: 0.15,
  });

  let hits: MarketplaceSemanticHit[] = result.hits.map((h) => {
    const comp = getComponentById(h.document.source_id);
    const meta = h.document.metadata;
    return {
      component_id: h.document.source_id,
      slug: h.document.source_id,
      title: h.document.title,
      similarity_score: h.similarity_score,
      battle_score: (meta.battle_score as number) ?? comp?.arena_score.battle ?? 80,
      win_rate: (meta.win_rate as number) ?? comp?.proof.win_rate ?? 0.5,
      avg_cost_usd: (meta.avg_cost_usd as number) ?? comp?.proof.avg_cost_usd ?? 0.003,
      evidence_links: [`/research/evidence`, `/marketplace/${h.document.source_id}`],
      recommended_stack_additions: [h.document.source_id],
    };
  });

  hits = applyBoost(query, hits);

  return {
    query,
    hits: hits.slice(0, 6),
    backend: service.getAdapter().backend,
    latency_ms: Date.now() - start,
  };
}

export { QUERY_BOOSTS };
