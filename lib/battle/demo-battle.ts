import { getAgentById } from "@/lib/agents/personas";
import { getAgentRuns } from "@/lib/agents/simulate";
import type { AgentPersonaId, AgentRun } from "@/lib/agents/types";
import { DEFAULT_BATTLE_AGENTS } from "@/lib/battle/constants";
import { scoreBattle } from "@/lib/battle/score-battle";
import type { BattleResult } from "@/lib/battle/types";
import type { GeneratedChallenge } from "@/lib/challenge/types";
import { applyJudgeToRun, judgeChallengeOutput } from "@/lib/judge/challenge-judge";

function buildMockOutput(challenge: GeneratedChallenge, agentId: AgentPersonaId): string {
  const name = getAgentById(agentId)?.name ?? agentId;
  return `## Executive Summary
${name} brief on "${challenge.title}": ${challenge.brief.slice(0, 280)}

## Key Risks
1. Pricing and competitive pressure described in the source document
2. Integration backlog and delivery timeline risk
3. Compliance and regulatory readiness gap

## Recommendations
1. Accelerate the top Q4 priority from the source material
2. Close engineering capacity gaps affecting delivery
3. Present a clear ROI narrative to leadership

(Demo output — add ANTHROPIC_API_KEY to .env.local for real LLM agent runs.)`;
}

/** Simulated battle using deterministic agent stats + heuristic judge (no API key). */
export async function runBattleDemo(
  challenge: GeneratedChallenge,
  agentIds: AgentPersonaId[] = DEFAULT_BATTLE_AGENTS,
): Promise<BattleResult> {
  const agents = agentIds.slice(0, 5);
  if (agents.length < 5) {
    throw new Error("Battle requires exactly 5 agents");
  }

  const simByAgent = new Map(
    getAgentRuns(challenge.id)
      .filter((r) => agents.includes(r.agentId))
      .map((r) => [r.agentId, r]),
  );

  const results = await Promise.all(
    agents.map(async (agentId) => {
      const base: AgentRun = simByAgent.get(agentId) ?? {
        agentId,
        challengeSlug: challenge.id,
        modelUsed: "demo",
        tokensIn: 3000,
        tokensOut: 900,
        costUsd: 0.08,
        latencyMs: 4000,
        robustness: 80,
        rubric: { accuracy: 18, completeness: 14, structure: 11, riskId: 6, recommendation: 6 },
        hallucinationPenalty: 2,
        formatPenalty: 1,
        outputPreview: "Demo run",
      };

      const fullOutput = buildMockOutput(challenge, agentId);
      const judged = await judgeChallengeOutput(fullOutput, challenge);
      const run = applyJudgeToRun(
        {
          ...base,
          agentId,
          challengeSlug: challenge.id,
          outputPreview: fullOutput.slice(0, 200).replace(/\n+/g, " ").trim(),
        },
        judged,
      );

      return { agentId, run, fullOutput };
    }),
  );

  return scoreBattle(challenge, results);
}
