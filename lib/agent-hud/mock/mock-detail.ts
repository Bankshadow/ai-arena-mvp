import type {
  AgentConstitutionSummary,
  AgentCorrection,
  AgentCostProfile,
  AgentHudDetail,
  AgentHudProfile,
  AgentImprovement,
  AgentMarketplaceAsset,
  AgentMemoryLesson,
  AgentMistake,
  AgentModelUsageSnapshot,
  AgentPerformancePoint,
  AgentSkillProfile,
  AgentToolUsageSnapshot,
  AgentTournamentEntry,
} from "@/lib/agent-hud/types";
import { getSeedHealthInput, SEEDS } from "@/lib/agent-hud/mock/mock-overview";
import { computeHealthScore, healthTrend } from "@/lib/agent-hud/health/score";
import { getAgentHudEntry } from "@/lib/agent-hud/registry/agent-registry";
import type { AgentActivityEvent, AgentHealthSnapshot } from "@/lib/agent-hud/types";

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400_000).toISOString();
}

function buildConstitution(agentId: string): AgentConstitutionSummary {
  const goals: Record<string, string> = {
    lean: "Produce pass-quality output under strict token and cost caps.",
    premium: "Maximize rubric score via draft → critique → rewrite pipeline.",
    rag: "Ground every claim with retrieved citations.",
    "multi-agent": "Orchestrate specialist sub-agents into one deliverable.",
    fast: "Minimize latency with streaming single-shot responses.",
    quality: "Score submissions against rubric with consistency.",
    efficiency: "Score cost, token, and latency efficiency.",
    forecasting: "Generate calibrated scenario forecasts with confidence bands.",
    "deep-research": "Synthesize evidence from multiple sources with provenance.",
    "tool-first": "Maximize tool throughput with verification on writes.",
  };
  const seed = SEEDS.find((s) => s.id === agentId);
  return {
    agentId,
    version: seed?.constitutionVersion ?? "v1.0",
    score: seed ? computeHealthScore(seed.healthInput).components.constitutionMaturity * 10 : 70,
    primaryGoal: goals[agentId] ?? "Execute tournament tasks reliably.",
    keyRules: [
      "Follow output format contract exactly.",
      "Respect cost and token budgets.",
      "Flag uncertainty inline — never invent facts.",
    ],
    lastUpdatedAt: daysAgo(14),
  };
}

function buildMemoryLessons(agentId: string): AgentMemoryLesson[] {
  return [
    {
      id: `${agentId}-ml-1`,
      type: "strength",
      title: "Consistent section structure",
      summary: "Numbered sections match output contract 94% of runs.",
      confidence: 0.91,
      createdAt: daysAgo(3),
    },
    {
      id: `${agentId}-ml-2`,
      type: "weakness",
      title: "Cost drift on long inputs",
      summary: "Runs with >4k input tokens exceed budget 12% of the time.",
      confidence: 0.78,
      createdAt: daysAgo(7),
    },
    {
      id: `${agentId}-ml-3`,
      type: "recommended_change",
      title: "Trim context window",
      summary: "Pre-summarize input paragraphs before main pass.",
      confidence: 0.82,
      createdAt: daysAgo(1),
    },
  ];
}

function buildTimeline(profile: AgentHudProfile): AgentPerformancePoint[] {
  const base = profile.averageScore;
  return [6, 5, 4, 3, 2, 1, 0].map((d) => ({
    at: daysAgo(d),
    score: Math.round(base + (Math.sin(d) * 4 - 2) * 10) / 10,
    costUsd: profile.averageCostUsd * (0.9 + d * 0.02),
    label: d === 0 ? "Latest" : `D-${d}`,
  }));
}

function buildTournamentHistory(profile: AgentHudProfile): AgentTournamentEntry[] {
  return [
    {
      id: `${profile.id}-t1`,
      tournamentName: "Executive Summary Battle",
      round: 7,
      rank: Math.max(1, Math.round((1 - profile.winRate) * 5)),
      score: profile.averageScore,
      costUsd: profile.averageCostUsd,
      completedAt: daysAgo(1),
    },
    {
      id: `${profile.id}-t2`,
      tournamentName: "Tool Arena Round",
      round: 3,
      rank: 2,
      score: profile.averageScore - 3,
      costUsd: profile.averageCostUsd * 1.1,
      completedAt: daysAgo(5),
    },
    {
      id: `${profile.id}-t3`,
      tournamentName: "Forecasting Challenge",
      round: 1,
      rank: 3,
      score: profile.averageScore - 6,
      costUsd: profile.averageCostUsd * 0.95,
      completedAt: daysAgo(12),
    },
  ];
}

function buildMistakes(agentId: string): AgentMistake[] {
  const common: AgentMistake[] = [
    {
      id: `${agentId}-m1`,
      agentId,
      category: "format",
      title: "Missing confidence section",
      description: "Output contract section omitted on 2 consecutive runs.",
      impactScore: 6,
      occurredAt: daysAgo(2),
      resolved: true,
    },
  ];
  if (agentId === "tool-first") {
    common.push({
      id: `${agentId}-m2`,
      agentId,
      category: "tool",
      title: "Write without dry-run",
      description: "Attempted github.create_issue without prior dry-run.",
      impactScore: 9,
      occurredAt: daysAgo(0),
      resolved: false,
    });
  }
  if (agentId === "premium") {
    common.push({
      id: `${agentId}-m3`,
      agentId,
      category: "cost",
      title: "Self-review loop overrun",
      description: "Third critique pass pushed cost 18% over cap.",
      impactScore: 7,
      occurredAt: daysAgo(1),
      resolved: false,
    });
  }
  return common;
}

function buildCorrections(agentId: string, mistakes: AgentMistake[]): AgentCorrection[] {
  return mistakes.map((m, i) => ({
    id: `${agentId}-c${i}`,
    mistakeId: m.id,
    agentId,
    title: m.resolved ? "Constitution patch applied" : "Pending review",
    action: m.resolved
      ? "Added pre-flight section checklist to self-review protocol."
      : "Awaiting tournament admin approval for constitution v-next.",
    outcome: m.resolved ? "verified" : "pending",
    appliedAt: m.resolved ? daysAgo(1) : daysAgo(0),
  }));
}

function buildCostProfile(profile: AgentHudProfile): AgentCostProfile {
  return {
    agentId: profile.id,
    avgCostUsd: profile.averageCostUsd,
    medianCostUsd: profile.averageCostUsd * 0.92,
    p95CostUsd: profile.averageCostUsd * 1.35,
    totalSpendUsd: profile.averageCostUsd * 120,
    costPerQualityPoint: profile.averageCostUsd / (profile.averageScore / 100),
    tokenInAvg: Math.round(profile.totalTokens * 0.4 / 100),
    tokenOutAvg: Math.round(profile.totalTokens * 0.6 / 100),
    totalTokens: profile.totalTokens,
    budgetUtilization: profile.averageCostUsd > 0.02 ? 0.88 : 0.62,
    trend: profile.averageCostUsd > 0.02 ? "degrading" : "improving",
  };
}

function buildModelUsage(profile: AgentHudProfile): AgentModelUsageSnapshot {
  const primary = {
    provider: profile.primaryProvider,
    model: profile.primaryModel,
    sharePct: profile.primaryProvider === "multi" ? 60 : 85,
    avgCostUsd: profile.averageCostUsd,
    avgLatencyMs: profile.id === "fast" ? 420 : 1800,
    runs: 48,
  };
  const fallback =
    profile.primaryProvider !== "mock"
      ? {
          provider: "mock" as const,
          model: "mock-v1",
          sharePct: profile.primaryProvider === "multi" ? 40 : 15,
          avgCostUsd: 0,
          avgLatencyMs: 50,
          runs: 8,
        }
      : null;
  return {
    agentId: profile.id,
    providers: fallback ? [primary, fallback] : [primary],
    routingPolicy:
      profile.primaryProvider === "multi"
        ? "Round-robin sub-agents with merge coordinator"
        : "Primary model with mock fallback on rate limit",
    fallbackCount: fallback?.runs ?? 0,
  };
}

function buildToolUsage(profile: AgentHudProfile): AgentToolUsageSnapshot {
  const isTool = profile.agentType === "tool" || profile.id === "rag";
  return {
    agentId: profile.id,
    totalCalls: isTool ? 340 : 42,
    successRate: profile.id === "tool-first" ? 0.78 : 0.94,
    avgLatencyMs: isTool ? 680 : 320,
    topTools: isTool
      ? [
          { toolId: "github", name: "GitHub", calls: 120, successRate: 0.82 },
          { toolId: "notion", name: "Notion", calls: 85, successRate: 0.91 },
          { toolId: "supabase", name: "Supabase", calls: 65, successRate: 0.96 },
        ]
      : [
          { toolId: "vector", name: "Vector search", calls: 28, successRate: 0.96 },
          { toolId: "memory", name: "Memory read", calls: 14, successRate: 1 },
        ],
    recentTrace: [
      {
        id: "tr-1",
        tool: isTool ? "github" : "vector",
        action: isTool ? "create_issue" : "search",
        status: profile.id === "tool-first" ? "error" : "ok",
        latencyMs: 890,
        at: new Date().toISOString(),
      },
      {
        id: "tr-2",
        tool: isTool ? "notion" : "memory",
        action: isTool ? "get_page" : "read_lesson",
        status: "ok",
        latencyMs: 420,
        at: daysAgo(0),
      },
    ],
  };
}

function buildSkills(profile: AgentHudProfile): AgentSkillProfile {
  return {
    agentId: profile.id,
    skills: [
      { id: "s1", name: "Executive summary", level: 88, category: "writing", lastUsedAt: daysAgo(1) },
      { id: "s2", name: "Rubric alignment", level: 82, category: "quality", lastUsedAt: daysAgo(2) },
      { id: "s3", name: "Cost control", level: profile.averageCostUsd < 0.005 ? 95 : 62, category: "efficiency", lastUsedAt: daysAgo(1) },
    ],
    capabilities: [
      profile.agentType === "judge" ? "Rubric scoring" : "Challenge completion",
      "Constitution compliance",
      profile.agentType === "tool" ? "Multi-tool orchestration" : "Structured output",
    ],
    weaknesses: profile.riskAlerts.length > 0 ? profile.riskAlerts : ["None flagged"],
  };
}

function buildMarketplace(profile: AgentHudProfile): AgentMarketplaceAsset[] {
  return [
    {
      id: `${profile.id}-mp1`,
      name: `${profile.name} Workflow`,
      type: "workflow",
      status: profile.winRate > 0.7 ? "published" : "draft",
      downloads: Math.round(profile.winRate * 200),
      rating: 3.5 + profile.winRate,
    },
    {
      id: `${profile.id}-mp2`,
      name: `Constitution ${profile.constitutionVersion}`,
      type: "constitution",
      status: "published",
      downloads: 45,
      rating: 4.2,
    },
  ];
}

function buildImprovements(profile: AgentHudProfile): AgentImprovement[] {
  const items: AgentImprovement[] = [];
  if (profile.averageCostUsd > 0.02) {
    items.push({
      id: `${profile.id}-imp1`,
      priority: "high",
      title: "Tighten self-review loop",
      rationale: "Cost efficiency component below target.",
      estimatedImpact: "+8 health · −15% avg cost",
    });
  }
  if (profile.memoryFreshness < 0.8) {
    items.push({
      id: `${profile.id}-imp2`,
      priority: "medium",
      title: "Refresh memory compiler",
      rationale: "Memory freshness score degraded.",
      estimatedImpact: "+5 health · fresher lessons",
    });
  }
  if (profile.riskAlerts.length > 0) {
    items.push({
      id: `${profile.id}-imp3`,
      priority: "high",
      title: "Resolve active risk alerts",
      rationale: profile.riskAlerts[0] ?? "Active alerts detected.",
      estimatedImpact: "Reduce anomaly penalty",
    });
  }
  if (items.length === 0) {
    items.push({
      id: `${profile.id}-imp0`,
      priority: "low",
      title: "Maintain current constitution",
      rationale: "Agent operating within healthy parameters.",
      estimatedImpact: "Stable performance",
    });
  }
  return items;
}

export function buildAgentHudDetail(
  profile: AgentHudProfile,
  activity: AgentActivityEvent[],
  health?: AgentHealthSnapshot,
): AgentHudDetail | null {
  const entry = getAgentHudEntry(profile.id);
  if (!entry) return null;

  const seedInput = getSeedHealthInput(profile.id);
  let healthSnap: AgentHealthSnapshot;
  if (health) {
    healthSnap = health;
  } else if (seedInput) {
    const { score, components } = computeHealthScore(seedInput);
    healthSnap = {
      agentId: profile.id,
      score,
      components,
      trend: healthTrend(score, score - 2),
      updatedAt: new Date().toISOString(),
      summary: "Mock snapshot",
    };
  } else {
    return null;
  }

  const mistakes = buildMistakes(profile.id);

  return {
    profile,
    health: healthSnap,
    constitution: buildConstitution(profile.id),
    memoryLessons: buildMemoryLessons(profile.id),
    performanceTimeline: buildTimeline(profile),
    tournamentHistory: buildTournamentHistory(profile),
    mistakes,
    corrections: buildCorrections(profile.id, mistakes),
    costProfile: buildCostProfile(profile),
    modelUsage: buildModelUsage(profile),
    toolUsage: buildToolUsage(profile),
    skills: buildSkills(profile),
    marketplaceAssets: buildMarketplace(profile),
    activity: activity.filter((a) => a.agentId === profile.id),
    improvements: buildImprovements(profile),
  };
}
