/** Mock platform proof metrics — no API calls. */
export const MOCK_PROOF_METRICS = {
  tournamentRounds: 12,
  agentBattles: 847,
  marketplaceCandidates: 4,
  componentsPublished: 28,
  avgCostSavedUsd: 0.42,
  memoryLessons: 156,
} as const;

export type ProofMetricKey = keyof typeof MOCK_PROOF_METRICS;
