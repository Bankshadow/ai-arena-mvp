/** AI ARENA Vector Memory Layer — types (mock-first, Zvec/pgvector/Milvus-ready). */

export type VectorBackend = "mock" | "zvec" | "pgvector" | "milvus";

export type VectorCollectionName =
  | "agent_memory_vectors"
  | "tournament_memory_vectors"
  | "marketplace_component_vectors"
  | "research_evidence_vectors"
  | "constitution_vectors"
  | "judge_rubric_vectors"
  | "tool_stack_vectors"
  | "forecast_insight_vectors";

export type VectorSourceType =
  | "agent_memory"
  | "agent_lesson"
  | "tournament_memory"
  | "memory_article"
  | "marketplace_component"
  | "research_evidence"
  | "constitution"
  | "judge_rubric"
  | "tool_stack"
  | "forecast_insight"
  | "challenge"
  | "evaluation";

export type VectorIndexHealth = "healthy" | "degraded" | "empty" | "rebuilding";

export type VectorCollection = {
  name: VectorCollectionName;
  label: string;
  description: string;
  document_count: number;
  dimension: number;
  last_indexed_at: string | null;
  health: VectorIndexHealth;
  backend: VectorBackend;
};

export type VectorDocument = {
  id: string;
  collection: VectorCollectionName;
  source_type: VectorSourceType;
  source_id: string;
  title: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  tags: string[];
  confidence_score: number;
  deep_link: string;
  recommended_action: string | null;
  created_at: string;
  updated_at: string;
};

export type VectorSearchQuery = {
  text: string;
  collections?: VectorCollectionName[];
  top_k?: number;
  min_score?: number;
  filter?: Record<string, unknown>;
};

export type VectorSearchHit = {
  document: VectorDocument;
  similarity_score: number;
};

export type VectorSearchResult = {
  query: string;
  hits: VectorSearchHit[];
  backend: VectorBackend;
  latency_ms: number;
  collections_searched: VectorCollectionName[];
};

export type VectorCollectionStats = {
  collection: VectorCollectionName;
  document_count: number;
  dimension: number;
  last_indexed_at: string | null;
  health: VectorIndexHealth;
  backend: VectorBackend;
};

export type VectorIndexJobStatus = "pending" | "running" | "complete" | "failed";

export type VectorIndexJob = {
  id: string;
  collection: VectorCollectionName | "all";
  action: "rebuild" | "upsert" | "clear";
  status: VectorIndexJobStatus;
  documents_processed: number;
  started_at: string;
  completed_at: string | null;
  message: string;
};

export type MemorySemanticSearchResult = VectorSearchResult & {
  hits: (VectorSearchHit & { recommended_action: string | null })[];
};

export type MarketplaceSemanticHit = {
  component_id: string;
  slug: string;
  title: string;
  similarity_score: number;
  battle_score: number;
  win_rate: number;
  avg_cost_usd: number;
  evidence_links: string[];
  recommended_stack_additions: string[];
};

export type MarketplaceSemanticSearchResult = {
  query: string;
  hits: MarketplaceSemanticHit[];
  backend: VectorBackend;
  latency_ms: number;
};

export const VECTOR_COLLECTION_LABELS: Record<VectorCollectionName, string> = {
  agent_memory_vectors: "Agent memory",
  tournament_memory_vectors: "Tournament memory",
  marketplace_component_vectors: "Marketplace components",
  research_evidence_vectors: "Research evidence",
  constitution_vectors: "Agent constitutions",
  judge_rubric_vectors: "Judge rubrics",
  tool_stack_vectors: "Tool stacks",
  forecast_insight_vectors: "Forecast insights",
};

export const VECTOR_SOURCE_LABELS: Record<VectorSourceType, string> = {
  agent_memory: "Agent memory",
  agent_lesson: "Agent lesson",
  tournament_memory: "Tournament memory",
  memory_article: "Memory article",
  marketplace_component: "Marketplace component",
  research_evidence: "Research evidence",
  constitution: "Constitution",
  judge_rubric: "Judge rubric",
  tool_stack: "Tool stack",
  forecast_insight: "Forecast insight",
  challenge: "Challenge",
  evaluation: "Evaluation",
};

export const ALL_VECTOR_COLLECTIONS: VectorCollectionName[] = [
  "agent_memory_vectors",
  "tournament_memory_vectors",
  "marketplace_component_vectors",
  "research_evidence_vectors",
  "constitution_vectors",
  "judge_rubric_vectors",
  "tool_stack_vectors",
  "forecast_insight_vectors",
];

export const MEMORY_SEARCH_COLLECTIONS: VectorCollectionName[] = [
  "agent_memory_vectors",
  "tournament_memory_vectors",
  "research_evidence_vectors",
  "marketplace_component_vectors",
  "constitution_vectors",
];
