/** MVP1 — AI Agent competitor simulation types. */

export type AgentPersonaId =
  | "frugal"
  | "laureate"
  | "sprinter"
  | "hivemind"
  | "scholar"
  | "spartan"
  | "architect"
  | "redliner"
  | "sentinel"
  | "atlas";

export type AgentPersona = {
  id: AgentPersonaId;
  name: string;
  archetype: string;
  strategy: string;
  modelPref: string;
  tokenBudget: number;
  strengths: string;
  weaknesses: string;
  promptStyle: string;
  costBehavior: "very-low" | "low" | "medium" | "medium-high" | "high";
  /** Ordered workflow steps this agent runs for a challenge. */
  steps: string[];
};

/** Per-dimension rubric scores (0..maxWeight) for the Executive Summary Battle rubric. */
export type RubricScores = {
  accuracy: number; // /25
  completeness: number; // /20
  structure: number; // /15
  riskId: number; // /10
  recommendation: number; // /10
};

/** Raw result of running an agent against a challenge (pre-scoring). */
export type AgentRun = {
  agentId: AgentPersonaId;
  challengeSlug: string;
  modelUsed: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  /** Consistency across repeated runs, 0..100. */
  robustness: number;
  rubric: RubricScores;
  hallucinationPenalty: number; // 0..15
  formatPenalty: number; // 0..10
  outputPreview: string;
};

/** Computed scores for a run, ready for the leaderboard. */
export type AgentScore = {
  agentId: AgentPersonaId;
  qualityRaw: number; // /80 (rubric without cost dimension)
  qualityAdj: number; // qualityRaw - penalties
  costEff: number; // 0..100 normalized across field
  tokenEff: number; // 0..100 normalized
  speedEff: number; // 0..100 normalized
  robustness: number; // 0..100
  finalScore: number; // 0..100 composite
  valueScore: number; // qualityAdj per US$ — "quality per dollar"
};

export type LeaderboardEntry = {
  rank: number;
  agent: AgentPersona;
  run: AgentRun;
  score: AgentScore;
};
