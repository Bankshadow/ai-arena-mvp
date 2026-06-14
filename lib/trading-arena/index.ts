export * from "@/lib/trading-arena/types";
export { TRADING_AGENTS, getTradingAgent } from "@/lib/trading-arena/agents";
export { MOCK_TRADING_CHALLENGES, getTradingChallenge } from "@/lib/trading-arena/registry/mock-challenges";
export { runTradingArenaRound } from "@/lib/trading-arena/pipeline";
export { TradingArenaStore, getServerTradingArenaData, getServerStrategy } from "@/lib/trading-arena/store";
export { generateLeanPythonCode } from "@/lib/trading-arena/codegen/lean-python-template";

/** Future: Lean CLI / Docker backtest port. */
export type LeanBacktestPort = {
  runBacktest(strategyId: string): Promise<import("@/lib/trading-arena/types").LeanBacktest>;
};
