import { computeCompositeScore } from "@/lib/research/retrieval/composite-score";
import type { RetrievalAdapter, RetrievalQuery, RetrievalResult } from "@/lib/research/retrieval/types";
import type { EvidenceItem } from "@/lib/research/types";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,?.'"]+/)
    .filter((t) => t.length > 2);
}

function scoreMatch(query: string, item: EvidenceItem): number {
  const tokens = tokenize(query);
  const hay = `${item.title} ${item.summary} ${item.quote_or_excerpt} ${item.tags.join(" ")}`.toLowerCase();
  if (tokens.length === 0) return 0;
  const hits = tokens.filter((t) => hay.includes(t)).length;
  return Math.min(1, hits / tokens.length + (hits > 2 ? 0.15 : 0));
}

export class MockRetrievalAdapter implements RetrievalAdapter {
  readonly backend = "mock" as const;

  async search(query: RetrievalQuery, pool: EvidenceItem[]): Promise<RetrievalResult> {
    const start = Date.now();
    const topK = query.top_k ?? 8;
    const minScore = query.min_composite_score ?? 0.35;

    let candidates = pool;
    if (query.source_types?.length) {
      candidates = candidates.filter((e) => query.source_types!.includes(e.source_type));
    }

    const ranked = candidates
      .map((item) => {
        const relevance = scoreMatch(query.text, item);
        const composite = computeCompositeScore(
          relevance,
          item.confidence_score,
          item.freshness_score,
          item.reliability_score,
        );
        return { ...item, relevance_score: relevance, composite_score: composite };
      })
      .filter((e) => e.composite_score >= minScore)
      .sort((a, b) => b.composite_score - a.composite_score)
      .slice(0, topK);

    return {
      chunks: [],
      evidence_candidates: ranked,
      backend: "mock",
      latency_ms: Date.now() - start,
    };
  }

  async healthCheck(): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: "Mock retrieval adapter ready" };
  }
}

export const mockRetrievalAdapter = new MockRetrievalAdapter();
