/** Multi-provider tournament routing types. */

export type TournamentRuntimeMode = "mock" | "groq_free" | "hybrid_quality";

export type TaskType =
  | "challenge_generation"
  | "competitor_run"
  | "preliminary_judge"
  | "final_judge"
  | "benchmark_report"
  | "marketplace_polish";

export type ProviderId = "mock" | "groq" | "anthropic" | "openai";

export type RiskLevel = "low" | "medium" | "high";

export type RecommendedAction =
  | "proceed"
  | "reduce_competitors"
  | "skip_final_judge"
  | "delay_loop"
  | "switch_to_mock";

export type GenerateTextParams = {
  taskType: TaskType;
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
};

export type GenerateTextResult = {
  text: string;
  model: string;
  provider: ProviderId;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  estimatedCostUsd: number;
};

export type EstimateCostParams = {
  taskType: TaskType;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export type ProviderStatus = {
  id: ProviderId;
  available: boolean;
  label: string;
  message: string;
};

export type RateLimitInfo = {
  requestsPerMinuteLimit: number | null;
  requestsPerDayLimit: number | null;
  tokensPerDayLimit: number | null;
  requestsToday: number;
  tokensToday: number;
};

export type RouteDecision = {
  taskType: TaskType;
  provider: ProviderId;
  model: string;
  maxTokens: number;
  temperature: number;
  usesRealApi: boolean;
};

export type GuardAssessment = {
  canRun: boolean;
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  apiCallCount: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  requestsPerMinute: number;
  requestsPerDay: number;
  tokensPerDay: number;
  message: string;
};

export type RoutingTimelineEntry = {
  step: string;
  taskType: TaskType;
  provider: ProviderId;
  model: string;
  timestamp: string;
};

export type ProviderUsageEntry = {
  id: string;
  provider: ProviderId;
  model: string;
  taskType: TaskType;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  timestamp: string;
};

export type TournamentRoutingMeta = {
  runtimeMode: TournamentRuntimeMode;
  guard: GuardAssessment | null;
  routingTimeline: RoutingTimelineEntry[];
  providerUsage: ProviderUsageEntry[];
  costSavedEstimateUsd: number;
  agentModels: Record<string, string>;
};

export const RUNTIME_MODE_LABELS: Record<TournamentRuntimeMode, string> = {
  mock: "Mock",
  groq_free: "Groq Free",
  hybrid_quality: "Hybrid Quality",
};

export const DEFAULT_RUNTIME_MODE: TournamentRuntimeMode = "groq_free";
