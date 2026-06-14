import type {
  VectorCollectionName,
  VectorCollectionStats,
  VectorDocument,
  VectorSearchHit,
  VectorSearchQuery,
} from "@/lib/vector/types";

/** Adapter contract — Mock, Zvec, pgvector, Milvus implementations. */
export interface VectorMemoryAdapter {
  readonly backend: import("@/lib/vector/types").VectorBackend;

  createCollection(name: VectorCollectionName, dimension: number): Promise<void>;
  upsertDocument(doc: VectorDocument): Promise<void>;
  upsertDocuments(docs: VectorDocument[]): Promise<void>;
  searchSimilar(query: VectorSearchQuery & { query_embedding: number[] }): Promise<VectorSearchHit[]>;
  deleteDocument(collection: VectorCollectionName, id: string): Promise<void>;
  getCollectionStats(collection: VectorCollectionName): Promise<VectorCollectionStats>;
  rebuildIndex(collection: VectorCollectionName, docs: VectorDocument[]): Promise<{ indexed: number }>;
  clearCollection(collection: VectorCollectionName): Promise<void>;
  healthCheck(): Promise<{ ok: boolean; message: string }>;
}
