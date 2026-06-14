/** AI ARENA Trading Strategy Arena — types (mock-first, Lean-ready). */

export type AssetClass = "equity" | "crypto" | "fx" | "options" | "multi_asset";

export type TradingChallengeStatus = "draft" | "open" | "running" | "judging" | "complete";

export type TradingStrategySpec = {
  title: string;
  thesis: string;
  asset_class: AssetClass;
  universe: string[];
  timeframe: string;
  resolution: "minute" | "hour" | "daily";
  entry_rules: string[];
  exit_rules: string[];
  position_sizing: string;
  risk_management: string[];
  rebalance_frequency: string;
  benchmark: string;
  parameters: Record<string, number | string | boolean>;
  assumptions: string[];
  failure_modes: string[];
};

export type TradingChallenge = {
  id: string;
  tournament_id: string | null;
  round: number | null;
  title: string;
  brief: string;
  asset_class: AssetClass;
  universe: string[];
  benchmark: string;
  start_date: string;
  end_date: string;
  resolution: "minute" | "hour" | "daily";
  constraints: {
    max_drawdown_pct: number;
    max_leverage: number;
    max_turnover_annual: number;
  };
  status: TradingChallengeStatus;
  created_at: string;
};

export type StrategyAgentRole =
  | "market_thesis"
  | "strategy_architect"
  | "lean_code"
  | "backtest_runner"
  | "result_parser"
  | "risk_judge"
  | "performance_judge"
  | "robustness_judge";

export type StrategyAgent = {
  id: string;
  role: StrategyAgentRole;
  name: string;
  description: string;
};

export type TradingStrategyStatus = "draft" | "coded" | "backtested" | "judged" | "marketplace_candidate";

export type TradingStrategy = {
  id: string;
  challenge_id: string;
  agent_id: string;
  agent_name: string;
  spec: TradingStrategySpec;
  language: "python" | "csharp";
  lean_code: string;
  lean_valid: boolean;
  status: TradingStrategyStatus;
  thesis_summary: string;
  created_at: string;
  updated_at: string;
};

export type LeanBacktestStatus = "queued" | "running" | "complete" | "failed" | "mock";

export type LeanBacktest = {
  id: string;
  strategy_id: string;
  runner: "mock" | "lean_cli" | "lean_docker";
  status: LeanBacktestStatus;
  simulated: boolean;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
};

export type BacktestMetrics = {
  id: string;
  backtest_id: string;
  strategy_id: string;
  total_return: number;
  cagr: number;
  sharpe: number;
  sortino: number;
  max_drawdown: number;
  volatility: number;
  win_rate: number;
  profit_factor: number;
  turnover: number;
  fees: number;
  slippage: number;
  alpha: number;
  beta: number;
  benchmark_return: number;
  trade_count: number;
};

export type StrategyPenaltyCode =
  | "data_leakage"
  | "unrealistic_assumptions"
  | "overfitting_risk"
  | "excessive_drawdown"
  | "invalid_lean_code"
  | "excessive_turnover";

export type StrategyScoreBreakdown = {
  performance: number;
  risk: number;
  robustness: number;
  implementation: number;
  cost: number;
  penalties: number;
  total: number;
};

export type StrategyScore = {
  id: string;
  strategy_id: string;
  backtest_id: string;
  agent_id: string;
  agent_name: string;
  breakdown: StrategyScoreBreakdown;
  penalties: StrategyPenaltyCode[];
  rank: number | null;
  judged_at: string;
};

export type StrategyRiskReview = {
  id: string;
  strategy_id: string;
  backtest_id: string;
  max_drawdown_ok: boolean;
  leverage_ok: boolean;
  tail_risk_score: number;
  exit_discipline_score: number;
  summary: string;
  findings: string[];
};

export type StrategyArtifactKind =
  | "lean_source"
  | "backtest_log"
  | "equity_curve_json"
  | "judge_report";

export type StrategyArtifact = {
  id: string;
  strategy_id: string;
  backtest_id: string | null;
  kind: StrategyArtifactKind;
  label: string;
  content: string;
};

export type StrategyMarketplaceCandidate = {
  id: string;
  strategy_id: string;
  listing_slug: string;
  title: string;
  arena_score: number;
  sharpe: number;
  max_drawdown: number;
  backtest_evidence_summary: string;
  status: "candidate" | "review" | "published";
};

export type TradingArenaPhase =
  | "idle"
  | "thesis"
  | "architecting"
  | "coding"
  | "backtesting"
  | "parsing"
  | "judging"
  | "complete";

export type TradingArenaState = {
  phase: TradingArenaPhase;
  round: number;
  current_challenge_id: string;
  last_run_at: string | null;
};

export type TradingArenaStoreData = {
  state: TradingArenaState;
  challenges: TradingChallenge[];
  agents: StrategyAgent[];
  strategies: TradingStrategy[];
  backtests: LeanBacktest[];
  metrics: BacktestMetrics[];
  scores: StrategyScore[];
  risk_reviews: StrategyRiskReview[];
  artifacts: StrategyArtifact[];
  marketplace_candidates: StrategyMarketplaceCandidate[];
};

export const STRATEGY_AGENT_ROLE_LABELS: Record<StrategyAgentRole, string> = {
  market_thesis: "Market Thesis",
  strategy_architect: "Strategy Architect",
  lean_code: "Lean Code",
  backtest_runner: "Backtest Runner",
  result_parser: "Result Parser",
  risk_judge: "Risk Judge",
  performance_judge: "Performance Judge",
  robustness_judge: "Robustness Judge",
};

export const PENALTY_LABELS: Record<StrategyPenaltyCode, string> = {
  data_leakage: "Data leakage (-20)",
  unrealistic_assumptions: "Unrealistic assumptions (-15)",
  overfitting_risk: "Overfitting risk (-15)",
  excessive_drawdown: "Excessive drawdown (-10)",
  invalid_lean_code: "Invalid Lean code (-20)",
  excessive_turnover: "Excessive turnover (-5)",
};

export const PENALTY_POINTS: Record<StrategyPenaltyCode, number> = {
  data_leakage: 20,
  unrealistic_assumptions: 15,
  overfitting_risk: 15,
  excessive_drawdown: 10,
  invalid_lean_code: 20,
  excessive_turnover: 5,
};
