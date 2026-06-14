import type { DocumentChunk, EvidenceItem, IndexedDocument, KnowledgeSourceType } from "@/lib/research/types";

export type RetrievalBackend = "mock" | "supabase_fts" | "pgvector" | "milvus" | "deep_searcher";

export type RetrievalQuery = {
  text: string;
  source_types?: KnowledgeSourceType[];
  top_k?: number;
  min_composite_score?: number;
};

export type RetrievalResult = {
  chunks: DocumentChunk[];
  evidence_candidates: EvidenceItem[];
  backend: RetrievalBackend;
  latency_ms: number;
};

export interface RetrievalAdapter {
  readonly backend: RetrievalBackend;
  search(query: RetrievalQuery, pool: EvidenceItem[]): Promise<RetrievalResult>;
  healthCheck(): Promise<{ ok: boolean; message: string }>;
}

export interface IndexingAdapter {
  readonly backend: RetrievalBackend;
  indexDocuments(docs: IndexedDocument[]): Promise<{ indexed: number }>;
}
