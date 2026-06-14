/** AI ARENA Tool Arena — types (mock-first, OpenTabs/MCP-ready). */

export type ToolProvider =
  | "github"
  | "discord"
  | "notion"
  | "jira"
  | "figma"
  | "supabase"
  | "browser"
  | "mock";

export type ToolCategory =
  | "devtools"
  | "communication"
  | "docs"
  | "design"
  | "project_mgmt"
  | "database"
  | "browser"
  | "other";

export type PermissionLevel = "off" | "ask" | "auto_read" | "auto_safe" | "auto_all";

export type AuthMethod = "browser_session" | "api_key" | "oauth" | "mock";

export type RiskLevel = "low" | "medium" | "high";

export type ToolActionKind = "read" | "write";

export type ToolCallStatus =
  | "pending"
  | "approved"
  | "denied"
  | "success"
  | "error"
  | "dry_run";

export type ToolArenaPhase =
  | "idle"
  | "planning"
  | "executing"
  | "awaiting_approval"
  | "verifying"
  | "scoring"
  | "complete";

export type ToolAction = {
  id: string;
  plugin_id: string;
  name: string;
  label: string;
  kind: ToolActionKind;
  risk_level: RiskLevel;
  destructive: boolean;
  description: string;
};

export type ToolPlugin = {
  id: string;
  name: string;
  provider: ToolProvider;
  category: ToolCategory;
  description: string;
  available_actions: string[];
  read_actions: string[];
  write_actions: string[];
  permission_level: PermissionLevel;
  risk_level: RiskLevel;
  auth_method: AuthMethod;
  enabled: boolean;
  last_used_at: string | null;
  audit_count: number;
};

export type ToolPermission = {
  id: string;
  plugin_id: string;
  mode: PermissionLevel;
  tournament_sandbox: boolean;
  workflow_version: string;
  updated_at: string;
};

export type ToolArenaChallenge = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  required_plugins: string[];
  required_actions: { plugin_id: string; action_name: string }[];
  success_criteria: string[];
  difficulty: "easy" | "medium" | "hard";
  sandbox_only: boolean;
};

export type ToolAgent = {
  id: string;
  name: string;
  role: "competitor" | "verification";
  specialty: string;
  description: string;
  accent: "cyan" | "violet" | "emerald" | "amber" | "rose";
  tool_usage_strategy: string;
  permission_behavior: "strict" | "balanced" | "aggressive";
  verification_behavior: "always" | "on_write" | "never";
  retry_policy: { max_retries: number; backoff_ms: number };
  risk_tolerance: RiskLevel;
  fallback_behavior: "skip_tool" | "mock_only" | "fail_run";
};

export type ToolAgentRun = {
  id: string;
  tournament_id: string;
  round: number;
  challenge_id: string;
  agent_id: string;
  agent_name: string;
  status: "running" | "awaiting_approval" | "complete" | "failed";
  plan_summary: string;
  tool_call_count: number;
  tokens_in: number;
  tokens_out: number;
  llm_cost_usd: number;
  tool_overhead_ms: number;
  started_at: string;
  completed_at: string | null;
};

export type ToolCallLog = {
  id: string;
  tournament_id: string;
  challenge_id: string;
  agent_run_id: string;
  agent_id: string;
  tool_plugin_id: string;
  action_name: string;
  input_json: Record<string, unknown>;
  output_json: Record<string, unknown>;
  status: ToolCallStatus;
  permission_mode: PermissionLevel;
  risk_level: RiskLevel;
  dry_run: boolean;
  latency_ms: number;
  error_message: string | null;
  created_at: string;
};

export type ToolExecutionResult = {
  id: string;
  agent_run_id: string;
  final_state: Record<string, unknown>;
  verification_passed: boolean;
  verification_notes: string;
  checks_passed: number;
  checks_total: number;
  artifacts: string[];
  created_at: string;
};

export type ToolArenaScore = {
  id: string;
  tournament_id: string;
  round: number;
  challenge_id: string;
  agent_id: string;
  agent_name: string;
  agent_run_id: string;
  task_success: number;
  tool_efficiency: number;
  reliability: number;
  cost_efficiency: number;
  safety_audit: number;
  total_score: number;
  rank: number;
  breakdown: Record<string, number>;
  created_at: string;
};

export type ToolWorkflowStack = {
  id: string;
  slug: string;
  name: string;
  description: string;
  plugin_ids: string[];
  action_sequence: string[];
  task_success_rate: number;
  avg_tool_calls: number;
  avg_latency_ms: number;
  avg_cost_usd: number;
  safety_score: number;
  tournament_tested: boolean;
  source_tournament_id: string | null;
  source_round: number | null;
};

export type ToolMarketplaceCandidate = {
  id: string;
  stack_id: string;
  slug: string;
  title: string;
  tournament_id: string;
  round: number;
  agent_id: string;
  agent_name: string;
  task_success_rate: number;
  avg_tool_calls: number;
  avg_latency_ms: number;
  avg_cost_usd: number;
  safety_score: number;
  compatible_tools: string[];
  required_permissions: PermissionLevel[];
  audit_examples: { action: string; status: ToolCallStatus; dry_run: boolean }[];
  status: "seed" | "review" | "listed";
  created_at: string;
};

export type ToolArenaState = {
  tournament_id: string;
  round: number;
  phase: ToolArenaPhase;
  dry_run: boolean;
  sandbox: boolean;
  selected_challenge_id: string | null;
  active_runs: ToolAgentRun[];
  call_logs: ToolCallLog[];
  execution_results: ToolExecutionResult[];
  scores: ToolArenaScore[];
  leaderboard: ToolArenaScore[];
  marketplace_candidates: ToolMarketplaceCandidate[];
  pending_approvals: string[];
  started_at: string | null;
  completed_at: string | null;
};

export type ToolArenaStoreData = {
  plugins: ToolPlugin[];
  permissions: ToolPermission[];
  challenges: ToolArenaChallenge[];
  stacks: ToolWorkflowStack[];
  state: ToolArenaState;
  audit_log: ToolCallLog[];
};

export const SCORE_WEIGHTS = {
  taskSuccess: 35,
  toolEfficiency: 20,
  reliability: 20,
  costEfficiency: 15,
  safetyAudit: 10,
  total: 100,
} as const;

export const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  off: "Off",
  ask: "Ask",
  auto_read: "Auto read",
  auto_safe: "Auto safe",
  auto_all: "Auto all",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  devtools: "DevTools",
  communication: "Communication",
  docs: "Docs",
  design: "Design",
  project_mgmt: "Project mgmt",
  database: "Database",
  browser: "Browser",
  other: "Other",
};
