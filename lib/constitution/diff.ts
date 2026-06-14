import type {
  AgentConstitution,
  ConstitutionDiffChange,
  ConstitutionVersionLabel,
  PromptDiff,
} from "@/lib/constitution/types";
import { CONSTITUTION_FIELDS as FIELDS } from "@/lib/constitution/types";

const IMPACT_HINTS: Partial<Record<string, string>> = {
  behaviorRules: "May change output structure and compliance behavior.",
  tokenPolicy: "Expected to shift token usage and cost efficiency scores.",
  costPolicy: "Direct impact on cost efficiency and pass rate under caps.",
  toolUsagePolicy: "Tool access changes can improve completeness at higher cost.",
  selfReviewProtocol: "Self-review changes often improve format compliance.",
  evaluationPreference: "Shifts optimization target — may trade cost for quality.",
  riskPolicy: "Affects hallucination penalties and confidence scoring.",
  outputFormatContract: "Format changes impact judge scores immediately.",
  modelProviderPolicy: "Provider routing affects latency and model badges.",
};

function stringifyValue(value: unknown): string {
  if (Array.isArray(value)) return value.join("\n• ");
  return String(value ?? "");
}

function listDiff(before: string[], after: string[]): ConstitutionDiffChange[] {
  const changes: ConstitutionDiffChange[] = [];
  const beforeSet = new Set(before);
  const afterSet = new Set(after);

  for (const item of after) {
    if (!beforeSet.has(item)) {
      changes.push({
        field: "behaviorRules",
        fieldLabel: "Behavior rule",
        changeType: "added",
        after: item,
        expectedImpact: IMPACT_HINTS.behaviorRules ?? "New constraint added.",
      });
    }
  }
  for (const item of before) {
    if (!afterSet.has(item)) {
      changes.push({
        field: "behaviorRules",
        fieldLabel: "Behavior rule",
        changeType: "removed",
        before: item,
        expectedImpact: "Removing a rule may increase variance or reduce guardrails.",
      });
    }
  }
  return changes;
}

export function compareConstitutions(
  from: AgentConstitution,
  to: AgentConstitution,
  actualImpacts?: Record<string, string>,
): PromptDiff {
  const changes: ConstitutionDiffChange[] = [];

  for (const field of FIELDS) {
    const beforeVal = from[field.key];
    const afterVal = to[field.key];

    if (field.list && Array.isArray(beforeVal) && Array.isArray(afterVal)) {
      const listChanges = listDiff(beforeVal, afterVal).map((c) => ({
        ...c,
        field: field.key,
        fieldLabel: field.label,
        expectedImpact: IMPACT_HINTS[field.key] ?? "List constraint changed.",
        actualImpact: actualImpacts?.[field.key],
      }));
      changes.push(...listChanges);
      continue;
    }

    const beforeStr = stringifyValue(beforeVal);
    const afterStr = stringifyValue(afterVal);
    if (beforeStr === afterStr) continue;

    changes.push({
      field: field.key,
      fieldLabel: field.label,
      changeType: "modified",
      before: beforeStr,
      after: afterStr,
      expectedImpact: IMPACT_HINTS[field.key] ?? "Operating spec changed.",
      actualImpact: actualImpacts?.[field.key],
    });
  }

  const added = changes.filter((c) => c.changeType === "added").length;
  const removed = changes.filter((c) => c.changeType === "removed").length;
  const modified = changes.filter((c) => c.changeType === "modified").length;

  return {
    id: `diff-${from.id}-${to.id}`,
    constitutionId: from.constitutionId,
    agentId: from.agentId,
    agentName: from.agentName,
    fromVersion: from.version as ConstitutionVersionLabel,
    toVersion: to.version as ConstitutionVersionLabel,
    changes,
    summary: `${added} added, ${removed} removed, ${modified} modified — ${from.version} → ${to.version}`,
    computedAt: new Date().toISOString(),
  };
}

export function getVersionActualImpacts(
  fromVersion: ConstitutionVersionLabel,
  toVersion: ConstitutionVersionLabel,
): Record<string, string> | undefined {
  if (fromVersion === "v1.0" && toVersion === "v1.1") {
    return {
      tokenPolicy: "Avg tokens −6% in mock tournaments; format compliance +4 pts.",
      selfReviewProtocol: "Missing section penalties reduced by 12% in Round 3 mock data.",
    };
  }
  if (fromVersion === "v1.1" && toVersion === "v1.2") {
    return {
      toolUsagePolicy: "Outline tool added +2 completeness pts at +$0.0002 avg cost.",
      evaluationPreference: "Total score +3.2 vs v1.1 on same challenge (mock battle).",
    };
  }
  return undefined;
}
