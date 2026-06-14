import type { AgentConstitution } from "@/lib/constitution/types";

/** Heuristic constitution completeness + design quality score (0–100). */
export function computeConstitutionScore(c: AgentConstitution): number {
  let score = 40;

  if (c.roleDefinition.length > 40) score += 5;
  if (c.primaryGoal.length > 20) score += 5;
  if (c.behaviorRules.length >= 3) score += 5;
  if (c.behaviorRules.length >= 4) score += 3;
  if (c.outputFormatContract.length > 30) score += 5;
  if (c.selfReviewProtocol.length > 20) score += 5;
  if (c.refusalOrSkipRules.length >= 1) score += 3;
  if (c.toolUsagePolicy.length > 15) score += 3;
  if (c.costPolicy.includes("$")) score += 3;
  if (c.tokenPolicy.includes("token")) score += 3;
  if (c.riskPolicy.length > 20) score += 3;
  if (c.evaluationPreference.length > 15) score += 3;
  if (c.marketplacePositioning.length > 20) score += 2;

  return Math.min(100, score);
}

export function promptStrategySummary(c: AgentConstitution): string {
  const tools = c.toolUsagePolicy.toLowerCase().includes("no external")
    ? "no tools"
    : "tool-enabled";
  const cost = c.costPolicy.match(/\$[\d.]+/)?.[0] ?? "cost-capped";
  return `${c.version} · ${tools} · ${cost} · ${c.behaviorRules.length} rules · ${c.evaluationPreference.slice(0, 48)}…`;
}
