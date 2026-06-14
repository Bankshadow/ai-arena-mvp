/** AI ARENA Forecasting Intelligence Layer — types (mock-first, worker-ready). */

export type ForecastTarget =
  | "token_usage"
  | "llm_cost"
  | "provider_usage"
  | "agent_win_rate"
  | "agent_score"
  | "latency"
  | "tournament_volume"
  | "marketplace_candidate_creation"
  | "rate_limit_risk";

export type ForecastModelKind = "mock_ema" | "mock_seasonal" | "python_worker" | "supabase_ml";

export type ForecastModel = {
  id: string;
  kind: ForecastModelKind;
  name: string;
  version: string;
  horizon_hours: number;
  confidence_default: number;
  enabled: boolean;
};

export type ForecastPoint = {
  timestamp: string;
  actual: number | null;
  predicted: number;
  lower: number;
  upper: number;
};

export type ForecastExplanation = {
  id: string;
  target: ForecastTarget;
  summary: string;
  factors: string[];
  confidence: number;
};

export type ForecastRun = {
  id: string;
  model_id: string;
  target: ForecastTarget;
  started_at: string;
  completed_at: string;
  horizon_hours: number;
  points: ForecastPoint[];
  explanation: ForecastExplanation;
  status: "complete" | "running" | "failed";
};

export type AnomalySeverity = "info" | "warning" | "critical";

export type AnomalyRule = {
  id: string;
  code: string;
  target: ForecastTarget;
  label: string;
  threshold_description: string;
  enabled: boolean;
};

export type AnomalyEvent = {
  id: string;
  rule_id: string;
  code: string;
  severity: AnomalySeverity;
  title: string;
  message: string;
  target: ForecastTarget;
  detected_at: string;
  value: number;
  baseline: number;
  delta_pct: number;
};

export type AgentForecastProfile = {
  agent_id: string;
  agent_name: string;
  current_win_rate: number;
  forecast_win_rate: number;
  current_avg_score: number;
  forecast_avg_score: number;
  confidence: number;
  trend: "rising" | "stable" | "declining";
  token_efficiency_rank: number;
};

export type ForecastingBattle = {
  id: string;
  title: string;
  brief: string;
  horizon_days: number;
  targets: ForecastTarget[];
  status: "preview" | "running" | "complete";
  created_at: string;
};

export type ForecastingBattleSubmission = {
  id: string;
  battle_id: string;
  agent_id: string;
  agent_name: string;
  predicted_cost_usd: number;
  predicted_tokens: number;
  methodology: string;
  submitted_at: string;
};

export type ForecastingBattleScore = {
  submission_id: string;
  agent_id: string;
  agent_name: string;
  accuracy_score: number;
  calibration_score: number;
  explanation_score: number;
  total_score: number;
  rank: number;
};

export type ProviderUsageForecast = {
  provider: "groq" | "anthropic" | "openai" | "mock";
  current_pct: number;
  forecast_pct: number;
  rate_limit_risk: number;
  recommended_action: string;
};

export type ForecastSummary = {
  next_24h_tokens: number;
  next_24h_cost_usd: number;
  top_rising_agent: AgentForecastProfile;
  highest_risk_provider: ProviderUsageForecast;
  marketplace_candidates_forecast: number;
  monthly_cost_projection_usd: number;
  cost_spike_risk: number;
};

export type RecommendedAction = {
  id: string;
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  action_type: string;
  related_target: ForecastTarget;
};

export type ForecastingDashboard = {
  generated_at: string;
  model: ForecastModel;
  summary: ForecastSummary;
  token_forecast: ForecastRun;
  cost_forecast: ForecastRun;
  agent_profiles: AgentForecastProfile[];
  provider_forecasts: ProviderUsageForecast[];
  anomalies: AnomalyEvent[];
  recommendations: RecommendedAction[];
  battle: ForecastingBattle;
  battle_submissions: ForecastingBattleSubmission[];
  battle_scores: ForecastingBattleScore[];
};

export const FORECAST_TARGET_LABELS: Record<ForecastTarget, string> = {
  token_usage: "Token usage",
  llm_cost: "LLM cost",
  provider_usage: "Provider usage",
  agent_win_rate: "Agent win rate",
  agent_score: "Agent score",
  latency: "Latency",
  tournament_volume: "Tournament volume",
  marketplace_candidate_creation: "Marketplace candidates",
  rate_limit_risk: "Rate limit risk",
};
