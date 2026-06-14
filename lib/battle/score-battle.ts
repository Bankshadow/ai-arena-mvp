import { QUALITY_MAX, sumRubric } from "@/lib/agents/scoring";
import type { AgentPersonaId, AgentRun } from "@/lib/agents/types";
import type { GeneratedChallenge } from "@/lib/challenge/types";
import type { BattleAgentResult, BattleResult } from "@/lib/battle/types";

export function computeQualityAdj(run: AgentRun): number {
  const raw = (sumRubric(run.rubric) / QUALITY_MAX) * 100;
  return Math.max(0, Math.round(raw - run.hallucinationPenalty - run.formatPenalty));
}

export function totalTokens(run: AgentRun): number {
  return run.tokensIn + run.tokensOut;
}

type ScoredRun = {
  agentId: AgentPersonaId;
  run: AgentRun;
  fullOutput: string;
};

/**
 * Token-first battle scoring:
 * 1. Quality gate — must meet passThreshold (qualityAdj)
 * 2. Rank passers by total tokens ascending (lowest wins)
 */
export function scoreBattle(
  challenge: GeneratedChallenge,
  results: ScoredRun[],
): BattleResult {
  const entries: BattleAgentResult[] = results.map(({ agentId, run, fullOutput }) => {
    const qualityAdj = computeQualityAdj(run);
    const tokens = totalTokens(run);
    const passed = qualityAdj >= challenge.passThreshold;

    return {
      agentId,
      run,
      fullOutput,
      qualityAdj,
      totalTokens: tokens,
      passed,
      rank: null,
      failReason: passed
        ? undefined
        : `Quality ${qualityAdj} below pass threshold ${challenge.passThreshold}`,
    };
  });

  const passers = [...entries]
    .filter((e) => e.passed)
    .sort((a, b) => a.totalTokens - b.totalTokens || a.qualityAdj - b.qualityAdj);

  passers.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  const winner = passers[0] ?? null;

  const ranked = [...entries].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? -1 : 1;
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
    return b.qualityAdj - a.qualityAdj;
  });

  return {
    challenge,
    entries: ranked,
    winner,
    passedCount: passers.length,
  };
}
