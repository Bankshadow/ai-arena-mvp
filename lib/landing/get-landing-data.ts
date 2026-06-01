import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import {
  buildChallengeDetailRows,
  buildChallengeView,
  challengeStatusLabel,
} from "@/lib/challenges/view-model";
import { EXECUTIVE_SUMMARY_BATTLE } from "@/lib/data/challenges";
import { formatCost } from "@/lib/data/leaderboard";
import { getChallengeBySlug } from "@/lib/queries/challenges";
import { getLeaderboardByChallengeSlug } from "@/lib/queries/leaderboard";
import { getChallengeSubmissionStats, getWaitlistCount } from "@/lib/queries/stats";

import type { LandingLeaderboardRow, LandingPageData } from "./types";

const BETA_SLOTS_TOTAL = 50;

function staticFallback(): LandingPageData {
  const view = buildChallengeView(null);
  return {
    dbAvailable: false,
    challengeOpen: false,
    challengeStatus: EXECUTIVE_SUMMARY_BATTLE.status,
    challengeName: view.name,
    challengeSlug: view.slug,
    betaSlotsTotal: BETA_SLOTS_TOTAL,
    betaSlotsClaimed: 0,
    submissionCount: 0,
    uniquePlayers: 0,
    challengeDetails: buildChallengeDetailRows(view),
    leaderboardPreview: [
      { rank: 1, player: "—", quality: "—", cost: "—", score: "Join Beta", isYou: true },
    ],
    statusLabel: challengeStatusLabel(view.status),
  };
}

function buildLeaderboardPreview(
  entries: { rank: number; player: string; qualityScore: number; cost: number; finalScore: number }[],
  challengeOpen: boolean
): LandingLeaderboardRow[] {
  const top: LandingLeaderboardRow[] = entries.slice(0, 3).map((e) => ({
    rank: e.rank,
    player: e.player,
    quality: e.qualityScore,
    cost: formatCost(e.cost),
    score: e.finalScore.toFixed(1),
  }));

  top.push({
    rank: top.length + 1,
    player: "You",
    quality: "—",
    cost: "—",
    score: challengeOpen ? "Submit entry" : "Join Beta",
    isYou: true,
  });

  if (top.length === 1) {
    return top;
  }

  return top;
}

export async function getLandingPageData(): Promise<LandingPageData> {
  try {
    const challenge = await getChallengeBySlug(DEFAULT_CHALLENGE_SLUG);
    if (!challenge) return staticFallback();

    const view = buildChallengeView(challenge);
    const [stats, waitlistCount, leaderboard] = await Promise.all([
      getChallengeSubmissionStats(challenge.id),
      getWaitlistCount(),
      getLeaderboardByChallengeSlug(DEFAULT_CHALLENGE_SLUG),
    ]);

    const betaSlotsClaimed = Math.min(BETA_SLOTS_TOTAL, waitlistCount);
    const entries = leaderboard?.entries ?? [];

    return {
      dbAvailable: true,
      challengeOpen: view.isOpen,
      challengeStatus: view.status,
      challengeName: view.name,
      challengeSlug: view.slug,
      betaSlotsTotal: BETA_SLOTS_TOTAL,
      betaSlotsClaimed,
      submissionCount: stats.submissionCount,
      uniquePlayers: entries.length || stats.uniqueSubmitters,
      challengeDetails: buildChallengeDetailRows(view),
      leaderboardPreview: buildLeaderboardPreview(entries, view.isOpen),
      statusLabel: challengeStatusLabel(view.status),
    };
  } catch {
    return staticFallback();
  }
}
