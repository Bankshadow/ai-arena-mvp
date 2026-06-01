export type LandingLeaderboardRow = {
  rank: number;
  player: string;
  quality: string | number;
  cost: string;
  score: string;
  isYou?: boolean;
};

export type LandingPageData = {
  dbAvailable: boolean;
  challengeOpen: boolean;
  challengeStatus: string;
  challengeName: string;
  challengeSlug: string;
  betaSlotsTotal: number;
  betaSlotsClaimed: number;
  submissionCount: number;
  uniquePlayers: number;
  challengeDetails: { label: string; value: string }[];
  leaderboardPreview: LandingLeaderboardRow[];
  statusLabel: string;
};
