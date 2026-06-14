/** AI ARENA Evidence Research Layer — types (mock-first, vector-ready). */

export type KnowledgeSourceType =
  | "tournaments"
  | "challenges"
  | "agent_runs"
  | "evaluations"
  | "leaderboard_entries"
  | "marketplace_components"
  | "memory_articles"
  | "tool_call_logs"
  | "forecast_runs"
  | "uploaded_documents"
  | "external_web";

export type IndexingStatus = "pending" | "indexing" | "ready" | "stale" | "failed" | "disabled";

export type FreshnessPolicy = "realtime" | "hourly" | "daily" | "weekly" | "manual";

export type FreshnessStatus = "fresh" | "aging" | "stale" | "unknown";

export type PermissionLevel = "public" | "authenticated" | "admin" | "enterprise";

export type KnowledgeSource = {
  id: string;
  name: string;
  source_type: KnowledgeSourceType;
  description: string;
  permission_level: PermissionLevel;
  freshness_policy: FreshnessPolicy;
  reliability_score: number;
  indexing_status: IndexingStatus;
  vector_collection_name: string | null;
  record_count: number;
  last_indexed_at: string | null;
  freshness_status: FreshnessStatus;
  enabled: boolean;
};

export type IndexedDocument = {
  id: string;
  source_id: string;
  source_type: KnowledgeSourceType;
  source_record_id: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  indexed_at: string;
};

export type DocumentChunk = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  metadata: Record<string, unknown>;
};

export type ResearchQueryStatus = "pending" | "running" | "complete" | "failed";

export type ResearchQuery = {
  id: string;
  question: string;
  scope: string[];
  asked_by: "user" | "agent" | "system";
  status: ResearchQueryStatus;
  answer_summary: string | null;
  confidence_score: number | null;
  limitations: string[];
  follow_up_questions: string[];
  evidence_ids: string[];
  trace_id: string | null;
  report_id: string | null;
  created_at: string;
  completed_at: string | null;
};

export type ResearchAgentPhase =
  | "decomposing"
  | "selecting_sources"
  | "retrieving"
  | "evaluating"
  | "reasoning"
  | "reporting";

export type ResearchTraceStep = {
  id: string;
  step_index: number;
  phase: ResearchAgentPhase;
  action: string;
  input_summary: string;
  output_summary: string;
  evidence_ids: string[];
  duration_ms: number;
  created_at: string;
};

export type ResearchTrace = {
  id: string;
  query_id: string;
  agent_id: string;
  agent_name: string;
  status: "running" | "complete" | "failed";
  steps: ResearchTraceStep[];
  total_evidence_retrieved: number;
  total_evidence_used: number;
  started_at: string;
  completed_at: string | null;
};

export type EvidenceItem = {
  id: string;
  source_type: KnowledgeSourceType;
  source_id: string;
  title: string;
  summary: string;
  quote_or_excerpt: string;
  relevance_score: number;
  confidence_score: number;
  freshness_score: number;
  reliability_score: number;
  composite_score: number;
  retrieved_by_agent_id: string;
  used_in_report_id: string | null;
  deep_link: string;
  tags: string[];
  created_at: string;
};

export type EvidenceLink = {
  id: string;
  from_evidence_id: string;
  to_evidence_id: string;
  link_type: "supports" | "contradicts" | "extends" | "same_entity";
  strength: number;
  created_at: string;
};

export type ResearchReportKind =
  | "weekly_tournament_performance"
  | "best_agent_strategy"
  | "marketplace_opportunity"
  | "provider_cost_optimization"
  | "tool_arena_reliability"
  | "agent_constitution_improvement"
  | "forecast_risk"
  | "ad_hoc_query";

export type ResearchReportSectionKind =
  | "executive_summary"
  | "methodology"
  | "evidence_table"
  | "analysis"
  | "recommendations"
  | "limitations"
  | "final_recommendation";

export type ResearchReportSection = {
  id: string;
  report_id: string;
  kind: ResearchReportSectionKind;
  title: string;
  content: string;
  evidence_ids: string[];
  confidence: number;
  sort_order: number;
};

export type ResearchReport = {
  id: string;
  kind: ResearchReportKind;
  title: string;
  question: string;
  scope: string[];
  methodology: string;
  confidence_score: number;
  evidence_ids: string[];
  sections: ResearchReportSection[];
  limitations: string[];
  recommendations: string[];
  related_component_slugs: string[];
  generated_by_agent_id: string;
  trace_id: string | null;
  created_at: string;
};

export type ResearchBattleStatus = "preview" | "open" | "judging" | "complete";

export type ResearchBattle = {
  id: string;
  title: string;
  brief: string;
  research_question: string;
  status: ResearchBattleStatus;
  created_at: string;
};

export type ResearchBattleSubmission = {
  id: string;
  battle_id: string;
  agent_id: string;
  agent_name: string;
  report_id: string;
  evidence_count: number;
  submitted_at: string;
};

export type ResearchBattleScore = {
  submission_id: string;
  agent_id: string;
  agent_name: string;
  evidence_quality: number;
  reasoning_quality: number;
  completeness: number;
  traceability: number;
  cost_efficiency: number;
  report_structure: number;
  total_score: number;
  rank: number;
};

export type KnowledgeGap = {
  id: string;
  topic: string;
  description: string;
  suggested_sources: KnowledgeSourceType[];
  severity: "low" | "medium" | "high";
};

export type ResearchDashboardStats = {
  searchable_sources: number;
  indexed_records: number;
  evidence_items: number;
  research_reports: number;
  stale_sources: number;
  knowledge_gaps: number;
};

export type ResearchQueryResult = {
  query: ResearchQuery;
  trace: ResearchTrace;
  evidence: EvidenceItem[];
};

export const KNOWLEDGE_SOURCE_LABELS: Record<KnowledgeSourceType, string> = {
  tournaments: "Tournaments",
  challenges: "Challenges",
  agent_runs: "Agent runs",
  evaluations: "Evaluations",
  leaderboard_entries: "Leaderboard",
  marketplace_components: "Marketplace",
  memory_articles: "Memory articles",
  tool_call_logs: "Tool call logs",
  forecast_runs: "Forecast runs",
  uploaded_documents: "Uploaded documents",
  external_web: "External web",
};

export const REPORT_KIND_LABELS: Record<ResearchReportKind, string> = {
  weekly_tournament_performance: "Weekly Tournament Performance",
  best_agent_strategy: "Best Agent Strategy",
  marketplace_opportunity: "Marketplace Opportunity",
  provider_cost_optimization: "Provider Cost Optimization",
  tool_arena_reliability: "Tool Arena Reliability",
  agent_constitution_improvement: "Agent Constitution Improvement",
  forecast_risk: "Forecast Risk",
  ad_hoc_query: "Ad hoc query",
};
