import type { StrategyAgent } from "@/lib/trading-arena/types";

export const TRADING_AGENTS: StrategyAgent[] = [
  {
    id: "agent-thesis",
    role: "market_thesis",
    name: "Market Thesis Agent",
    description: "Generates regime narratives, edge hypotheses, and failure scenarios.",
  },
  {
    id: "agent-architect",
    role: "strategy_architect",
    name: "Strategy Architect Agent",
    description: "Converts theses into structured strategy specs with rules and risk controls.",
  },
  {
    id: "agent-lean-code",
    role: "lean_code",
    name: "Lean Code Agent",
    description: "Produces Lean-compatible Python QCAlgorithm code from specs.",
  },
  {
    id: "agent-backtest",
    role: "backtest_runner",
    name: "Backtest Runner Agent",
    description: "Queues and runs mock (later Lean CLI) backtests.",
  },
  {
    id: "agent-parser",
    role: "result_parser",
    name: "Result Parser Agent",
    description: "Extracts normalized metrics from backtest output.",
  },
  {
    id: "agent-risk-judge",
    role: "risk_judge",
    name: "Risk Judge Agent",
    description: "Evaluates drawdown, leverage, tail risk, and exit discipline.",
  },
  {
    id: "agent-perf-judge",
    role: "performance_judge",
    name: "Performance Judge Agent",
    description: "Scores returns, Sharpe, benchmark alpha, and consistency.",
  },
  {
    id: "agent-robust-judge",
    role: "robustness_judge",
    name: "Robustness Judge Agent",
    description: "Checks walk-forward stability, parameter sensitivity, overfitting.",
  },
];

export function getTradingAgent(id: string): StrategyAgent | undefined {
  return TRADING_AGENTS.find((a) => a.id === id);
}
