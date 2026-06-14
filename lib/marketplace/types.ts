/** Tournament-tested workflow marketplace — component catalog types. */

export type ComponentType =
  | "agent_constitution"
  | "workflow_template"
  | "judge_rubric"
  | "challenge_template"
  | "model_router"
  | "cost_policy"
  | "evaluation_hook"
  | "mcp_integration"
  | "benchmark_report"
  | "tournament_pack"
  | "prompt_template"
  | "storage_hook"
  | "setup_pack";

export type ComponentStatus = "draft" | "candidate" | "review" | "published" | "deprecated";

/** Public proof lifecycle badge shown on marketplace cards. */
export type ComponentProofStatus =
  | "draft"
  | "tested"
  | "battle_tested"
  | "winner"
  | "enterprise_ready";

export const PROOF_STATUS_LABELS: Record<ComponentProofStatus, string> = {
  draft: "Draft",
  tested: "Tested",
  battle_tested: "Battle-tested",
  winner: "Winner",
  enterprise_ready: "Enterprise-ready",
};

export const PROOF_STATUS_COLORS: Record<ComponentProofStatus, string> = {
  draft: "zinc",
  tested: "cyan",
  battle_tested: "emerald",
  winner: "amber",
  enterprise_ready: "violet",
};

export type ProviderId = "groq" | "anthropic" | "openai" | "mock";

export type IdeTarget = "cursor" | "claude-code" | "generic";

export type ComponentPerformanceProof = {
  win_rate: number;
  avg_score: number;
  avg_cost_usd: number;
  avg_tokens: number;
  avg_latency_ms: number;
  best_category: string;
  worst_category: string;
  tournament_runs: number;
  benchmark_history: { round: number; score: number; cost: number }[];
  recommended_use_cases: string[];
  last_tournament_at: string;
};

export type TournamentEvidence = {
  id: string;
  tournament_id: string;
  round: number;
  challenge_title: string;
  agent_name?: string;
  score: number;
  cost_usd: number;
  tokens: number;
  latency_ms: number;
  passed: boolean;
  recorded_at: string;
};

export type JudgeNote = {
  id: string;
  dimension: string;
  note: string;
  score_delta?: number;
};

export type ArenaScoreBreakdown = {
  total: number;
  battle: number;
  cost_efficiency: number;
  reliability: number;
  reusability: number;
  enterprise_readiness: number;
  popularity: number;
  freshness: number;
  compatibility: number;
};

export type MarketplaceComponent = {
  id: string;
  slug: string;
  type: ComponentType;
  title: string;
  description: string;
  author: "tournament" | "admin" | "community";
  version: string;
  tags: string[];
  categories: string[];
  compatible_providers: ProviderId[];
  compatible_ides: IdeTarget[];
  source_tournament_id?: string;
  source_round?: number;
  status: ComponentStatus;
  proof: ComponentPerformanceProof;
  arena_score: ArenaScoreBreakdown;
  tournament_tested: boolean;
  proof_status: ComponentProofStatus;
  known_weakness: string;
  best_use_case: string;
  evidence_count: number;
  evidence: TournamentEvidence[];
  judge_notes: JudgeNote[];
  failure_cases: string[];
  compatible_stack_component_ids: string[];
  payload_preview: string;
  install_notes: string;
  usage_examples: string[];
  suggested_price_usd: number;
  created_at: string;
  updated_at: string;
};

/** Review workflow — tournament detect → admin publish → component catalog. */
export type CandidateStatus =
  | "detected"
  | "draft"
  | "review_needed"
  | "approved"
  | "published"
  | "archived";

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  detected: "Detected",
  draft: "Draft",
  review_needed: "Review needed",
  approved: "Approved",
  published: "Published",
  archived: "Archived",
};

export type MarketplaceCandidateRecord = {
  id: string;
  dedup_key: string;
  component_type: ComponentType;
  challenge_category: string;
  winning_agent: string;
  strategy_hash: string;
  title: string;
  description: string;
  tournament_id: string;
  source_round: number;
  agent_id?: string;
  agent_name?: string;
  challenge_title?: string;
  total_score: number;
  marketplace_score: number;
  status: CandidateStatus;
  tested_runs: number;
  avg_score: number;
  avg_cost: number;
  avg_tokens: number;
  avg_latency: number;
  evidence: TournamentEvidence[];
  judge_notes: JudgeNote[];
  proof: ComponentPerformanceProof;
  arena_score: ArenaScoreBreakdown;
  component_id?: string;
  payload: Record<string, unknown>;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};

export type CandidateUpsertResult = {
  record: MarketplaceCandidateRecord;
  created: boolean;
  updated: boolean;
};

/** @deprecated UI compat — map from MarketplaceCandidateRecord */
export type MarketplaceCandidateV2 = {
  id: string;
  component_id: string;
  slug: string;
  type: ComponentType;
  title: string;
  tournament_id: string;
  round: number;
  agent_id?: string;
  agent_name?: string;
  challenge_title?: string;
  total_score: number;
  marketplace_score: number;
  proof: ComponentPerformanceProof;
  arena_score: ArenaScoreBreakdown;
  status: "seed" | "review" | "listed";
  candidate_status?: CandidateStatus;
  tested_runs?: number;
  evidence?: TournamentEvidence[];
  created_at: string;
};

export type ComponentSortKey =
  | "arena_score"
  | "cost_efficiency"
  | "freshness"
  | "popularity"
  | "avg_score";

export type ComponentFilters = {
  type?: ComponentType;
  category?: string;
  min_arena_score?: number;
  max_avg_cost?: number;
  provider?: ProviderId;
  tournament_tested_only?: boolean;
  search?: string;
};

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  agent_constitution: "Agent Constitution",
  workflow_template: "Workflow Template",
  judge_rubric: "Judge Rubric",
  challenge_template: "Challenge Template",
  model_router: "Model Router",
  cost_policy: "Cost Policy",
  evaluation_hook: "Evaluation Hook",
  mcp_integration: "MCP Integration",
  benchmark_report: "Benchmark Report",
  tournament_pack: "Tournament Pack",
  prompt_template: "Prompt Template",
  storage_hook: "Storage Hook",
  setup_pack: "Setup Pack",
};

export const COMPONENT_TYPE_COLORS: Record<ComponentType, string> = {
  agent_constitution: "violet",
  workflow_template: "cyan",
  judge_rubric: "amber",
  challenge_template: "rose",
  model_router: "cyan",
  cost_policy: "emerald",
  evaluation_hook: "amber",
  mcp_integration: "violet",
  benchmark_report: "violet",
  tournament_pack: "rose",
  prompt_template: "zinc",
  storage_hook: "emerald",
  setup_pack: "cyan",
};

export type StackComponentRole =
  | "agent"
  | "judge"
  | "challenge"
  | "router"
  | "hook"
  | "setup"
  | "policy"
  | "report";

export type StackComponentEntry = {
  component_id: string;
  component_version: string;
  role_in_stack: StackComponentRole;
  order: number;
};

export type CompatibilityWarning = {
  severity: "info" | "warning" | "error";
  message: string;
  component_ids: string[];
};

export type WorkflowStack = {
  id: string;
  slug: string;
  name: string;
  description: string;
  components: StackComponentEntry[];
  estimated_cost_usd: number;
  estimated_quality_score: number;
  compatibility_warnings: CompatibilityWarning[];
  visibility: "private" | "public";
  created_at: string;
  updated_at: string;
};

export type StackExportFormat =
  | "json"
  | "markdown"
  | "cursor"
  | "claude-code"
  | "supabase-snippet"
  | "api-plan";
