/** Ports for future Supabase / Realtime / WebSocket adapters. */

import type { AgentHudDetail, AgentHudStoreData } from "@/lib/agent-hud/types";

export type AgentHudDataPort = {
  loadOverview: () => Promise<AgentHudStoreData>;
  loadAgentDetail: (agentId: string) => Promise<AgentHudDetail | null>;
  subscribe?: (callback: (data: AgentHudStoreData) => void) => () => void;
};

/** Mock port — swap for SupabaseAgentHudPort later. */
export class MockAgentHudPort implements AgentHudDataPort {
  constructor(private getData: () => AgentHudStoreData) {}

  async loadOverview(): Promise<AgentHudStoreData> {
    return this.getData();
  }

  async loadAgentDetail(agentId: string): Promise<AgentHudDetail | null> {
    const { aggregateAgentDetail } = await import("@/lib/agent-hud/aggregators/overview");
    return aggregateAgentDetail(this.getData(), agentId);
  }
}
