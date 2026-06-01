export type LeaderboardEntry = {
  rank: number;
  player: string;
  qualityScore: number;
  cost: number;
  costScore: number;
  finalScore: number;
  modelUsed: string;
};

export function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`;
}
