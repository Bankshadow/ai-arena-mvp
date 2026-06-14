import type { AgentHealthComponents } from "@/lib/agent-hud/types";

/** Weights sum to 100; anomaly is a penalty subtracted (0–5). */
export const HEALTH_WEIGHTS = {
  performanceStability: 25,
  costEfficiency: 20,
  memoryFreshness: 15,
  errorRate: 15,
  toolReliability: 10,
  constitutionMaturity: 10,
  recentAnomalyPenaltyMax: 5,
} as const;

/** Input values are 0–1 normalized (errorRate: 1 = no errors). */
export function computeHealthScore(input: {
  performanceStability: number;
  costEfficiency: number;
  memoryFreshness: number;
  errorRate: number;
  toolReliability: number;
  constitutionMaturity: number;
  anomalySeverity?: number;
}): { score: number; components: AgentHealthComponents } {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const ps = clamp(input.performanceStability);
  const ce = clamp(input.costEfficiency);
  const mf = clamp(input.memoryFreshness);
  const er = clamp(input.errorRate);
  const tr = clamp(input.toolReliability);
  const cm = clamp(input.constitutionMaturity);
  const anomaly = clamp(input.anomalySeverity ?? 0);

  const components: AgentHealthComponents = {
    performanceStability: Math.round(ps * HEALTH_WEIGHTS.performanceStability * 10) / 10,
    costEfficiency: Math.round(ce * HEALTH_WEIGHTS.costEfficiency * 10) / 10,
    memoryFreshness: Math.round(mf * HEALTH_WEIGHTS.memoryFreshness * 10) / 10,
    errorRate: Math.round(er * HEALTH_WEIGHTS.errorRate * 10) / 10,
    toolReliability: Math.round(tr * HEALTH_WEIGHTS.toolReliability * 10) / 10,
    constitutionMaturity: Math.round(cm * HEALTH_WEIGHTS.constitutionMaturity * 10) / 10,
    recentAnomalyPenalty: Math.round(anomaly * HEALTH_WEIGHTS.recentAnomalyPenaltyMax * 10) / 10,
  };

  const raw =
    components.performanceStability +
    components.costEfficiency +
    components.memoryFreshness +
    components.errorRate +
    components.toolReliability +
    components.constitutionMaturity -
    components.recentAnomalyPenalty;

  return { score: Math.max(0, Math.min(100, Math.round(raw))), components };
}

export function healthTrend(
  current: number,
  previous: number,
): "up" | "down" | "stable" {
  const delta = current - previous;
  if (delta >= 3) return "up";
  if (delta <= -3) return "down";
  return "stable";
}
