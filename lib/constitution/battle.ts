import { seeded } from "@/lib/tournament/engine-mock";
import {
  getConstitutionRecordByAgentId,
  getConstitutionVersion,
} from "@/lib/constitution/mock-data";
import { promptStrategySummary } from "@/lib/constitution/scoring";
import type {
  ConstitutionBattle,
  ConstitutionBattleResult,
  ConstitutionBattleResultEntry,
  ConstitutionVersionLabel,
} from "@/lib/constitution/types";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type RunConstitutionBattleInput = {
  agentId: string;
  versions: ConstitutionVersionLabel[];
  challengeTitle?: string;
  challengeBrief?: string;
};

/** Mock System Prompt Battle — same challenge, multiple constitution versions. */
export function runConstitutionBattle(input: RunConstitutionBattleInput): ConstitutionBattleResult {
  const record = getConstitutionRecordByAgentId(input.agentId);
  if (!record) {
    throw new Error(`No constitution record for agent ${input.agentId}`);
  }

  const challengeTitle = input.challengeTitle ?? "Q4 Board Risk Brief";
  const challengeBrief =
    input.challengeBrief ??
    "Produce a structured executive summary from the provided board packet excerpt.";

  const battle: ConstitutionBattle = {
    id: newId(),
    type: "system_prompt_battle",
    title: `System Prompt Battle · ${record.agentName}`,
    agentId: record.agentId,
    agentName: record.agentName,
    challengeTitle,
    challengeBrief,
    versionIds: [],
    status: "complete",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  const entries: ConstitutionBattleResultEntry[] = input.versions.map((ver, i) => {
    const constitution = getConstitutionVersion(record, ver);
    if (!constitution) throw new Error(`Version ${ver} not found`);

    battle.versionIds.push(constitution.id);

    const base = 62 + constitution.constitutionScore * 0.25;
    const variance = seeded(i + ver.length * 7) * 12;
    const totalScore = Math.round(Math.min(98, base + variance));
    const qualityScore = Math.round(totalScore * 0.62);
    const efficiencyScore = Math.round(totalScore * 0.38);

    return {
      id: newId(),
      battleId: battle.id,
      constitutionId: record.id,
      version: ver,
      versionId: constitution.id,
      agentName: record.agentName,
      totalScore,
      qualityScore,
      efficiencyScore,
      constitutionScore: constitution.constitutionScore,
      tokensOut: Math.round(750 + seeded(i) * 400 - constitution.constitutionScore * 2),
      costUsd: Math.round((0.001 + seeded(i + 3) * 0.003) * 10000) / 10000,
      rank: 0,
      promptStrategySummary: promptStrategySummary(constitution),
    };
  });

  entries.sort((a, b) => b.totalScore - a.totalScore);
  entries.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  const winner = entries[0]!;
  const marketplaceCandidateIds = winner.totalScore >= 75 ? [`mkt-const-${winner.versionId}`] : [];

  return {
    battle,
    entries,
    winnerVersionId: winner.versionId,
    winnerVersion: winner.version,
    marketplaceCandidateIds,
  };
}

export function getDefaultLeanBattle(): ConstitutionBattleResult {
  return runConstitutionBattle({
    agentId: "lean",
    versions: ["v1.0", "v1.1", "v1.2"],
  });
}
