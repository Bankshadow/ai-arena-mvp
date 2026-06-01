export type LeaderboardEntry = {
  rank: number;
  player: string;
  qualityScore: number;
  cost: number;
  finalScore: number;
};

export function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`;
}
