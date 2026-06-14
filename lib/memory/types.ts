/** AI ARENA Tournament Memory Compiler — types (mock-first, LLM-ready). */

export type MemoryArticleType =
  | "agent_pattern"
  | "failure_mode"
  | "cost_insight"
  | "model_routing_insight"
  | "challenge_design_lesson"
  | "judge_bias"
  | "marketplace_opportunity"
  | "strategy_recommendation"
  | "constitution_change"
  | "benchmark_summary";

export type AgentLessonType =
  | "strength"
  | "weakness"
  | "failure_mode"
  | "cost_pattern"
  | "latency_pattern"
  | "prompt_pattern"
  | "model_provider_pattern"
  | "recommended_change";

export type MemoryEventPhase =
  | "tournament_started"
  | "challenge_generated"
  | "challenge_selected"
  | "agents_running"
  | "judging"
  | "leaderboard_updated"
  | "marketplace_seeded"
  | "tournament_completed"
  | "memory_extracted"
  | "memory_compiled";

export type TournamentMemoryEvent = {
  id: string;
  tournament_id: string;
  round: number;
  phase: MemoryEventPhase;
  message: string;
  agent_id?: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type MemoryLog = {
  id: string;
  tournament_id: string;
  round: number;
  log_date: string;
  title: string;
  summary: string;
  event_count: number;
  winner_agent_id: string | null;
  winner_score: number | null;
  challenge_title: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type MemoryArticle = {
  id: string;
  slug: string;
  article_type: MemoryArticleType;
  title: string;
  summary: string;
  body: string;
  confidence: number;
  tags: string[];
  agent_ids: string[];
  tournament_id: string;
  round: number;
  evidence_ids: string[];
  source_compile_run_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MemoryArticleLink = {
  id: string;
  from_article_id: string;
  to_article_id: string;
  link_type: "supports" | "contradicts" | "extends" | "evidence_for";
  created_at: string;
};

export type AgentLesson = {
  id: string;
  agent_id: string;
  agent_name: string;
  lesson_type: AgentLessonType;
  title: string;
  content: string;
  confidence: number;
  tournament_id: string;
  round: number;
  article_id: string | null;
  stale: boolean;
  created_at: string;
  updated_at: string;
};

export type StrategyRecommendation = {
  id: string;
  title: string;
  recommendation: string;
  rationale: string;
  priority: "low" | "medium" | "high";
  agent_id: string | null;
  article_id: string | null;
  tournament_id: string;
  created_at: string;
};

export type ConstitutionUpdateProposal = {
  id: string;
  agent_id: string;
  agent_name: string;
  constitution_id: string;
  current_version: string;
  proposed_version: string;
  field_changes: { field: string; before: string; after: string; rationale: string }[];
  status: "draft" | "pending_review" | "approved" | "rejected";
  confidence: number;
  article_id: string | null;
  tournament_id: string;
  round: number;
  created_at: string;
};

export type KnowledgeCompileRun = {
  id: string;
  tournament_id: string;
  round: number;
  status: "running" | "complete" | "failed";
  articles_created: number;
  lessons_updated: number;
  proposals_generated: number;
  evidence_notes_created: number;
  started_at: string;
  completed_at: string | null;
  error: string | null;
};

export type MemoryLintIssue = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  entity_type: string;
  entity_id: string;
};

export type MemoryLintReport = {
  id: string;
  run_at: string;
  health_score: number;
  issues: MemoryLintIssue[];
  summary: string;
};

export type MarketplaceEvidenceNote = {
  id: string;
  marketplace_candidate_id: string;
  component_id: string | null;
  tournament_id: string;
  round: number;
  note: string;
  evidence_article_ids: string[];
  confidence: number;
  created_at: string;
};

export type ExtractedLesson = {
  key: string;
  article_type: MemoryArticleType;
  title: string;
  summary: string;
  body: string;
  confidence: number;
  tags: string[];
  agent_ids: string[];
  lesson_types: AgentLessonType[];
};

export type MemoryQueryResult = {
  query: string;
  answer: string;
  matched_articles: MemoryArticle[];
  matched_lessons: AgentLesson[];
  confidence: number;
};

export type TournamentMemoryMeta = {
  last_compile_run_id: string | null;
  last_log_id: string | null;
  articles_created: number;
  lessons_updated: number;
  proposals_pending: number;
  compiled_at: string | null;
};

export const ARTICLE_TYPE_LABELS: Record<MemoryArticleType, string> = {
  agent_pattern: "Agent Pattern",
  failure_mode: "Failure Mode",
  cost_insight: "Cost Insight",
  model_routing_insight: "Model Routing",
  challenge_design_lesson: "Challenge Design",
  judge_bias: "Judge Bias",
  marketplace_opportunity: "Marketplace Opportunity",
  strategy_recommendation: "Strategy",
  constitution_change: "Constitution Change",
  benchmark_summary: "Benchmark Summary",
};

export const LESSON_TYPE_LABELS: Record<AgentLessonType, string> = {
  strength: "Strength",
  weakness: "Weakness",
  failure_mode: "Failure Mode",
  cost_pattern: "Cost Pattern",
  latency_pattern: "Latency Pattern",
  prompt_pattern: "Prompt Pattern",
  model_provider_pattern: "Provider Pattern",
  recommended_change: "Recommended Change",
};
