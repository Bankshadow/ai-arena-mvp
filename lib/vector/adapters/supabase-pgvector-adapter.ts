import type { VectorMemoryAdapter } from "@/lib/vector/adapter";
import type {
  VectorCollectionName,
  VectorCollectionStats,
  VectorDocument,
  VectorSearchHit,
  VectorSearchQuery,
} from "@/lib/vector/types";

/** MVP 6 stub — Supabase pgvector not wired. */
export class SupabasePgVectorAdapter implements VectorMemoryAdapter {
  readonly backend = "pgvector" as const;

  async createCollection(_name: VectorCollectionName, _dimension: number): Promise<void> {
    throw new Error("SupabasePgVectorAdapter not implemented — use mock backend");
  }
  async upsertDocument(_doc: VectorDocument): Promise<void> {
    throw new Error("SupabasePgVectorAdapter not implemented");
  }
  async upsertDocuments(_docs: VectorDocument[]): Promise<void> {
    throw new Error("SupabasePgVectorAdapter not implemented");
  }
  async searchSimilar(
    _query: VectorSearchQuery & { query_embedding: number[] },
  ): Promise<VectorSearchHit[]> {
    throw new Error("SupabasePgVectorAdapter not implemented");
  }
  async deleteDocument(_collection: VectorCollectionName, _id: string): Promise<void> {
    throw new Error("SupabasePgVectorAdapter not implemented");
  }
  async getCollectionStats(_collection: VectorCollectionName): Promise<VectorCollectionStats> {
    throw new Error("SupabasePgVectorAdapter not implemented");
  }
  async rebuildIndex(
    _collection: VectorCollectionName,
    _docs: VectorDocument[],
  ): Promise<{ indexed: number }> {
    throw new Error("SupabasePgVectorAdapter not implemented");
  }
  async clearCollection(_collection: VectorCollectionName): Promise<void> {
    throw new Error("SupabasePgVectorAdapter not implemented");
  }
  async healthCheck() {
    return { ok: false, message: "Supabase pgvector adapter not configured" };
  }
}
