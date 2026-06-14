import { seedAgentHudStore } from "@/lib/agent-hud/mock/mock-overview";
import type { AgentHudFilters, AgentHudStoreData } from "@/lib/agent-hud/types";

const STORE_KEY = "ai-arena-agent-hud";

export const DEFAULT_FILTERS: AgentHudFilters = {
  agentType: "all",
  status: "all",
  riskLevel: "all",
  provider: "all",
  minHealthScore: 0,
};

export class AgentHudStore {
  private data: AgentHudStoreData;
  private filters: AgentHudFilters;

  constructor() {
    this.data = seedAgentHudStore();
    this.filters = { ...DEFAULT_FILTERS };
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { data?: AgentHudStoreData; filters?: AgentHudFilters };
          if (parsed.data) this.data = parsed.data;
          if (parsed.filters) this.filters = parsed.filters;
        }
      } catch {
        /* ignore */
      }
    }
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ data: this.data, filters: this.filters }));
    } catch {
      /* quota */
    }
  }

  getData(): AgentHudStoreData {
    return JSON.parse(JSON.stringify(this.data)) as AgentHudStoreData;
  }

  getFilters(): AgentHudFilters {
    return { ...this.filters };
  }

  setFilters(patch: Partial<AgentHudFilters>): void {
    this.filters = { ...this.filters, ...patch };
    this.persist();
  }

  resetFilters(): void {
    this.filters = { ...DEFAULT_FILTERS };
    this.persist();
  }

  refresh(): void {
    this.data = {
      ...seedAgentHudStore(),
      lastRefreshedAt: new Date().toISOString(),
    };
    this.persist();
  }
}
