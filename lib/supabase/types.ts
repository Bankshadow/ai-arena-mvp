export type SubmissionStatus = "pending" | "approved" | "rejected";

export type SubmissionRow = {
  id: string;
  challenge_id: string;
  name: string;
  email: string;
  role: string | null;
  prompt_used: string;
  model_used: string;
  estimated_cost: number;
  output_result: string;
  workflow_notes: string | null;
  quality_score: number | null;
  cost_score: number | null;
  final_score: number | null;
  status: SubmissionStatus;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type SubmissionInsert = {
  challenge_id?: string;
  name: string;
  email: string;
  role?: string | null;
  prompt_used: string;
  model_used: string;
  estimated_cost: number;
  output_result: string;
  workflow_notes?: string | null;
  status?: SubmissionStatus;
};

export type BattleRow = {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  pass_threshold: number;
  mode: string;
  winner_agent_id: string | null;
  winner_tokens: number | null;
  passed_count: number;
  payload: Record<string, unknown>;
  created_at: string;
};

export type TournamentRoundRow = {
  id: string;
  tournament_id: string;
  round: number;
  mode: string;
  phase: string;
  winner_agent_id: string | null;
  winner_score: number | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type MarketplaceListingRow = {
  id: string;
  slug: string;
  title: string;
  agent_id: string;
  agent_name: string;
  challenge_title: string;
  total_score: number;
  marketplace_score: number;
  suggested_price_usd: number;
  status: "seed" | "review" | "listed";
  workflow_steps: string[];
  prompt_template: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type AgentConstitutionRow = {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_type: "competitor" | "creator" | "judge" | "orchestrator";
  current_version: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AgentConstitutionVersionRow = {
  id: string;
  constitution_id: string;
  version: string;
  role_definition: string;
  primary_goal: string;
  secondary_goal: string;
  behavior_rules: string[];
  tool_usage_policy: string;
  model_provider_policy: string;
  cost_policy: string;
  token_policy: string;
  memory_policy: string;
  risk_policy: string;
  refusal_or_skip_rules: string[];
  output_format_contract: string;
  self_review_protocol: string;
  evaluation_preference: string;
  marketplace_positioning: string;
  constitution_score: number;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PromptDiffRow = {
  id: string;
  constitution_id: string;
  from_version: string;
  to_version: string;
  changes: Record<string, unknown>[];
  summary: string;
  computed_at: string;
};

export type ConstitutionBattleRow = {
  id: string;
  battle_type: "system_prompt_battle";
  title: string;
  agent_id: string;
  agent_name: string;
  challenge_title: string;
  challenge_brief: string;
  version_ids: string[];
  status: "pending" | "running" | "complete";
  payload: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
};

export type ConstitutionBattleResultRow = {
  id: string;
  battle_id: string;
  constitution_id: string | null;
  version_id: string | null;
  version: string;
  agent_name: string;
  total_score: number;
  quality_score: number;
  efficiency_score: number;
  constitution_score: number;
  tokens_out: number;
  cost_usd: number;
  rank: number;
  prompt_strategy_summary: string;
  payload: Record<string, unknown>;
  created_at: string;
};
