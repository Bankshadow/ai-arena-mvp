import { cosineSimilarity } from "@/lib/vector/cosine";
import type { VectorMemoryAdapter } from "@/lib/vector/adapter";
import type {
  VectorCollectionName,
  VectorCollectionStats,
  VectorDocument,
  VectorSearchHit,
  VectorSearchQuery,
} from "@/lib/vector/types";
import { ALL_VECTOR_COLLECTIONS } from "@/lib/vector/types";

const NOW = "2026-06-14T12:00:00.000Z";

type CollectionState = {
  dimension: number;
  documents: Map<string, VectorDocument>;
  last_indexed_at: string | null;
};

export class MockVectorAdapter implements VectorMemoryAdapter {
  readonly backend = "mock" as const;
  private collections = new Map<VectorCollectionName, CollectionState>();

  private getOrCreate(name: VectorCollectionName, dimension = 384): CollectionState {
    let state = this.collections.get(name);
    if (!state) {
      state = { dimension, documents: new Map(), last_indexed_at: null };
      this.collections.set(name, state);
    }
    return state;
  }

  loadState(docs: VectorDocument[]): void {
    this.collections.clear();
    for (const doc of docs) {
      const state = this.getOrCreate(doc.collection, doc.embedding.length);
      state.documents.set(doc.id, doc);
      state.last_indexed_at = doc.updated_at;
    }
  }

  exportDocuments(): VectorDocument[] {
    const all: VectorDocument[] = [];
    for (const state of this.collections.values()) {
      all.push(...state.documents.values());
    }
    return all;
  }

  async createCollection(name: VectorCollectionName, dimension: number): Promise<void> {
    this.getOrCreate(name, dimension);
  }

  async upsertDocument(doc: VectorDocument): Promise<void> {
    const state = this.getOrCreate(doc.collection, doc.embedding.length);
    state.documents.set(doc.id, { ...doc, updated_at: new Date().toISOString() });
    state.last_indexed_at = new Date().toISOString();
  }

  async upsertDocuments(docs: VectorDocument[]): Promise<void> {
    for (const doc of docs) await this.upsertDocument(doc);
  }

  async searchSimilar(
    query: VectorSearchQuery & { query_embedding: number[] },
  ): Promise<VectorSearchHit[]> {
    const collections = query.collections ?? ALL_VECTOR_COLLECTIONS;
    const topK = query.top_k ?? 10;
    const minScore = query.min_score ?? 0.25;
    const hits: VectorSearchHit[] = [];

    for (const col of collections) {
      const state = this.collections.get(col);
      if (!state) continue;
      for (const doc of state.documents.values()) {
        if (query.filter) {
          const ok = Object.entries(query.filter).every(
            ([k, v]) => doc.metadata[k] === v || doc.source_type === v,
          );
          if (!ok && query.filter.source_type && doc.source_type !== query.filter.source_type) continue;
        }
        const score = cosineSimilarity(query.query_embedding, doc.embedding);
        if (score >= minScore) hits.push({ document: doc, similarity_score: score });
      }
    }

    return hits.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, topK);
  }

  async deleteDocument(collection: VectorCollectionName, id: string): Promise<void> {
    this.collections.get(collection)?.documents.delete(id);
  }

  async getCollectionStats(collection: VectorCollectionName): Promise<VectorCollectionStats> {
    const state = this.collections.get(collection);
    const count = state?.documents.size ?? 0;
    return {
      collection,
      document_count: count,
      dimension: state?.dimension ?? 384,
      last_indexed_at: state?.last_indexed_at ?? null,
      health: count === 0 ? "empty" : count < 2 ? "degraded" : "healthy",
      backend: "mock",
    };
  }

  async rebuildIndex(collection: VectorCollectionName, docs: VectorDocument[]): Promise<{ indexed: number }> {
    const filtered = docs.filter((d) => d.collection === collection);
    await this.clearCollection(collection);
    await this.upsertDocuments(filtered);
    return { indexed: filtered.length };
  }

  async clearCollection(collection: VectorCollectionName): Promise<void> {
    const state = this.getOrCreate(collection);
    state.documents.clear();
    state.last_indexed_at = NOW;
  }

  async healthCheck(): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: "MockVectorAdapter ready — in-memory cosine search" };
  }
}

export const mockVectorAdapter = new MockVectorAdapter();
