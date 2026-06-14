import type { AgentPersonaId, AgentRun } from "@/lib/agents/types";
import { DEFAULT_BATTLE_AGENTS } from "@/lib/battle/constants";
import { scoreBattle } from "@/lib/battle/score-battle";
import type { BattleResult } from "@/lib/battle/types";
import type { GeneratedChallenge } from "@/lib/challenge/types";
import { applyJudgeToRun, judgeChallengeOutput } from "@/lib/judge/challenge-judge";
import { runAgent, type ChallengeRunContext } from "@/lib/runner/run-agent";

function toRunContext(challenge: GeneratedChallenge): ChallengeRunContext {
  return {
    slug: challenge.id,
    inputDoc: challenge.inputDoc,
    outputFormat: challenge.outputFormat,
    brief: challenge.brief,
  };
}

async function runAndJudgeAgent(
  agentId: AgentPersonaId,
  challenge: GeneratedChallenge,
): Promise<{ agentId: AgentPersonaId; run: AgentRun; fullOutput: string }> {
  const context = toRunContext(challenge);
  const { run, fullOutput } = await runAgent(agentId, challenge.id, context);
  const judged = await judgeChallengeOutput(fullOutput, challenge);
  return { agentId, run: applyJudgeToRun(run, judged), fullOutput };
}

/** Run 5 agents in parallel on the same generated challenge and rank by token efficiency. */
export async function runBattle(
  challenge: GeneratedChallenge,
  agentIds: AgentPersonaId[] = DEFAULT_BATTLE_AGENTS,
): Promise<BattleResult> {
  const agents = agentIds.slice(0, 5);
  if (agents.length < 5) {
    throw new Error("Battle requires exactly 5 agents");
  }

  const results = await Promise.all(agents.map((agentId) => runAndJudgeAgent(agentId, challenge)));
  return scoreBattle(challenge, results);
}
