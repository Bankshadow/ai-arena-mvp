import { newId } from "@/lib/tournament/engine-mock";
import { COMPETITOR_AGENTS } from "@/lib/tournament/agents";
import { buildMockSeries, MOCK_DAILY_COST_HISTORY } from "@/lib/forecasting/mock-series";
import type {
  AgentForecastProfile,
  AnomalyEvent,
  AnomalyRule,
  ForecastExplanation,
  ForecastingBattle,
  ForecastingBattleScore,
  ForecastingBattleSubmission,
  ForecastingDashboard,
  ForecastModel,
  ForecastRun,
  ForecastSummary,
  ProviderUsageForecast,
  RecommendedAction,
} from "@/lib/forecasting/types";

const DEFAULT_MODEL: ForecastModel = {
  id: "model-mock-ema-v1",
  kind: "mock_ema",
  name: "Mock EMA Forecaster",
  version: "1.0.0",
  horizon_hours: 24,
  confidence_default: 0.72,
  enabled: true,
};

export const ANOMALY_RULES: AnomalyRule[] = [
  {
    id: "rule-cost-spike",
    code: "cost_spike",
    target: "llm_cost",
    label: "Cost spike",
    threshold_description: "> 25% above 7-day baseline",
    enabled: true,
  },
  {
    id: "rule-token-spike",
    code: "token_spike",
    target: "token_usage",
    label: "Token spike",
    threshold_description: "> 30% above rolling 24h mean",
    enabled: true,
  },
  {
    id: "rule-score-drop",
    code: "score_drop",
    target: "agent_score",
    label: "Score drop",
    threshold_description: "Agent avg score -10 pts vs prior week",
    enabled: true,
  },
  {
    id: "rule-latency",
    code: "latency_spike",
    target: "latency",
    label: "Latency spike",
    threshold_description: "P95 latency > 2x baseline",
    enabled: true,
  },
  {
    id: "rule-judge-bias",
    code: "judge_bias",
    target: "agent_score",
    label: "Judge bias",
    threshold_description: "Quality/efficiency delta > 15 pts sustained",
    enabled: true,
  },
  {
    id: "rule-rate-limit",
    code: "rate_limit_risk",
    target: "rate_limit_risk",
    label: "Rate limit risk",
    threshold_description: "Groq RPM forecast > 85% of limit",
    enabled: true,
  },
];

function makeExplanation(
  target: ForecastRun["target"],
  summary: string,
  factors: string[],
): ForecastExplanation {
  return {
    id: newId(),
    target,
    summary,
    factors,
    confidence: 0.68 + Math.random() * 0.15,
  };
}

function buildForecastRun(
  target: ForecastRun["target"],
  base: number,
  variance: number,
  trend: number,
  bump: number,
  explanation: ForecastExplanation,
): ForecastRun {
  const now = new Date().toISOString();
  return {
    id: newId(),
    model_id: DEFAULT_MODEL.id,
    target,
    started_at: now,
    completed_at: now,
    horizon_hours: 24,
    points: buildMockSeries(base, variance, trend, bump),
    explanation,
    status: "complete",
  };
}

function buildAgentProfiles(): AgentForecastProfile[] {
  const seeds = [
    { agent_id: "lean", current: 0.28, forecast: 0.34, score: 78, fscore: 81, trend: "rising" as const, rank: 1 },
    { agent_id: "safety-first", current: 0.22, forecast: 0.26, score: 82, fscore: 84, trend: "rising" as const, rank: 2 },
    { agent_id: "rag", current: 0.2, forecast: 0.21, score: 76, fscore: 77, trend: "stable" as const, rank: 3 },
    { agent_id: "premium", current: 0.18, forecast: 0.14, score: 85, fscore: 80, trend: "declining" as const, rank: 4 },
    { agent_id: "fast", current: 0.12, forecast: 0.15, score: 72, fscore: 74, trend: "stable" as const, rank: 5 },
  ];

  return seeds.map((p) => {
    const agent = COMPETITOR_AGENTS.find((a) => a.id === p.agent_id);
    return {
      agent_id: p.agent_id,
      agent_name: agent?.name ?? p.agent_id,
      current_win_rate: p.current,
      forecast_win_rate: p.forecast,
      current_avg_score: p.score,
      forecast_avg_score: p.fscore,
      confidence: 0.65 + Math.random() * 0.2,
      trend: p.trend,
      token_efficiency_rank: p.rank,
    };
  });
}

function buildProviderForecasts(): ProviderUsageForecast[] {
  return [
    {
      provider: "groq",
      current_pct: 62,
      forecast_pct: 71,
      rate_limit_risk: 0.78,
      recommended_action: "Reduce competitors to 3 during peak hours or switch to mock",
    },
    {
      provider: "mock",
      current_pct: 28,
      forecast_pct: 22,
      rate_limit_risk: 0.05,
      recommended_action: "Keep as fallback when Groq guard triggers",
    },
    {
      provider: "anthropic",
      current_pct: 8,
      forecast_pct: 5,
      rate_limit_risk: 0.12,
      recommended_action: "Reserve for hybrid_quality final judge only",
    },
    {
      provider: "openai",
      current_pct: 2,
      forecast_pct: 2,
      rate_limit_risk: 0.08,
      recommended_action: "No change — benchmark reports only",
    },
  ];
}

function buildAnomalies(): AnomalyEvent[] {
  const now = new Date().toISOString();
  return [
    {
      id: newId(),
      rule_id: "rule-cost-spike",
      code: "cost_spike",
      severity: "warning",
      title: "Daily cost trending above baseline",
      message: "Projected +22% vs 7-day average after tournament auto-loop increase.",
      target: "llm_cost",
      detected_at: now,
      value: 0.71,
      baseline: 0.58,
      delta_pct: 22,
    },
    {
      id: newId(),
      rule_id: "rule-token-spike",
      code: "token_spike",
      severity: "warning",
      title: "Token usage spike during peak rounds",
      message: "Round completions clustered at :00 and :05 — 34% above rolling mean.",
      target: "token_usage",
      detected_at: now,
      value: 142000,
      baseline: 106000,
      delta_pct: 34,
    },
    {
      id: newId(),
      rule_id: "rule-score-drop",
      code: "score_drop",
      severity: "info",
      title: "Premium Agent score declining",
      message: "Avg score -8.2 pts over last 6 rounds under tight cost caps.",
      target: "agent_score",
      detected_at: now,
      value: 80,
      baseline: 88.2,
      delta_pct: -9.3,
    },
    {
      id: newId(),
      rule_id: "rule-latency",
      code: "latency_spike",
      severity: "info",
      title: "P95 latency elevated on Groq path",
      message: "Competitor runs averaging 2.1s vs 1.2s baseline.",
      target: "latency",
      detected_at: now,
      value: 2100,
      baseline: 1200,
      delta_pct: 75,
    },
    {
      id: newId(),
      rule_id: "rule-judge-bias",
      code: "judge_bias",
      severity: "warning",
      title: "Efficiency judge overweighting cost",
      message: "Quality/efficiency gap widened 12 pts — lean agents over-ranked.",
      target: "agent_score",
      detected_at: now,
      value: 12,
      baseline: 4,
      delta_pct: 200,
    },
    {
      id: newId(),
      rule_id: "rule-rate-limit",
      code: "rate_limit_risk",
      severity: "critical",
      title: "Groq rate limit risk high",
      message: "Forecast RPM at 87% of free-tier limit with 5 competitors × 5-min loop.",
      target: "rate_limit_risk",
      detected_at: now,
      value: 0.87,
      baseline: 0.55,
      delta_pct: 58,
    },
  ];
}

function buildRecommendations(): RecommendedAction[] {
  return [
    {
      id: newId(),
      priority: "high",
      title: "Reduce competitor count during high-risk hours",
      description: "Rate limit guard recommends max 3 competitors when Groq forecast exceeds 80%.",
      action_type: "tournament_config",
      related_target: "rate_limit_risk",
    },
    {
      id: newId(),
      priority: "medium",
      title: "Switch final judge to mock mode",
      description: "Save Anthropic budget until hybrid_quality tournaments are scheduled.",
      action_type: "runtime_mode",
      related_target: "llm_cost",
    },
    {
      id: newId(),
      priority: "medium",
      title: "Move challenge generation to Groq",
      description: "Creator agents on llama-3.3-70b cut cost 40% vs premium path in mock benchmarks.",
      action_type: "routing",
      related_target: "provider_usage",
    },
    {
      id: newId(),
      priority: "low",
      title: "Run constitution battle for declining agent",
      description: "Premium Agent win-rate forecast declining — test v1.3 constitution in battle.",
      action_type: "constitution",
      related_target: "agent_win_rate",
    },
  ];
}

function buildBattle(): {
  battle: ForecastingBattle;
  submissions: ForecastingBattleSubmission[];
  scores: ForecastingBattleScore[];
} {
  const battle: ForecastingBattle = {
    id: "battle-forecast-7d",
    title: "7-day cost & token forecast challenge",
    brief: "Forecast next 7 days of tournament cost and token usage from historical runs.",
    horizon_days: 7,
    targets: ["llm_cost", "token_usage"],
    status: "preview",
    created_at: new Date().toISOString(),
  };

  const submissions: ForecastingBattleSubmission[] = [
    {
      id: newId(),
      battle_id: battle.id,
      agent_id: "lean",
      agent_name: "Lean Agent",
      predicted_cost_usd: 4.82,
      predicted_tokens: 890000,
      methodology: "EMA on cost/token with cost-cap regression",
      submitted_at: new Date().toISOString(),
    },
    {
      id: newId(),
      battle_id: battle.id,
      agent_id: "rag",
      agent_name: "RAG Agent",
      predicted_cost_usd: 5.45,
      predicted_tokens: 1020000,
      methodology: "Seasonal mock + provider mix adjustment",
      submitted_at: new Date().toISOString(),
    },
    {
      id: newId(),
      battle_id: battle.id,
      agent_id: "minimal-tool",
      agent_name: "Minimal Tool Agent",
      predicted_cost_usd: 4.65,
      predicted_tokens: 820000,
      methodology: "Minimal feature set — 3-day window only",
      submitted_at: new Date().toISOString(),
    },
  ];

  const scores: ForecastingBattleScore[] = [
    {
      submission_id: submissions[0].id,
      agent_id: "lean",
      agent_name: "Lean Agent",
      accuracy_score: 88,
      calibration_score: 85,
      explanation_score: 90,
      total_score: 87.7,
      rank: 1,
    },
    {
      submission_id: submissions[2].id,
      agent_id: "minimal-tool",
      agent_name: "Minimal Tool Agent",
      accuracy_score: 84,
      calibration_score: 82,
      explanation_score: 78,
      total_score: 81.3,
      rank: 2,
    },
    {
      submission_id: submissions[1].id,
      agent_id: "rag",
      agent_name: "RAG Agent",
      accuracy_score: 79,
      calibration_score: 80,
      explanation_score: 86,
      total_score: 81.0,
      rank: 3,
    },
  ];

  return { battle, submissions, scores };
}

/** Assemble full forecasting dashboard from mock tournament telemetry. */
export function buildForecastingDashboard(): ForecastingDashboard {
  const tokenRun = buildForecastRun(
    "token_usage",
    8500,
    1200,
    150,
    180,
    makeExplanation(
      "token_usage",
      "Token usage expected to rise 12–18% over next 24h due to 5-min auto-loop and Tool Arena rounds.",
      ["Tournament auto-loop active", "4 competitor agents per round", "Groq free-tier path dominant"],
    ),
  );

  const costRun = buildForecastRun(
    "llm_cost",
    0.028,
    0.008,
    0.002,
    0.003,
    makeExplanation(
      "llm_cost",
      "Daily cost projected at $0.71 today, $4.90–$5.40 over 7 days if loop unchanged.",
      MOCK_DAILY_COST_HISTORY.map((d) => `${d.date}: $${d.cost}`),
    ),
  );

  const agents = buildAgentProfiles();
  const providers = buildProviderForecasts();
  const rising = [...agents].sort((a, b) => b.forecast_win_rate - a.forecast_win_rate)[0];
  const risky = [...providers].sort((a, b) => b.rate_limit_risk - a.rate_limit_risk)[0];

  const next24Tokens = tokenRun.points
    .filter((p) => p.actual === null)
    .reduce((s, p) => s + p.predicted, 0);

  const next24Cost = costRun.points
    .filter((p) => p.actual === null)
    .reduce((s, p) => s + p.predicted, 0);

  const summary: ForecastSummary = {
    next_24h_tokens: Math.round(next24Tokens),
    next_24h_cost_usd: Math.round(next24Cost * 1000) / 1000,
    top_rising_agent: rising,
    highest_risk_provider: risky,
    marketplace_candidates_forecast: 4,
    monthly_cost_projection_usd: 18.5,
    cost_spike_risk: 0.68,
  };

  const { battle, submissions, scores } = buildBattle();

  return {
    generated_at: new Date().toISOString(),
    model: DEFAULT_MODEL,
    summary,
    token_forecast: tokenRun,
    cost_forecast: costRun,
    agent_profiles: agents,
    provider_forecasts: providers,
    anomalies: buildAnomalies(),
    recommendations: buildRecommendations(),
    battle,
    battle_submissions: submissions,
    battle_scores: scores,
  };
}

export { MOCK_DAILY_COST_HISTORY };
