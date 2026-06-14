import type { AgentPersonaId } from "@/lib/agents/types";

/** Default 5 agents for token-efficiency battles — diverse strategies. */
export const DEFAULT_BATTLE_AGENTS: AgentPersonaId[] = [
  "frugal",
  "spartan",
  "sprinter",
  "scholar",
  "hivemind",
];

export const BATTLE_AGENT_COUNT = 5;
