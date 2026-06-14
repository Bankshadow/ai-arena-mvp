import { getComponentById } from "@/lib/marketplace/mock-catalog";
import type { WorkflowStack } from "@/lib/marketplace/types";

export function estimateStackMetrics(stack: WorkflowStack): {
  estimated_cost_usd: number;
  estimated_quality_score: number;
} {
  let cost = 0;
  let qualitySum = 0;
  let count = 0;

  for (const entry of stack.components) {
    const c = getComponentById(entry.component_id);
    if (!c) continue;
    cost += c.proof.avg_cost_usd;
    qualitySum += c.proof.avg_score;
    count += 1;
  }

  return {
    estimated_cost_usd: Math.round(cost * 10000) / 10000,
    estimated_quality_score: count > 0 ? Math.round(qualitySum / count) : 0,
  };
}

export function applyStackEstimates(stack: WorkflowStack): WorkflowStack {
  const { estimated_cost_usd, estimated_quality_score } = estimateStackMetrics(stack);
  return {
    ...stack,
    estimated_cost_usd,
    estimated_quality_score,
  };
}
