/** Agent Observability HUD — types (mock-first, Supabase/Realtime-ready). */

export type AgentHudType =
  | "competitor"
  | "judge"
  | "specialist"
  | "research"
  | "tool";

export type AgentHudStatus = "idle" | "running" | "paused" | "error" | "offline";

export type AgentRiskLevel = "low" | "medium" | "high" | "critical";

export type AgentHudProvider =
  | "anthropic"
  | "openai"
  | "groq"
  | "google"
  | "mock"
  | "multi";

export type AgentHudProfile = {
  id: string;
  name: string;
  agentType: AgentHudType;
  status: AgentHudStatus;
  currentTask: string | null;
  constitutionVersion: string;
  primaryProvider: AgentHudProvider;
  primaryModel: string;
  winRate: number;
  averageScore: number;
  averageCostUsd: number;
  totalTokens: number;
  healthScore: number;
  memoryFreshness: number;
  lastActiveAt: string;
  riskLevel: AgentRiskLevel;
  riskAlerts: string[];
  accent: string;
};

export type AgentHealthComponents = {
  performanceStability: number;
  costEfficiency: number;
  memoryFreshness: number;
  errorRate: number;
  toolReliability: number;
  constitutionMaturity: number;
  recentAnomalyPenalty: number;
};

export type AgentHealthSnapshot = {
  agentId: string;
  score: number;
  components: AgentHealthComponents;
  trend: "up" | "down" | "stable";
  updatedAt: string;
  summary: string;
};

export type AgentActivityEventType =
  | "run_started"
  | "run_completed"
  | "run_failed"
  | "tool_call"
  | "memory_update"
  | "constitution_change"
  | "tournament_entry"
  | "marketplace_publish"
  | "anomaly_detected"
  | "correction_applied";

export type AgentActivityEvent = {
  id: string;
  agentId: string;
  type: AgentActivityEventType;
  title: string;
  detail: string;
  severity: "info" | "warning" | "error" | "success";
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type AgentMistake = {
  id: string;
  agentId: string;
  category: "hallucination" | "format" | "cost" | "tool" | "latency" | "policy";
  title: string;
  description: string;
  impactScore: number;
  occurredAt: string;
  tournamentId?: string;
  resolved: boolean;
};

export type AgentCorrection = {
  id: string;
  mistakeId: string;
  agentId: string;
  title: string;
  action: string;
  outcome: "pending" | "applied" | "verified";
  appliedAt: string;
};

export type AgentCostProfile = {
  agentId: string;
  avgCostUsd: number;
  medianCostUsd: number;
  p95CostUsd: number;
  totalSpendUsd: number;
  costPerQualityPoint: number;
  tokenInAvg: number;
  tokenOutAvg: number;
  totalTokens: number;
  budgetUtilization: number;
  trend: "improving" | "stable" | "degrading";
};

export type AgentSkillProfile = {
  agentId: string;
  skills: {
    id: string;
    name: string;
    level: number;
    category: string;
    lastUsedAt: string;
  }[];
  capabilities: string[];
  weaknesses: string[];
};

export type AgentToolUsageSnapshot = {
  agentId: string;
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  topTools: { toolId: string; name: string; calls: number; successRate: number }[];
  recentTrace: {
    id: string;
    tool: string;
    action: string;
    status: "ok" | "error" | "skipped";
    latencyMs: number;
    at: string;
  }[];
};

export type AgentModelUsageSnapshot = {
  agentId: string;
  providers: {
    provider: AgentHudProvider;
    model: string;
    sharePct: number;
    avgCostUsd: number;
    avgLatencyMs: number;
    runs: number;
  }[];
  routingPolicy: string;
  fallbackCount: number;
};

export type AgentConstitutionSummary = {
  agentId: string;
  version: string;
  score: number;
  primaryGoal: string;
  keyRules: string[];
  lastUpdatedAt: string;
};

export type AgentMemoryLesson = {
  id: string;
  type: string;
  title: string;
  summary: string;
  confidence: number;
  createdAt: string;
};

export type AgentPerformancePoint = {
  at: string;
  score: number;
  costUsd: number;
  label: string;
};

export type AgentTournamentEntry = {
  id: string;
  tournamentName: string;
  round: number;
  rank: number;
  score: number;
  costUsd: number;
  completedAt: string;
};

export type AgentMarketplaceAsset = {
  id: string;
  name: string;
  type: "workflow" | "constitution" | "stack" | "prompt";
  status: "draft" | "published" | "featured";
  downloads: number;
  rating: number;
};

export type AgentImprovement = {
  id: string;
  priority: "low" | "medium" | "high";
  title: string;
  rationale: string;
  estimatedImpact: string;
};

export type AgentHudDetail = {
  profile: AgentHudProfile;
  health: AgentHealthSnapshot;
  constitution: AgentConstitutionSummary;
  memoryLessons: AgentMemoryLesson[];
  performanceTimeline: AgentPerformancePoint[];
  tournamentHistory: AgentTournamentEntry[];
  mistakes: AgentMistake[];
  corrections: AgentCorrection[];
  costProfile: AgentCostProfile;
  modelUsage: AgentModelUsageSnapshot;
  toolUsage: AgentToolUsageSnapshot;
  skills: AgentSkillProfile;
  marketplaceAssets: AgentMarketplaceAsset[];
  activity: AgentActivityEvent[];
  improvements: AgentImprovement[];
};

export type AgentHudFilters = {
  agentType: AgentHudType | "all";
  status: AgentHudStatus | "all";
  riskLevel: AgentRiskLevel | "all";
  provider: AgentHudProvider | "all";
  minHealthScore: number;
};

export type AgentHudStoreData = {
  profiles: AgentHudProfile[];
  healthSnapshots: AgentHealthSnapshot[];
  activity: AgentActivityEvent[];
  lastRefreshedAt: string;
};
