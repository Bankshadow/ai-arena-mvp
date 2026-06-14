import { VectorIndexService } from "@/lib/vector/index-service";
import type { MemorySemanticSearchResult } from "@/lib/vector/types";
import { MEMORY_SEARCH_COLLECTIONS } from "@/lib/vector/types";

export async function searchMemorySemantic(
  query: string,
  service: VectorIndexService,
): Promise<MemorySemanticSearchResult> {
  const result = await service.search({
    text: query,
    collections: MEMORY_SEARCH_COLLECTIONS,
    top_k: 12,
    min_score: 0.18,
  });

  return {
    ...result,
    hits: result.hits.map((h) => ({
      ...h,
      recommended_action: h.document.recommended_action,
    })),
  };
}
