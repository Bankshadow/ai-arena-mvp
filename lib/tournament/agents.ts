import type { Agent, CompetitorAgentId, CreatorAgentId, JudgeAgentId } from "@/lib/tournament/types";

export const CREATOR_AGENTS: Agent[] = [
  {
    id: "strategy",
    name: "Strategy Agent",
    role: "creator",
    specialty: "Board & GTM briefs",
    description: "Designs executive-facing challenges with strategic trade-offs.",
    accent: "violet",
  },
  {
    id: "technical",
    name: "Technical Agent",
    role: "creator",
    specialty: "Architecture & SRE",
    description: "Creates engineering-heavy scenarios with clear acceptance criteria.",
    accent: "cyan",
  },
  {
    id: "growth",
    name: "Growth Agent",
    role: "creator",
    specialty: "Funnel & retention",
    description: "Focuses on PLG, churn, and revenue efficiency problems.",
    accent: "emerald",
  },
];

export const COMPETITOR_AGENTS: Agent[] = [
  {
    id: "lean",
    name: "Lean Agent",
    role: "competitor",
    specialty: "Minimal tokens",
    description: "Single-pass Haiku workflow optimized for cost.",
    accent: "emerald",
  },
  {
    id: "premium",
    name: "Premium Agent",
    role: "competitor",
    specialty: "Max quality",
    description: "Opus draft → critique → rewrite pipeline.",
    accent: "violet",
  },
  {
    id: "rag",
    name: "RAG Agent",
    role: "competitor",
    specialty: "Grounded retrieval",
    description: "Retrieve → cite → summarize with source anchors.",
    accent: "cyan",
  },
  {
    id: "multi-agent",
    name: "Multi-Agent Agent",
    role: "competitor",
    specialty: "Specialist swarm",
    description: "Three sub-agents merge into one deliverable.",
    accent: "amber",
  },
  {
    id: "fast",
    name: "Fast Agent",
    role: "competitor",
    specialty: "Latency first",
    description: "Streaming single-shot with tight output cap.",
    accent: "rose",
  },
];

export const JUDGE_AGENTS: Agent[] = [
  {
    id: "quality",
    name: "Quality Judge",
    role: "judge",
    specialty: "Rubric accuracy",
    description: "Scores accuracy, completeness, structure, usefulness, format.",
    accent: "violet",
  },
  {
    id: "efficiency",
    name: "Efficiency Judge",
    role: "judge",
    specialty: "Cost & tokens",
    description: "Scores cost, token, latency, and workflow simplicity.",
    accent: "cyan",
  },
];

export function getCreator(id: CreatorAgentId): Agent {
  return CREATOR_AGENTS.find((a) => a.id === id)!;
}

export function getCompetitor(id: CompetitorAgentId): Agent {
  return COMPETITOR_AGENTS.find((a) => a.id === id)!;
}

export function getJudge(id: JudgeAgentId): Agent {
  return JUDGE_AGENTS.find((a) => a.id === id)!;
}

export const ALL_COMPETITOR_IDS: CompetitorAgentId[] = [
  "lean",
  "premium",
  "rag",
  "multi-agent",
  "fast",
];
