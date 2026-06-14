import { mockVectorAdapter } from "@/lib/vector/adapters/mock-adapter";
import { VectorIndexService } from "@/lib/vector/index-service";
import { seedVectorDocumentTemplates } from "@/lib/vector/mock-documents";
import { mockEmbeddingProvider } from "@/lib/vector/embedding/mock-embedding";
import type { VectorDocument, VectorIndexJob } from "@/lib/vector/types";

const STORE_KEY = "ai-arena-vector-index";

export type VectorStoreData = {
  documents: VectorDocument[];
  jobs: VectorIndexJob[];
  initialized: boolean;
};

async function buildSeedDocuments(): Promise<VectorDocument[]> {
  const templates = seedVectorDocumentTemplates();
  const embedded: VectorDocument[] = [];
  for (const t of templates) {
    embedded.push({
      ...t,
      embedding: await mockEmbeddingProvider.embed(`${t.title} ${t.content}`),
    });
  }
  return embedded;
}

function emptyData(): VectorStoreData {
  return { documents: [], jobs: [], initialized: false };
}

export class VectorStore {
  private data: VectorStoreData;
  readonly service: VectorIndexService;

  constructor() {
    this.data = emptyData();
    this.service = new VectorIndexService(mockVectorAdapter, []);
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as VectorStoreData;
          if (parsed.documents?.length) {
            this.data = parsed;
            mockVectorAdapter.loadState(parsed.documents);
            this.service.setJobs(parsed.jobs ?? []);
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    } catch {
      /* quota */
    }
  }

  getData(): VectorStoreData {
    return JSON.parse(JSON.stringify(this.data)) as VectorStoreData;
  }

  async seedIfEmpty(): Promise<void> {
    if (this.data.initialized && this.data.documents.length > 0) return;
    const docs = await buildSeedDocuments();
    mockVectorAdapter.loadState(docs);
    this.data = { documents: docs, jobs: [], initialized: true };
    this.persist();
  }

  async rebuildIndex(): Promise<VectorIndexJob> {
    const job = await this.service.rebuildAll();
    this.data.documents = mockVectorAdapter.exportDocuments();
    this.data.jobs = this.service.getRecentJobs(20);
    this.data.initialized = true;
    this.persist();
    return job;
  }

  recordJob(job: VectorIndexJob): void {
    this.data.jobs = [job, ...this.data.jobs].slice(0, 20);
    this.persist();
  }
}

let _serverDocs: VectorDocument[] | null = null;

export async function getServerVectorDocuments(): Promise<VectorDocument[]> {
  if (!_serverDocs) {
    _serverDocs = await buildSeedDocuments();
  }
  return JSON.parse(JSON.stringify(_serverDocs)) as VectorDocument[];
}

export async function getServerVectorStore(): Promise<VectorStoreData> {
  const documents = await getServerVectorDocuments();
  return { documents, jobs: [], initialized: true };
}
