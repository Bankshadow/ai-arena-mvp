import type { AgentPersonaId, AgentRun } from "@/lib/agents/types";
import type { GeneratedChallenge } from "@/lib/challenge/types";

export type BattleAgentResult = {
  agentId: AgentPersonaId;
  run: AgentRun;
  fullOutput: string;
  qualityAdj: number;
  totalTokens: number;
  passed: boolean;
  rank: number | null;
  failReason?: string;
};

export type BattleResult = {
  challenge: GeneratedChallenge;
  entries: BattleAgentResult[];
  winner: BattleAgentResult | null;
  passedCount: number;
};
