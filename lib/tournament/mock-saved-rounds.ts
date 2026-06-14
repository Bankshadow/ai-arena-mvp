import type { TournamentListItem } from "@/lib/tournament/saved-tournament";
import { getSampleTournamentListItem, SAMPLE_TOURNAMENT_ROUND_ID } from "@/lib/tournament/sample-round";

export type TournamentHistoryRow = TournamentListItem & {
  costUsd: number;
  marketplaceCandidates: number;
  roundLabel: string;
  isDemo?: boolean;
};

const EXTRA_MOCK_ROUNDS: TournamentHistoryRow[] = [
  {
    id: "mock-tournament-round-6",
    tournamentId: "tournament-mock-6",
    round: 6,
    mode: "mock",
    challengeTitle: "Churn Rescue Playbook",
    winnerAgentId: "lean",
    winnerAgentName: "Lean Agent",
    winnerScore: 82.4,
    savedAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    costUsd: 0.011,
    marketplaceCandidates: 2,
    roundLabel: "Round 6",
    isDemo: true,
  },
  {
    id: "mock-tournament-round-5",
    tournamentId: "tournament-mock-5",
    round: 5,
    mode: "live",
    challengeTitle: "Incident Postmortem Summary",
    winnerAgentId: "premium",
    winnerAgentName: "Premium Agent",
    winnerScore: 89.7,
    savedAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
    costUsd: 0.034,
    marketplaceCandidates: 3,
    roundLabel: "Round 5",
    isDemo: true,
  },
];

export function getMockTournamentHistory(): TournamentHistoryRow[] {
  const sample = getSampleTournamentListItem();
  return [
    {
      ...sample,
      id: SAMPLE_TOURNAMENT_ROUND_ID,
      costUsd: 0.016,
      marketplaceCandidates: 2,
      roundLabel: `Round ${sample.round}`,
      isDemo: true,
    },
    ...EXTRA_MOCK_ROUNDS,
  ];
}

export function mergeWithMockTournamentRounds(
  items: TournamentListItem[],
): TournamentHistoryRow[] {
  const byId = new Map<string, TournamentHistoryRow>();
  for (const m of getMockTournamentHistory()) byId.set(m.id, m);
  for (const item of items) {
    byId.set(item.id, {
      ...item,
      costUsd: 0,
      marketplaceCandidates: 0,
      roundLabel: `Round ${item.round}`,
    });
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}
