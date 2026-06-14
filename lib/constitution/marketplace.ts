import { promptStrategySummary } from "@/lib/constitution/scoring";
import type {
  AgentConstitution,
  ConstitutionMarketplaceCandidate,
  MarketplaceConstitutionItemType,
} from "@/lib/constitution/types";

function itemTypeForAgentType(
  agentType: AgentConstitution["agentType"],
): MarketplaceConstitutionItemType {
  switch (agentType) {
    case "judge":
      return "judge_constitution";
    case "creator":
      return "challenge_creator_constitution";
    default:
      return "agent_constitution";
  }
}

export function constitutionToMarketplaceCandidate(
  c: AgentConstitution,
  tournamentScore: number,
  status: ConstitutionMarketplaceCandidate["status"] = "seed",
): ConstitutionMarketplaceCandidate {
  const itemType = itemTypeForAgentType(c.agentType);
  const slugBase = c.agentId.replace(/_/g, "-");

  return {
    id: `mkt-const-${c.id}`,
    itemType,
    title: `${c.agentName} Constitution ${c.version}`,
    agentId: c.agentId,
    agentName: c.agentName,
    constitutionId: c.constitutionId,
    version: c.version,
    versionId: c.id,
    constitutionScore: c.constitutionScore,
    tournamentScore,
    promptStrategySummary: promptStrategySummary(c),
    suggestedPriceUsd: Math.round((12 + c.constitutionScore * 0.35 + tournamentScore * 0.08) * 100) / 100,
    status,
    createdAt: new Date().toISOString(),
  };
}

export function buildPolicyMarketplaceItems(
  constitution: AgentConstitution,
): ConstitutionMarketplaceCandidate[] {
  const base = {
    agentId: constitution.agentId,
    agentName: constitution.agentName,
    constitutionId: constitution.constitutionId,
    version: constitution.version,
    versionId: constitution.id,
    constitutionScore: constitution.constitutionScore,
    tournamentScore: constitution.constitutionScore,
    status: "seed" as const,
    createdAt: new Date().toISOString(),
  };

  return [
    {
      ...base,
      id: `mkt-cost-${constitution.id}`,
      itemType: "cost_policy",
      title: `${constitution.agentName} Cost Policy ${constitution.version}`,
      promptStrategySummary: constitution.costPolicy.slice(0, 120),
      suggestedPriceUsd: 9.0,
    },
    {
      ...base,
      id: `mkt-tool-${constitution.id}`,
      itemType: "tool_policy",
      title: `${constitution.agentName} Tool Policy ${constitution.version}`,
      promptStrategySummary: constitution.toolUsagePolicy.slice(0, 120),
      suggestedPriceUsd: 7.5,
    },
    {
      ...base,
      id: `mkt-rubric-${constitution.id}`,
      itemType: "evaluation_rubric",
      title: `${constitution.agentName} Evaluation Rubric ${constitution.version}`,
      promptStrategySummary: constitution.evaluationPreference.slice(0, 120),
      suggestedPriceUsd: 11.0,
    },
  ];
}

export function promoteHighPerformers(
  constitutions: AgentConstitution[],
  minScore = 80,
  minTournamentScore = 72,
): ConstitutionMarketplaceCandidate[] {
  return constitutions
    .filter((c) => c.constitutionScore >= minScore)
    .map((c) =>
      constitutionToMarketplaceCandidate(c, minTournamentScore + c.constitutionScore * 0.1, "review"),
    );
}
