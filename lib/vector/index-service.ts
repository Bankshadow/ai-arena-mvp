import { newId } from "@/lib/tournament/engine-mock";
import { mockVectorAdapter, MockVectorAdapter } from "@/lib/vector/adapters/mock-adapter";
import type { VectorMemoryAdapter } from "@/lib/vector/adapter";
import { mockEmbeddingProvider } from "@/lib/vector/embedding/mock-embedding";
import { seedVectorDocumentTemplates } from "@/lib/vector/mock-documents";
import type {
  VectorCollection,
  VectorDocument,
  VectorIndexJob,
  VectorSearchQuery,
  VectorSearchResult,
} from "@/lib/vector/types";
import { ALL_VECTOR_COLLECTIONS, VECTOR_COLLECTION_LABELS } from "@/lib/vector/types";

export class VectorIndexService {
  constructor(
    private adapter: VectorMemoryAdapter = mockVectorAdapter,
    private jobs: VectorIndexJob[] = [],
  ) {}

  getAdapter(): VectorMemoryAdapter {
    return this.adapter;
  }

  async initialize(docs?: VectorDocument[]): Promise<VectorDocument[]> {
    const templates = docs ?? (await this.embedTemplates());
    if (this.adapter instanceof MockVectorAdapter) {
      this.adapter.loadState(templates);
    } else {
      for (const col of ALL_VECTOR_COLLECTIONS) {
        await this.adapter.createCollection(col, mockEmbeddingProvider.dimension);
      }
      await this.adapter.upsertDocuments(templates);
    }
    return templates;
  }

  async embedTemplates(): Promise<VectorDocument[]> {
    const templates = seedVectorDocumentTemplates();
    const embedded: VectorDocument[] = [];
    for (const t of templates) {
      const embedding = await mockEmbeddingProvider.embed(`${t.title} ${t.content}`);
      embedded.push({ ...t, embedding });
    }
    return embedded;
  }

  exportDocuments(): VectorDocument[] {
    if (this.adapter instanceof MockVectorAdapter) {
      return this.adapter.exportDocuments();
    }
    return [];
  }

  loadDocuments(docs: VectorDocument[]): void {
    if (this.adapter instanceof MockVectorAdapter) {
      this.adapter.loadState(docs);
    }
  }

  async search(query: VectorSearchQuery): Promise<VectorSearchResult> {
    const start = Date.now();
    const embedding = await mockEmbeddingProvider.embed(query.text);
    const hits = await this.adapter.searchSimilar({
      ...query,
      query_embedding: embedding,
      collections: query.collections ?? ALL_VECTOR_COLLECTIONS,
      top_k: query.top_k ?? 10,
      min_score: query.min_score ?? 0.2,
    });
    return {
      query: query.text,
      hits,
      backend: this.adapter.backend,
      latency_ms: Date.now() - start,
      collections_searched: query.collections ?? ALL_VECTOR_COLLECTIONS,
    };
  }

  async getAllCollections(): Promise<VectorCollection[]> {
    const cols: VectorCollection[] = [];
    for (const name of ALL_VECTOR_COLLECTIONS) {
      const stats = await this.adapter.getCollectionStats(name);
      cols.push({
        name,
        label: VECTOR_COLLECTION_LABELS[name],
        description: `Vector index for ${VECTOR_COLLECTION_LABELS[name].toLowerCase()}`,
        document_count: stats.document_count,
        dimension: stats.dimension,
        last_indexed_at: stats.last_indexed_at,
        health: stats.health,
        backend: stats.backend,
      });
    }
    return cols;
  }

  async rebuildAll(): Promise<VectorIndexJob> {
    const job = this.startJob("all", "rebuild");
    try {
      const docs = await this.embedTemplates();
      let total = 0;
      for (const col of ALL_VECTOR_COLLECTIONS) {
        const r = await this.adapter.rebuildIndex(col, docs);
        total += r.indexed;
      }
      this.completeJob(job, total, "Rebuild complete (mock)");
    } catch (e) {
      this.failJob(job, e instanceof Error ? e.message : "Rebuild failed");
    }
    return job;
  }

  async rebuildCollection(name: import("@/lib/vector/types").VectorCollectionName): Promise<VectorIndexJob> {
    const job = this.startJob(name, "rebuild");
    try {
      const docs = await this.embedTemplates();
      const r = await this.adapter.rebuildIndex(name, docs);
      this.completeJob(job, r.indexed, `Rebuilt ${name}`);
    } catch (e) {
      this.failJob(job, e instanceof Error ? e.message : "Rebuild failed");
    }
    return job;
  }

  getRecentJobs(limit = 5): VectorIndexJob[] {
    return this.jobs.slice(0, limit);
  }

  setJobs(jobs: VectorIndexJob[]): void {
    this.jobs = jobs;
  }

  private startJob(
    collection: VectorIndexJob["collection"],
    action: VectorIndexJob["action"],
  ): VectorIndexJob {
    const job: VectorIndexJob = {
      id: newId(),
      collection,
      action,
      status: "running",
      documents_processed: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      message: "Running…",
    };
    this.jobs = [job, ...this.jobs].slice(0, 20);
    return job;
  }

  private completeJob(job: VectorIndexJob, count: number, message: string): void {
    job.status = "complete";
    job.documents_processed = count;
    job.completed_at = new Date().toISOString();
    job.message = message;
  }

  private failJob(job: VectorIndexJob, message: string): void {
    job.status = "failed";
    job.completed_at = new Date().toISOString();
    job.message = message;
  }
}
