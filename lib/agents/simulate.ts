import { AGENT_PERSONAS, getAgentById } from "@/lib/agents/personas";
import { scoreField } from "@/lib/agents/scoring";
import type {
  AgentPersonaId,
  AgentRun,
  LeaderboardEntry,
} from "@/lib/agents/types";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";

/**
 * Deterministic MVP1 simulation of all 10 agents on Executive Summary Battle #1.
 * These numbers are hand-tuned to tell the core story: Laureate tops raw
 * quality, but Frugal and Scholar win on quality-per-dollar (value). When the
 * backend lands, replace this with real Workflow Runner output — the scoring
 * pipeline downstream stays identical.
 */
const SIM: Record<
  AgentPersonaId,
  Omit<AgentRun, "agentId" | "challengeSlug" | "modelUsed">
> = {
  frugal: {
    tokensIn: 2200, tokensOut: 700, costUsd: 0.04, latencyMs: 2600, robustness: 82,
    rubric: { accuracy: 19, completeness: 14, structure: 11, riskId: 5, recommendation: 6 },
    hallucinationPenalty: 4, formatPenalty: 2,
    outputPreview: "Concise 5-section summary. Covers the headline numbers but risk section is thin.",
  },
  laureate: {
    tokensIn: 18000, tokensOut: 5200, costUsd: 0.86, latencyMs: 19500, robustness: 94,
    rubric: { accuracy: 24, completeness: 19, structure: 15, riskId: 9, recommendation: 9 },
    hallucinationPenalty: 1, formatPenalty: 0,
    outputPreview: "Polished, board-ready summary. Self-critique caught two missing risks.",
  },
  sprinter: {
    tokensIn: 3800, tokensOut: 1100, costUsd: 0.09, latencyMs: 1400, robustness: 80,
    rubric: { accuracy: 20, completeness: 15, structure: 13, riskId: 6, recommendation: 7 },
    hallucinationPenalty: 3, formatPenalty: 1,
    outputPreview: "Fast, format-locked output. Good structure, moderate depth.",
  },
  hivemind: {
    tokensIn: 21000, tokensOut: 6000, costUsd: 0.78, latencyMs: 16000, robustness: 91,
    rubric: { accuracy: 23, completeness: 19, structure: 14, riskId: 9, recommendation: 8 },
    hallucinationPenalty: 2, formatPenalty: 1,
    outputPreview: "Balanced coverage from specialist sub-agents; aggregator merged cleanly.",
  },
  scholar: {
    tokensIn: 9000, tokensOut: 2400, costUsd: 0.21, latencyMs: 7800, robustness: 90,
    rubric: { accuracy: 24, completeness: 17, structure: 13, riskId: 8, recommendation: 8 },
    hallucinationPenalty: 0, formatPenalty: 1,
    outputPreview: "Every claim cited to a source passage. Lowest hallucination of the field.",
  },
  spartan: {
    tokensIn: 1500, tokensOut: 600, costUsd: 0.03, latencyMs: 2200, robustness: 70,
    rubric: { accuracy: 17, completeness: 12, structure: 9, riskId: 4, recommendation: 5 },
    hallucinationPenalty: 5, formatPenalty: 6,
    outputPreview: "Cheapest run, but free-form output ignored the required section headings.",
  },
  architect: {
    tokensIn: 11000, tokensOut: 3400, costUsd: 0.34, latencyMs: 9500, robustness: 88,
    rubric: { accuracy: 22, completeness: 19, structure: 15, riskId: 8, recommendation: 8 },
    hallucinationPenalty: 2, formatPenalty: 0,
    outputPreview: "Plan-then-execute produced the most complete, well-structured layout.",
  },
  redliner: {
    tokensIn: 13500, tokensOut: 4100, costUsd: 0.41, latencyMs: 12000, robustness: 92,
    rubric: { accuracy: 24, completeness: 18, structure: 14, riskId: 8, recommendation: 8 },
    hallucinationPenalty: 1, formatPenalty: 1,
    outputPreview: "Two critique loops removed an inaccurate figure and tightened recommendations.",
  },
  sentinel: {
    tokensIn: 7500, tokensOut: 2200, costUsd: 0.18, latencyMs: 6800, robustness: 85,
    rubric: { accuracy: 21, completeness: 16, structure: 12, riskId: 10, recommendation: 6 },
    hallucinationPenalty: 2, formatPenalty: 1,
    outputPreview: "Best risk section in the field; recommendations were comparatively light.",
  },
  atlas: {
    tokensIn: 16000, tokensOut: 4800, costUsd: 0.69, latencyMs: 15000, robustness: 93,
    rubric: { accuracy: 23, completeness: 18, structure: 15, riskId: 9, recommendation: 10 },
    hallucinationPenalty: 1, formatPenalty: 0,
    outputPreview: "Governance-grade output with confidence levels and an audit trail.",
  },
};

/** Build the full set of agent runs for the default challenge. */
export function getAgentRuns(
  challengeSlug: string = DEFAULT_CHALLENGE_SLUG,
): AgentRun[] {
  return AGENT_PERSONAS.map((persona) => ({
    agentId: persona.id,
    challengeSlug,
    modelUsed: persona.modelPref,
    ...SIM[persona.id],
  }));
}

/** Scored, ranked leaderboard for the simulated battle. */
export function getAgentLeaderboard(
  challengeSlug: string = DEFAULT_CHALLENGE_SLUG,
): LeaderboardEntry[] {
  const runs = getAgentRuns(challengeSlug);
  const scores = scoreField(runs);

  return runs
    .map((run) => ({
      agent: getAgentById(run.agentId)!,
      run,
      score: scores.find((s) => s.agentId === run.agentId)!,
    }))
    .sort((a, b) => b.score.finalScore - a.score.finalScore)
    .map((entry, i) => ({ rank: i + 1, ...entry }));
}

/** Single ranked entry for an agent's submission detail page. */
export function getAgentEntry(
  agentId: string,
  challengeSlug: string = DEFAULT_CHALLENGE_SLUG,
): LeaderboardEntry | undefined {
  return getAgentLeaderboard(challengeSlug).find((e) => e.agent.id === agentId);
}
