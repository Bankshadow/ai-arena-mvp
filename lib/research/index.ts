export * from "@/lib/research/types";
export { MOCK_KNOWLEDGE_SOURCES } from "@/lib/research/registry/sources";
export { seedResearchKnowledgeBase, SAMPLE_QUESTIONS } from "@/lib/research/mock-data";
export { runResearchQuery } from "@/lib/research/pipeline/research-agent";
export { buildReportTemplates, getReportById } from "@/lib/research/reports/templates";
export { ResearchStore, getServerResearchData, getServerReport } from "@/lib/research/store";
export { mockRetrievalAdapter } from "@/lib/research/retrieval/mock-adapter";
export type { RetrievalAdapter, IndexingAdapter } from "@/lib/research/retrieval/types";

/** Future: Supabase pgvector, Milvus, or DeepSearcher worker port. */
export type ResearchWorkerPort = {
  runQuery(question: string): Promise<import("@/lib/research/types").ResearchQueryResult>;
  indexSource(sourceId: string): Promise<{ indexed: number }>;
};
