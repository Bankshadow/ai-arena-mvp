/** Tournament engine types — mock-first, Supabase-ready later. */

export type CreatorAgentId = "strategy" | "technical" | "growth";
export type CompetitorAgentId = "lean" | "premium" | "rag" | "multi-agent" | "fast";
export type JudgeAgentId = "quality" | "efficiency";

export type AgentRole = "creator" | "competitor" | "judge";

export type Agent = {
  id: string;
  name: string;
  role: AgentRole;
  specialty: string;
  description: string;
  accent: "cyan" | "violet" | "emerald" | "amber" | "rose";
};

export type ChallengeIdea = {
  id: string;
  creatorId: CreatorAgentId;
  creatorName: string;
  title: string;
  brief: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  noveltyScore: number;
  feasibilityScore: number;
  selectionScore: number;
  category?: string;
  marketplacePotential?: number;
  whyItMatters?: string;
};

export type Challenge = {
  id: string;
  title: string;
  brief: string;
  inputDoc: string;
  outputFormat: string;
  passThreshold: number;
  costLimitUsd: number;
  selectedFrom: CreatorAgentId;
  createdAt: string;
  category?: string;
  expectedOutput?: string;
  scoringRubric?: string;
  timeLimitMinutes?: number;
  selectedReason?: string;
};

export type TournamentPhase =
  | "idle"
  | "generating"
  | "selecting"
  | "running"
  | "judging"
  | "scoring"
  | "marketplace"
  | "complete";

export type Tournament = {
  id: string;
  round: number;
  phase: TournamentPhase;
  tournamentType?: import("@/lib/constitution/types").TournamentType;
  startedAt: string | null;
  completedAt: string | null;
  paused: boolean;
  nextRunAt: string | null;
  selectedChallenge: Challenge | null;
  challengeIdeas: ChallengeIdea[];
  activeRuns: AgentRun[];
  evaluations: Evaluation[];
};

export type AgentRun = {
  id: string;
  agentId: CompetitorAgentId;
  agentName: string;
  challengeId: string;
  modelUsed: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  workflowSteps: number;
  outputPreview: string;
  fullOutput: string;
  /** Agent constitution version used for this run */
  constitutionId?: string;
  constitutionVersionId?: string;
  constitutionVersion?: string;
  promptStrategySummary?: string;
};

export type EvaluationScores = {
  accuracy: number;
  completeness: number;
  structure: number;
  usefulness: number;
  formatCompliance: number;
  costEfficiency: number;
  tokenEfficiency: number;
  latency: number;
  workflowSimplicity: number;
  reusability: number;
  enterpriseValue: number;
  repeatability: number;
  hallucinationPenalty: number;
  costLimitPenalty: number;
  missingOutputPenalty: number;
  badFormattingPenalty: number;
};

export type Evaluation = {
  id: string;
  runId: string;
  agentId: CompetitorAgentId;
  agentName: string;
  qualityJudgeNotes: string;
  efficiencyJudgeNotes: string;
  scores: EvaluationScores;
  qualityScore: number;
  efficiencyScore: number;
  marketplaceScore: number;
  penaltyTotal: number;
  totalScore: number;
  passed: boolean;
  failReason?: string;
  gateFailed?: string;
  /** below_gate = valid output under pass threshold; fail = invalid/disqualified */
  gateOutcome?: "below_gate" | "fail";
  gateFailNote?: string;
  constitutionVersion?: string;
  constitutionVersionId?: string;
};

export type LeaderboardEntry = {
  rank: number;
  agentId: CompetitorAgentId;
  agentName: string;
  totalScore: number;
  wins: number;
  rounds: number;
  avgTokens: number;
  avgCost: number;
  trend: "up" | "down" | "flat";
  qualityScore?: number;
  efficiencyScore?: number;
  marketplaceScore?: number;
  penaltyTotal?: number;
};

export type MarketplaceCandidate = {
  id: string;
  tournamentId: string;
  round: number;
  agentId: CompetitorAgentId;
  agentName: string;
  challengeTitle: string;
  totalScore: number;
  marketplaceScore: number;
  reusability: number;
  enterpriseValue: number;
  repeatability: number;
  suggestedPriceUsd: number;
  status: "seed" | "review" | "listed";
  createdAt: string;
  /** Constitution marketplace extension */
  itemType?: import("@/lib/constitution/types").MarketplaceConstitutionItemType;
  constitutionId?: string;
  constitutionVersion?: string;
  promptStrategySummary?: string;
};

export type TournamentEventType =
  | "loop_started"
  | "challenges_generated"
  | "challenge_selected"
  | "agents_running"
  | "evaluation_complete"
  | "leaderboard_updated"
  | "marketplace_seeded"
  | "loop_complete"
  | "paused"
  | "resumed"
  | "manual_run"
  | "supabase_save_mock"
  | "supabase_save";

export type TournamentEvent = {
  id: string;
  tournamentId: string;
  round: number;
  type: TournamentEventType;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

export type TournamentState = {
  tournament: Tournament;
  leaderboard: LeaderboardEntry[];
  history: TournamentEvent[];
  marketplace: MarketplaceCandidate[];
  routing?: import("@/lib/tournament/routing/types").TournamentRoutingMeta;
  constitution?: import("@/lib/constitution/types").TournamentConstitutionMeta;
  memory?: import("@/lib/memory/types").TournamentMemoryMeta;
};

export type TournamentLoopResult = TournamentState;
