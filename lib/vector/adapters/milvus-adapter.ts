import type { VectorMemoryAdapter } from "@/lib/vector/adapter";
import type {
  VectorCollectionName,
  VectorCollectionStats,
  VectorDocument,
  VectorSearchHit,
  VectorSearchQuery,
} from "@/lib/vector/types";

/** MVP 6 stub — Milvus/Zilliz not wired. */
export class MilvusVectorAdapter implements VectorMemoryAdapter {
  readonly backend = "milvus" as const;

  async createCollection(_name: VectorCollectionName, _dimension: number): Promise<void> {
    throw new Error("MilvusVectorAdapter not implemented — use mock backend");
  }
  async upsertDocument(_doc: VectorDocument): Promise<void> {
    throw new Error("MilvusVectorAdapter not implemented");
  }
  async upsertDocuments(_docs: VectorDocument[]): Promise<void> {
    throw new Error("MilvusVectorAdapter not implemented");
  }
  async searchSimilar(
    _query: VectorSearchQuery & { query_embedding: number[] },
  ): Promise<VectorSearchHit[]> {
    throw new Error("MilvusVectorAdapter not implemented");
  }
  async deleteDocument(_collection: VectorCollectionName, _id: string): Promise<void> {
    throw new Error("MilvusVectorAdapter not implemented");
  }
  async getCollectionStats(_collection: VectorCollectionName): Promise<VectorCollectionStats> {
    throw new Error("MilvusVectorAdapter not implemented");
  }
  async rebuildIndex(
    _collection: VectorCollectionName,
    _docs: VectorDocument[],
  ): Promise<{ indexed: number }> {
    throw new Error("MilvusVectorAdapter not implemented");
  }
  async clearCollection(_collection: VectorCollectionName): Promise<void> {
    throw new Error("MilvusVectorAdapter not implemented");
  }
  async healthCheck() {
    return { ok: false, message: "Milvus adapter not configured" };
  }
}
