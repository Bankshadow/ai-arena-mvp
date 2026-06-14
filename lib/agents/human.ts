import { getAgentById } from "@/lib/agents/personas";
import { RUBRIC_MAX, scoreField } from "@/lib/agents/scoring";
import { getAgentRuns } from "@/lib/agents/simulate";
import type {
  AgentPersona,
  AgentPersonaId,
  AgentRun,
  LeaderboardEntry,
} from "@/lib/agents/types";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import type { JudgeResult } from "@/lib/judge/rubric-judge";

export const HUMAN_ID = "you" as AgentPersonaId;

export type HumanSubmission = {
  name: string;
  modelUsed: string;
  costUsd: number;
  output: string;
};

/** Synthetic persona so the human renders in the same UI as the agents. */
function humanPersona(sub: HumanSubmission): AgentPersona {
  return {
    id: HUMAN_ID,
    name: sub.name || "You",
    archetype: "Human challenger",
    strategy: "Your submitted workflow.",
    modelPref: sub.modelUsed,
    tokenBudget: 0,
    strengths: "—",
    weaknesses: "—",
    promptStyle: "—",
    costBehavior: "medium",
    steps: [],
  };
}

/** Heuristic quality estimate (0..100) from required-section coverage + length. */
function estimateQuality(output: string): number {
  const text = output.toLowerCase();
  let score = 50;
  if (text.includes("executive summary") || output.length > 200) score += 12;
  if (text.includes("risk")) score += 12;
  if (text.includes("recommend")) score += 12;
  if (text.includes("impact")) score += 6;
  if (output.length > 600) score += 4;
  if (output.length > 1200) score += 4;
  return Math.min(98, Math.max(40, score));
}

/** Turn a human submission into an AgentRun on the same scale as the agents. */
function toRun(sub: HumanSubmission, judged?: JudgeResult): AgentRun {
  const text = sub.output.toLowerCase();
  const base = {
    agentId: HUMAN_ID,
    challengeSlug: DEFAULT_CHALLENGE_SLUG,
    modelUsed: sub.modelUsed,
    tokensIn: Math.max(1500, Math.round(sub.costUsd * 30000)),
    tokensOut: Math.round(sub.output.length / 4),
    costUsd: Math.max(0.01, sub.costUsd),
    latencyMs: 6000,
    robustness: 75, // single attempt, unknown consistency
    outputPreview: sub.output.slice(0, 180) + (sub.output.length > 180 ? "…" : ""),
  };

  if (judged) {
    return {
      ...base,
      rubric: {
        accuracy: judged.accuracy,
        completeness: judged.completeness,
        structure: judged.structure,
        riskId: judged.riskId,
        recommendation: judged.recommendation,
      },
      hallucinationPenalty: judged.hallucinationPenalty,
      formatPenalty: judged.formatPenalty,
    };
  }

  const q = estimateQuality(sub.output);
  const f = q / 100;
  return {
    ...base,
    rubric: {
      accuracy: Math.round(RUBRIC_MAX.accuracy * f),
      completeness: Math.round(RUBRIC_MAX.completeness * f),
      structure: Math.round(RUBRIC_MAX.structure * f),
      riskId: text.includes("risk") ? Math.round(RUBRIC_MAX.riskId * f) : Math.round(RUBRIC_MAX.riskId * f * 0.5),
      recommendation: text.includes("recommend")
        ? Math.round(RUBRIC_MAX.recommendation * f)
        : Math.round(RUBRIC_MAX.recommendation * f * 0.5),
    },
    hallucinationPenalty: 2,
    formatPenalty: text.includes("executive summary") ? 0 : 4,
  };
}

export type HumanResult = {
  board: LeaderboardEntry[];
  you: LeaderboardEntry;
  beat: number; // how many agents you outranked
};

/**
 * Rank a human / internal submission against the agent field on the same
 * pipeline. Pass `agentIds` to compete only against a chosen subset (used by
 * the enterprise private-benchmark flow); omit to face the full field.
 */
export function rankHuman(
  sub: HumanSubmission,
  agentIds?: AgentPersonaId[],
  judged?: JudgeResult,
): HumanResult {
  const humanRun = toRun(sub, judged);
  const field = agentIds
    ? getAgentRuns().filter((r) => agentIds.includes(r.agentId))
    : getAgentRuns();
  const runs = [...field, humanRun];
  const scores = scoreField(runs);

  const board: LeaderboardEntry[] = runs
    .map((run) => ({
      agent: run.agentId === HUMAN_ID ? humanPersona(sub) : getAgentById(run.agentId)!,
      run,
      score: scores.find((s) => s.agentId === run.agentId)!,
    }))
    .sort((a, b) => b.score.finalScore - a.score.finalScore)
    .map((entry, i) => ({ rank: i + 1, ...entry }));

  const you = board.find((e) => e.agent.id === HUMAN_ID)!;
  const beat = board.length - you.rank;
  return { board, you, beat };
}
