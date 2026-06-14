import { constitutionToMarketplaceCandidate } from "@/lib/constitution/marketplace";
import {
  getConstitutionRecordByAgentId,
  getCurrentConstitution,
} from "@/lib/constitution/mock-data";
import { promptStrategySummary } from "@/lib/constitution/scoring";
import type {
  AgentConstitutionUsage,
  ConstitutionMarketplaceCandidate,
  ConstitutionVersionLabel,
  TournamentConstitutionMeta,
  TournamentType,
} from "@/lib/constitution/types";
import type { CompetitorAgentId, Evaluation, TournamentState } from "@/lib/tournament/types";
import { ALL_COMPETITOR_IDS } from "@/lib/tournament/agents";

export function buildAgentConstitutionUsage(
  agentId: string,
  version?: ConstitutionVersionLabel,
): AgentConstitutionUsage | null {
  const record = getConstitutionRecordByAgentId(agentId);
  if (!record) return null;

  const constitution = version
    ? record.versions.find((v) => v.version === version) ?? getCurrentConstitution(record)
    : getCurrentConstitution(record);

  return {
    agentId,
    agentName: record.agentName,
    constitutionId: record.id,
    versionId: constitution.id,
    version: constitution.version,
    constitutionScore: constitution.constitutionScore,
    promptStrategySummary: promptStrategySummary(constitution),
  };
}

export function buildDefaultConstitutionMeta(
  tournamentType: TournamentType = "standard",
): TournamentConstitutionMeta {
  const usages: AgentConstitutionUsage[] = ALL_COMPETITOR_IDS.map((id) =>
    buildAgentConstitutionUsage(id),
  ).filter((u): u is AgentConstitutionUsage => u !== null);

  const constitutionScores: Record<string, number> = {};
  const promptStrategySummaries: Record<string, string> = {};

  for (const u of usages) {
    constitutionScores[u.agentId] = u.constitutionScore;
    promptStrategySummaries[u.agentId] = u.promptStrategySummary;
  }

  return {
    tournamentType,
    usages,
    winningConstitutionId: null,
    winningVersion: null,
    winningVersionId: null,
    constitutionScores,
    promptStrategySummaries,
    lastDiffId: null,
    marketplaceCandidateIds: [],
  };
}

export function buildSystemPromptBattleMeta(
  agentId: string,
  versions: ConstitutionVersionLabel[],
): TournamentConstitutionMeta {
  const usages = versions
    .map((v) => buildAgentConstitutionUsage(agentId, v))
    .filter((u): u is AgentConstitutionUsage => u !== null);

  const constitutionScores: Record<string, number> = {};
  const promptStrategySummaries: Record<string, string> = {};

  for (const u of usages) {
    constitutionScores[u.versionId] = u.constitutionScore;
    promptStrategySummaries[u.versionId] = u.promptStrategySummary;
  }

  return {
    tournamentType: "system_prompt_battle",
    usages,
    winningConstitutionId: null,
    winningVersion: null,
    winningVersionId: null,
    constitutionScores,
    promptStrategySummaries,
    lastDiffId: null,
    marketplaceCandidateIds: [],
  };
}

export function finalizeConstitutionMetaFromEvaluations(
  meta: TournamentConstitutionMeta,
  evaluations: Evaluation[],
): TournamentConstitutionMeta {
  if (evaluations.length === 0) return meta;

  const best = [...evaluations].sort((a, b) => b.totalScore - a.totalScore)[0]!;
  const usage = meta.usages.find((u) => u.agentId === best.agentId);

  const marketplaceCandidateIds: string[] = [];
  if (usage && best.totalScore >= 70) {
    const record = getConstitutionRecordByAgentId(best.agentId);
    const constitution = record
      ? record.versions.find((v) => v.id === usage.versionId) ?? getCurrentConstitution(record)
      : null;
    if (constitution) {
      marketplaceCandidateIds.push(
        constitutionToMarketplaceCandidate(constitution, best.totalScore).id,
      );
    }
  }

  return {
    ...meta,
    winningConstitutionId: usage?.constitutionId ?? null,
    winningVersion: usage?.version ?? null,
    winningVersionId: usage?.versionId ?? null,
    constitutionScores: {
      ...meta.constitutionScores,
      [best.agentId]: usage?.constitutionScore ?? meta.constitutionScores[best.agentId] ?? 0,
    },
    marketplaceCandidateIds: [...new Set([...meta.marketplaceCandidateIds, ...marketplaceCandidateIds])],
  };
}

export function attachConstitutionToRuns(state: TournamentState): TournamentState {
  const meta = state.constitution ?? buildDefaultConstitutionMeta();
  const usageByAgent = new Map(meta.usages.map((u) => [u.agentId, u]));

  const activeRuns = state.tournament.activeRuns.map((run) => {
    const usage = usageByAgent.get(run.agentId);
    if (!usage) return run;
    return {
      ...run,
      constitutionVersion: usage.version,
      constitutionVersionId: usage.versionId,
      constitutionId: usage.constitutionId,
      promptStrategySummary: usage.promptStrategySummary,
    };
  });

  return {
    ...state,
    tournament: { ...state.tournament, activeRuns },
    constitution: meta,
  };
}

export function getConstitutionForCompetitor(agentId: CompetitorAgentId) {
  return getConstitutionRecordByAgentId(agentId);
}
