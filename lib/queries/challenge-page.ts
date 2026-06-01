import {
  buildChallengeView,
  challengeStatusLabel,
  type ChallengeView,
} from "@/lib/challenges/view-model";
import { hasDatabaseUrl } from "@/lib/env";
import { getChallengeBySlug } from "@/lib/queries/challenges";
import { getChallengeSubmissionStats } from "@/lib/queries/stats";

export type ChallengePageData = {
  view: ChallengeView;
  dbAvailable: boolean;
  statusLabel: string;
  submissionCount: number;
  uniquePlayers: number;
  scoredCount: number;
};

export async function getChallengePageData(slug: string): Promise<ChallengePageData> {
  const fallbackView = buildChallengeView(null);

  if (!hasDatabaseUrl()) {
    return {
      view: fallbackView,
      dbAvailable: false,
      statusLabel: challengeStatusLabel(fallbackView.status),
      submissionCount: 0,
      uniquePlayers: 0,
      scoredCount: 0,
    };
  }

  try {
    const challenge = await getChallengeBySlug(slug);
    if (!challenge) {
      return {
        view: fallbackView,
        dbAvailable: false,
        statusLabel: challengeStatusLabel(fallbackView.status),
        submissionCount: 0,
        uniquePlayers: 0,
        scoredCount: 0,
      };
    }

    const view = buildChallengeView(challenge);
    const stats = await getChallengeSubmissionStats(challenge.id);

    return {
      view,
      dbAvailable: true,
      statusLabel: challengeStatusLabel(view.status),
      submissionCount: stats.submissionCount,
      uniquePlayers: stats.uniqueSubmitters,
      scoredCount: stats.scoredCount,
    };
  } catch {
    return {
      view: fallbackView,
      dbAvailable: false,
      statusLabel: challengeStatusLabel(fallbackView.status),
      submissionCount: 0,
      uniquePlayers: 0,
      scoredCount: 0,
    };
  }
}
