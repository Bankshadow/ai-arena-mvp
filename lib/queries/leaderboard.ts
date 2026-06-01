import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/index";
import { challenges, scores, submissions } from "@/db/schema";
import type { LeaderboardEntry } from "@/lib/data/leaderboard";

export type LeaderboardData = {
  challengeName: string;
  challengeSlug: string;
  entries: LeaderboardEntry[];
  updatedAt: Date | null;
  totalScored: number;
};

type ScoredRow = {
  displayName: string;
  email: string;
  estimatedCostUsd: string;
  qualityScore: number;
  finalScore: string;
  scoredAt: Date;
};

function pickBestPerEmail(rows: ScoredRow[]): ScoredRow[] {
  const byEmail = new Map<string, ScoredRow>();

  for (const row of rows) {
    const existing = byEmail.get(row.email);
    if (!existing) {
      byEmail.set(row.email, row);
      continue;
    }

    const existingFinal = parseFloat(existing.finalScore);
    const rowFinal = parseFloat(row.finalScore);

    if (rowFinal > existingFinal) {
      byEmail.set(row.email, row);
    } else if (rowFinal === existingFinal) {
      const existingCost = parseFloat(existing.estimatedCostUsd);
      const rowCost = parseFloat(row.estimatedCostUsd);
      if (rowCost < existingCost) {
        byEmail.set(row.email, row);
      }
    }
  }

  return Array.from(byEmail.values());
}

function toEntries(rows: ScoredRow[]): LeaderboardEntry[] {
  const sorted = [...rows].sort((a, b) => {
    const scoreDiff = parseFloat(b.finalScore) - parseFloat(a.finalScore);
    if (scoreDiff !== 0) return scoreDiff;
    return parseFloat(a.estimatedCostUsd) - parseFloat(b.estimatedCostUsd);
  });

  return sorted.map((row, index) => ({
    rank: index + 1,
    player: row.displayName,
    qualityScore: row.qualityScore,
    cost: parseFloat(row.estimatedCostUsd),
    finalScore: parseFloat(row.finalScore),
  }));
}

export function formatLeaderboardUpdatedAt(date: Date | null): string {
  if (!date) return "No scores yet";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

export async function getLeaderboardByChallengeSlug(
  slug: string
): Promise<LeaderboardData | null> {
  const db = getDb();

  const [challenge] = await db
    .select({
      id: challenges.id,
      name: challenges.name,
      slug: challenges.slug,
    })
    .from(challenges)
    .where(eq(challenges.slug, slug))
    .limit(1);

  if (!challenge) return null;

  const rows = await db
    .select({
      displayName: submissions.displayName,
      email: submissions.email,
      estimatedCostUsd: submissions.estimatedCostUsd,
      qualityScore: scores.qualityScore,
      finalScore: scores.finalScore,
      scoredAt: scores.scoredAt,
    })
    .from(scores)
    .innerJoin(submissions, eq(scores.submissionId, submissions.id))
    .where(
      and(eq(submissions.challengeId, challenge.id), eq(submissions.status, "scored"))
    )
    .orderBy(desc(scores.finalScore));

  const best = pickBestPerEmail(rows);
  const entries = toEntries(best);
  const updatedAt =
    rows.length > 0
      ? rows.reduce(
          (latest, row) => (row.scoredAt > latest ? row.scoredAt : latest),
          rows[0].scoredAt
        )
      : null;

  return {
    challengeName: challenge.name,
    challengeSlug: challenge.slug,
    entries,
    updatedAt,
    totalScored: rows.length,
  };
}
