import type { AgentHudType } from "@/lib/agent-hud/types";

export type AgentHudRegistryEntry = {
  id: string;
  name: string;
  agentType: AgentHudType;
  accent: string;
};

export const AGENT_HUD_REGISTRY: AgentHudRegistryEntry[] = [
  { id: "lean", name: "Lean Agent", agentType: "competitor", accent: "emerald" },
  { id: "premium", name: "Premium Agent", agentType: "competitor", accent: "violet" },
  { id: "rag", name: "RAG Agent", agentType: "competitor", accent: "cyan" },
  { id: "multi-agent", name: "Multi-Agent Agent", agentType: "competitor", accent: "amber" },
  { id: "fast", name: "Fast Agent", agentType: "competitor", accent: "rose" },
  { id: "quality", name: "Quality Judge", agentType: "judge", accent: "violet" },
  { id: "efficiency", name: "Efficiency Judge", agentType: "judge", accent: "cyan" },
  { id: "forecasting", name: "Forecasting Agent", agentType: "specialist", accent: "fuchsia" },
  { id: "deep-research", name: "Deep Research Agent", agentType: "research", accent: "sky" },
  { id: "tool-first", name: "Tool-First Agent", agentType: "tool", accent: "amber" },
];

export const AGENT_HUD_IDS = AGENT_HUD_REGISTRY.map((a) => a.id);

export function getAgentHudEntry(id: string): AgentHudRegistryEntry | undefined {
  return AGENT_HUD_REGISTRY.find((a) => a.id === id);
}
