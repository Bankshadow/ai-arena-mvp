export * from "@/lib/vector/types";
export type { VectorMemoryAdapter } from "@/lib/vector/adapter";
export { MockVectorAdapter, mockVectorAdapter } from "@/lib/vector/adapters/mock-adapter";
export { ZvecVectorAdapter } from "@/lib/vector/adapters/zvec-adapter";
export { SupabasePgVectorAdapter } from "@/lib/vector/adapters/supabase-pgvector-adapter";
export { MilvusVectorAdapter } from "@/lib/vector/adapters/milvus-adapter";
export { mockEmbeddingProvider, MockEmbeddingProvider } from "@/lib/vector/embedding/mock-embedding";
export { VectorIndexService } from "@/lib/vector/index-service";
export { searchMarketplaceSemantic } from "@/lib/vector/marketplace-search";
export { searchMemorySemantic } from "@/lib/vector/memory-search";
export { VectorStore, getServerVectorStore } from "@/lib/vector/store";
export { seedVectorDocumentTemplates, MARKETPLACE_SAMPLE_QUERIES, MEMORY_SAMPLE_QUERIES } from "@/lib/vector/mock-documents";

/** Future: Zvec native + Supabase hydrate port. */
export type VectorWorkerPort = {
  rebuildCollection(name: import("@/lib/vector/types").VectorCollectionName): Promise<void>;
  embedAndUpsert(sourceType: string, sourceId: string): Promise<void>;
};
