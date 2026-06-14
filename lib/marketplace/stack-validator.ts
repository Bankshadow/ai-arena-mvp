import { getComponentById } from "@/lib/marketplace/mock-catalog";
import type { CompatibilityWarning, MarketplaceComponent, WorkflowStack } from "@/lib/marketplace/types";

export function validateStack(stack: WorkflowStack): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  const components = stack.components
    .map((e) => getComponentById(e.component_id))
    .filter((c): c is MarketplaceComponent => !!c);

  const routers = components.filter((c) => c.type === "model_router");
  const agents = components.filter((c) => c.type === "agent_constitution");
  const judges = components.filter((c) => c.type === "judge_rubric");
  const costs = components.filter((c) => c.type === "cost_policy");

  if (agents.length > 0 && judges.length === 0) {
    warnings.push({
      severity: "warning",
      message: "Stack has agents but no judge rubric — tournament scoring may be incomplete.",
      component_ids: agents.map((a) => a.id),
    });
  }

  if (judges.length > 1) {
    warnings.push({
      severity: "warning",
      message: "Multiple judge rubrics may produce conflicting pass thresholds.",
      component_ids: judges.map((j) => j.id),
    });
  }

  for (const router of routers) {
    const groqOnly = router.compatible_providers.length === 1 && router.compatible_providers[0] === "groq";
    for (const agent of agents) {
      const agentAnthropic = agent.compatible_providers.includes("anthropic") && !agent.compatible_providers.includes("groq");
      if (groqOnly && agentAnthropic) {
        warnings.push({
          severity: "error",
          message: `Provider mismatch: ${router.title} is Groq-only but ${agent.title} prefers Anthropic.`,
          component_ids: [router.id, agent.id],
        });
      }
    }
  }

  for (const cost of costs) {
    const capMatch = cost.description.match(/\$([\d.]+)/);
    const cap = capMatch ? parseFloat(capMatch[1]!) : null;
    if (cap != null) {
      for (const agent of agents) {
        if (agent.proof.avg_cost_usd > cap) {
          warnings.push({
            severity: "warning",
            message: `${agent.title} avg cost ($${agent.proof.avg_cost_usd.toFixed(4)}) exceeds ${cost.title} cap ($${cap}).`,
            component_ids: [cost.id, agent.id],
          });
        }
      }
    }
  }

  if (components.length === 0) {
    warnings.push({
      severity: "info",
      message: "Stack is empty — browse components and add to stack.",
      component_ids: [],
    });
  }

  return warnings;
}
