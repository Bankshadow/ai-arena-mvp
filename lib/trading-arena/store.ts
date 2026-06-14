import { TRADING_AGENTS } from "@/lib/trading-arena/agents";
import { MOCK_TRADING_CHALLENGES } from "@/lib/trading-arena/registry/mock-challenges";
import type { TradingArenaState, TradingArenaStoreData } from "@/lib/trading-arena/types";

const STORE_KEY = "ai-arena-trading-arena";

function emptyState(): TradingArenaState {
  return {
    phase: "idle",
    round: 0,
    current_challenge_id: MOCK_TRADING_CHALLENGES[0]!.id,
    last_run_at: null,
  };
}

function seedData(): TradingArenaStoreData {
  return {
    state: emptyState(),
    challenges: MOCK_TRADING_CHALLENGES,
    agents: TRADING_AGENTS,
    strategies: [],
    backtests: [],
    metrics: [],
    scores: [],
    risk_reviews: [],
    artifacts: [],
    marketplace_candidates: [],
  };
}

export class TradingArenaStore {
  private data: TradingArenaStoreData;

  constructor() {
    this.data = seedData();
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) this.data = JSON.parse(raw) as TradingArenaStoreData;
      } catch {
        /* ignore */
      }
    }
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    } catch {
      /* quota */
    }
  }

  getData(): TradingArenaStoreData {
    return JSON.parse(JSON.stringify(this.data)) as TradingArenaStoreData;
  }

  mergeRunResult(result: Partial<TradingArenaStoreData> & { state: TradingArenaState }): void {
    this.data.state = result.state;
    this.data.strategies = [...result.strategies ?? [], ...this.data.strategies].slice(0, 30);
    this.data.backtests = [...result.backtests ?? [], ...this.data.backtests].slice(0, 30);
    this.data.metrics = [...result.metrics ?? [], ...this.data.metrics].slice(0, 30);
    this.data.scores = [...result.scores ?? [], ...this.data.scores].slice(0, 30);
    this.data.risk_reviews = [...result.risk_reviews ?? [], ...this.data.risk_reviews].slice(0, 30);
    this.data.artifacts = [...result.artifacts ?? [], ...this.data.artifacts].slice(0, 50);
    this.data.marketplace_candidates = [
      ...result.marketplace_candidates ?? [],
      ...this.data.marketplace_candidates,
    ].slice(0, 20);
    this.persist();
  }

  setChallenge(id: string): void {
    this.data.state.current_challenge_id = id;
    this.persist();
  }

  getStrategyById(id: string) {
    return this.data.strategies.find((s) => s.id === id);
  }
}

let _serverData: TradingArenaStoreData | null = null;

export function getServerTradingArenaData(): TradingArenaStoreData {
  if (!_serverData) _serverData = seedData();
  return JSON.parse(JSON.stringify(_serverData)) as TradingArenaStoreData;
}

export function getServerStrategy(id: string) {
  return getServerTradingArenaData().strategies.find((s) => s.id === id);
}
