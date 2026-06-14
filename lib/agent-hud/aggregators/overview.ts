import { buildAgentHudDetail } from "@/lib/agent-hud/mock/mock-detail";
import { seedAgentHudStore } from "@/lib/agent-hud/mock/mock-overview";
import type {
  AgentHudDetail,
  AgentHudFilters,
  AgentHudProfile,
  AgentHudStoreData,
} from "@/lib/agent-hud/types";

export function filterAgentProfiles(
  profiles: AgentHudProfile[],
  filters: AgentHudFilters,
): AgentHudProfile[] {
  return profiles.filter((p) => {
    if (filters.agentType !== "all" && p.agentType !== filters.agentType) return false;
    if (filters.status !== "all" && p.status !== filters.status) return false;
    if (filters.riskLevel !== "all" && p.riskLevel !== filters.riskLevel) return false;
    if (filters.provider !== "all" && p.primaryProvider !== filters.provider) return false;
    if (p.healthScore < filters.minHealthScore) return false;
    return true;
  });
}

export function getOverviewStats(profiles: AgentHudProfile[]) {
  const running = profiles.filter((p) => p.status === "running").length;
  const atRisk = profiles.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical").length;
  const avgHealth =
    profiles.length > 0
      ? Math.round(profiles.reduce((s, p) => s + p.healthScore, 0) / profiles.length)
      : 0;
  return { total: profiles.length, running, atRisk, avgHealth };
}

export function aggregateAgentDetail(
  data: AgentHudStoreData,
  agentId: string,
): AgentHudDetail | null {
  const profile = data.profiles.find((p) => p.id === agentId);
  if (!profile) return null;
  const health = data.healthSnapshots.find((h) => h.agentId === agentId);
  return buildAgentHudDetail(profile, data.activity, health);
}

export function aggregateOverview(data: AgentHudStoreData, filters: AgentHudFilters) {
  const filtered = filterAgentProfiles(data.profiles, filters);
  return {
    profiles: filtered.sort((a, b) => b.healthScore - a.healthScore),
    stats: getOverviewStats(filtered),
    recentActivity: data.activity.slice(0, 8),
  };
}

export { seedAgentHudStore };
