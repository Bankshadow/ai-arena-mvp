import { evaluateAgentRunsMock, newId } from "@/lib/tournament/engine-mock";
import { efficiencyScoresForRun } from "@/lib/tournament/judge/efficiency-scores";
import {
  buildFinalJudgePrompt,
  parseFinalJudgeResponse,
} from "@/lib/tournament/judge/final-judge-prompt";
import { modelRouter } from "@/lib/tournament/router/model-router";
import { executeRoutedTask } from "@/lib/tournament/router/execute-routed-task";
import { breakdownEvaluation } from "@/lib/tournament/scoring";
import type {
  GuardAssessment,
  ProviderUsageEntry,
  RoutingTimelineEntry,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";
import type { ProviderUsageLogger } from "@/lib/tournament/usage/usage-logger";
import type { AgentRun, Challenge, Evaluation } from "@/lib/tournament/types";

export type HybridEvalContext = {
  tournamentId: string;
  round: number;
  runtimeMode: TournamentRuntimeMode;
  usage: ProviderUsageEntry[];
  timeline: RoutingTimelineEntry[];
  logger?: ProviderUsageLogger;
  guard?: GuardAssessment | null;
};

function shouldUseFinalJudge(runtimeMode: TournamentRuntimeMode, guard?: GuardAssessment | null): boolean {
  if (runtimeMode !== "hybrid_quality") return false;
  if (guard?.recommendedAction === "skip_final_judge") return false;
  const decision = modelRouter.route("final_judge", runtimeMode);
  return decision.usesRealApi;
}

/** Hybrid evaluation: mock/heuristic in groq_free; Anthropic/OpenAI final judge in hybrid_quality. */
export async function evaluateAgentRunsHybrid(
  runs: AgentRun[],
  challenge: Challenge,
  round: number,
  ctx: HybridEvalContext,
): Promise<Evaluation[]> {
  if (!shouldUseFinalJudge(ctx.runtimeMode, ctx.guard)) {
    return evaluateAgentRunsMock(runs, challenge, round);
  }

  const decision = modelRouter.route("final_judge", ctx.runtimeMode);
  const evaluations: Evaluation[] = [];

  for (const run of runs) {
    try {
      const prompt = buildFinalJudgePrompt(run, challenge);
      const { text } = await executeRoutedTask({
        taskType: "final_judge",
        runtimeMode: ctx.runtimeMode,
        system: prompt.system,
        user: prompt.user,
        step: `Final judge · ${run.agentName}`,
        jsonMode: true,
        usage: ctx.usage,
        timeline: ctx.timeline,
        logger: ctx.logger,
        tournamentId: ctx.tournamentId,
        round: ctx.round,
        agentId: run.agentId,
      });

      const q = parseFinalJudgeResponse(text);
      const eff = efficiencyScoresForRun(run, runs, challenge);
      const scores = {
        accuracy: q.accuracy,
        completeness: q.completeness,
        structure: q.structure,
        usefulness: q.usefulness,
        formatCompliance: q.formatCompliance,
        costEfficiency: eff.costEfficiency,
        tokenEfficiency: eff.tokenEfficiency,
        latency: eff.latency,
        workflowSimplicity: eff.workflowSimplicity,
        reusability: q.reusability,
        enterpriseValue: q.enterpriseValue,
        repeatability: q.repeatability,
        hallucinationPenalty: q.hallucinationPenalty,
        costLimitPenalty: eff.costLimitPenalty,
        missingOutputPenalty: q.missingOutputPenalty,
        badFormattingPenalty: q.badFormattingPenalty,
      };

      const breakdown = breakdownEvaluation(scores);
      evaluations.push({
        id: newId(),
        runId: run.id,
        agentId: run.agentId,
        agentName: run.agentName,
        qualityJudgeNotes: `${q.qualityJudgeNotes} (${decision.provider}/${decision.model})`,
        efficiencyJudgeNotes: eff.efficiencyJudgeNotes,
        scores,
        ...breakdown,
        passed: breakdown.totalScore >= challenge.passThreshold,
        ...(run.constitutionVersion
          ? {
              constitutionVersion: run.constitutionVersion,
              constitutionVersionId: run.constitutionVersionId,
            }
          : {}),
      });
    } catch {
      const mockOne = evaluateAgentRunsMock([run], challenge, round)[0];
      if (mockOne) {
        evaluations.push({
          ...mockOne,
          qualityJudgeNotes: `${mockOne.qualityJudgeNotes} (final judge fallback — mock)`,
        });
      }
    }
  }

  return evaluations;
}

export function finalJudgeLabel(runtimeMode: TournamentRuntimeMode, guard?: GuardAssessment | null): string {
  if (!shouldUseFinalJudge(runtimeMode, guard)) {
    if (runtimeMode === "hybrid_quality") return "mock-final (no premium key or guard skip)";
    return "mock-heuristic";
  }
  const d = modelRouter.route("final_judge", runtimeMode);
  return `${d.provider}-final (${d.model})`;
}
