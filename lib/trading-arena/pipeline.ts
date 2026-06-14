import { newId } from "@/lib/tournament/engine-mock";
import { generateLeanPythonCode } from "@/lib/trading-arena/codegen/lean-python-template";
import { runMockBacktest } from "@/lib/trading-arena/backtest/mock-adapter";
import { runRiskReview } from "@/lib/trading-arena/judges/risk-judge";
import { scorePerformance } from "@/lib/trading-arena/judges/performance-judge";
import {
  scoreCost,
  scoreImplementation,
  scoreRisk,
  scoreRobustness,
} from "@/lib/trading-arena/judges/robustness-judge";
import { getTradingChallenge } from "@/lib/trading-arena/registry/mock-challenges";
import { applyPenalties, finalizeScore } from "@/lib/trading-arena/scoring";
import type {
  BacktestMetrics,
  LeanBacktest,
  StrategyArtifact,
  StrategyMarketplaceCandidate,
  StrategyPenaltyCode,
  StrategyRiskReview,
  StrategyScore,
  TradingArenaState,
  TradingArenaStoreData,
  TradingStrategy,
  TradingStrategySpec,
} from "@/lib/trading-arena/types";

const COMPETITORS = [
  { id: "quant-lean", name: "Quant Lean Agent" },
  { id: "quant-momentum", name: "Momentum Architect Agent" },
  { id: "quant-meanrev", name: "Mean Reversion Agent" },
];

function buildSpec(challenge: NonNullable<ReturnType<typeof getTradingChallenge>>, agentName: string): TradingStrategySpec {
  return {
    title: `${challenge.title} — ${agentName}`,
    thesis: `Exploit ${challenge.asset_class} edge under ${challenge.brief.slice(0, 80)}…`,
    asset_class: challenge.asset_class,
    universe: challenge.universe,
    timeframe: `${challenge.start_date} → ${challenge.end_date}`,
    resolution: challenge.resolution,
    entry_rules: [
      "Enter when signal crosses threshold in direction of thesis",
      "Require regime filter aligned with challenge brief",
    ],
    exit_rules: ["Stop-loss at 2× ATR", "Take-profit at mean reversion target or trailing stop"],
    position_sizing: "Volatility-scaled; max 10% per symbol",
    risk_management: [
      `Max drawdown cap ${challenge.constraints.max_drawdown_pct}%`,
      "No leverage beyond challenge limit",
    ],
    rebalance_frequency: challenge.resolution === "daily" ? "daily" : "weekly",
    benchmark: challenge.benchmark,
    parameters: { lookback: 20, z_entry: 2.0, vol_gate: 0.75 },
    assumptions: ["Mock fill at close", "No borrow costs in MVP"],
    failure_modes: ["Volatility regime shift", "Liquidity gap on crypto"],
  };
}

export type TradingArenaRunResult = {
  state: TradingArenaState;
  strategies: TradingStrategy[];
  backtests: LeanBacktest[];
  metrics: BacktestMetrics[];
  scores: StrategyScore[];
  risk_reviews: StrategyRiskReview[];
  artifacts: StrategyArtifact[];
  marketplace_candidates: StrategyMarketplaceCandidate[];
};

export function runTradingArenaRound(data: TradingArenaStoreData): TradingArenaRunResult {
  const challenge = getTradingChallenge(data.state.current_challenge_id) ?? data.challenges[0];
  if (!challenge) {
    return {
      state: data.state,
      strategies: [],
      backtests: [],
      metrics: [],
      scores: [],
      risk_reviews: [],
      artifacts: [],
      marketplace_candidates: [],
    };
  }

  const round = data.state.round + 1;
  const now = new Date().toISOString();
  const strategies: TradingStrategy[] = [];
  const backtests: LeanBacktest[] = [];
  const metrics: BacktestMetrics[] = [];
  const scores: StrategyScore[] = [];
  const risk_reviews: StrategyRiskReview[] = [];
  const artifacts: StrategyArtifact[] = [];

  for (const comp of COMPETITORS) {
    const strategyId = `strat-${challenge.id}-${comp.id}-r${round}`;
    const spec = buildSpec(challenge, comp.name);
    const lean_code = generateLeanPythonCode(spec);
    const lean_valid = lean_code.includes("QCAlgorithm") && lean_code.includes("Initialize");

    const strategy: TradingStrategy = {
      id: strategyId,
      challenge_id: challenge.id,
      agent_id: comp.id,
      agent_name: comp.name,
      spec,
      language: "python",
      lean_code,
      lean_valid,
      status: "coded",
      thesis_summary: spec.thesis,
      created_at: now,
      updated_at: now,
    };

    const backtestId = `bt-${strategyId}`;
    const backtest: LeanBacktest = {
      id: backtestId,
      strategy_id: strategyId,
      runner: "mock",
      status: "mock",
      simulated: true,
      started_at: now,
      completed_at: now,
      error_message: null,
    };

    const mockResult = runMockBacktest(strategy, challenge);
    const metricsRow: BacktestMetrics = {
      id: `metrics-${backtestId}`,
      backtest_id: backtestId,
      strategy_id: strategyId,
      ...mockResult.metrics,
    };

    const penalties = mockResult.penalties_hint as StrategyPenaltyCode[];
    const riskReview = runRiskReview(strategyId, backtestId, metricsRow, challenge);
    const perf = scorePerformance(metricsRow);
    const riskScore = scoreRisk(metricsRow, riskReview);
    const robustScore = scoreRobustness(metricsRow, penalties);
    const implScore = scoreImplementation(lean_valid, true);
    const costScore = scoreCost(2800 + comp.id.length * 400);
    const penaltyPts = applyPenalties(penalties);

    const breakdown = finalizeScore({
      performance: perf.score,
      risk: riskScore,
      robustness: robustScore,
      implementation: implScore,
      cost: costScore,
      penalties: penaltyPts,
    });

    strategy.status = "judged";
    strategies.push(strategy);
    backtests.push(backtest);
    metrics.push(metricsRow);
    risk_reviews.push(riskReview);

    artifacts.push({
      id: newId(),
      strategy_id: strategyId,
      backtest_id: backtestId,
      kind: "lean_source",
      label: "Lean Python source",
      content: lean_code,
    });

    scores.push({
      id: `score-${strategyId}`,
      strategy_id: strategyId,
      backtest_id: backtestId,
      agent_id: comp.id,
      agent_name: comp.name,
      breakdown,
      penalties,
      rank: null,
      judged_at: now,
    });
  }

  scores.sort((a, b) => b.breakdown.total - a.breakdown.total);
  scores.forEach((s, i) => {
    s.rank = i + 1;
  });

  const marketplace_candidates: StrategyMarketplaceCandidate[] = scores.slice(0, 2).map((s) => {
    const m = metrics.find((x) => x.strategy_id === s.strategy_id)!;
    const strat = strategies.find((x) => x.id === s.strategy_id)!;
    return {
      id: `mkt-${s.strategy_id}`,
      strategy_id: s.strategy_id,
      listing_slug: s.strategy_id,
      title: strat.spec.title,
      arena_score: s.breakdown.total,
      sharpe: m.sharpe,
      max_drawdown: m.max_drawdown,
      backtest_evidence_summary: `Simulated backtest: Sharpe ${m.sharpe.toFixed(2)}, max DD ${(m.max_drawdown * 100).toFixed(1)}%. Research only.`,
      status: "candidate",
    };
  });

  return {
    state: {
      phase: "complete",
      round,
      current_challenge_id: challenge.id,
      last_run_at: now,
    },
    strategies,
    backtests,
    metrics,
    scores,
    risk_reviews,
    artifacts,
    marketplace_candidates,
  };
}
