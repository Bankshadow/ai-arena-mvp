import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/index";
import { challenges, scores, submissions } from "@/db/schema";
import type { WorkflowCard } from "@/lib/data/mock-mvp";
import { toWorkflowCard } from "@/lib/workflows/format-workflow";

type ScoredSubmission = {
  displayName: string;
  email: string;
  modelUsed: string;
  estimatedCostUsd: string;
  promptUsed: string;
  qualityScore: number;
  finalScore: string;
};

function pickBestPerEmail(rows: ScoredSubmission[]): ScoredSubmission[] {
  const byEmail = new Map<string, ScoredSubmission>();

  for (const row of rows) {
    const existing = byEmail.get(row.email);
    if (!existing) {
      byEmail.set(row.email, row);
      continue;
    }
    if (parseFloat(row.finalScore) > parseFloat(existing.finalScore)) {
      byEmail.set(row.email, row);
    }
  }

  return Array.from(byEmail.values());
}

export async function getTopWorkflowsByChallengeSlug(
  slug: string,
  limit = 3
): Promise<WorkflowCard[] | null> {
  const db = getDb();

  const [challenge] = await db
    .select({ id: challenges.id })
    .from(challenges)
    .where(eq(challenges.slug, slug))
    .limit(1);

  if (!challenge) return null;

  const rows = await db
    .select({
      displayName: submissions.displayName,
      email: submissions.email,
      modelUsed: submissions.modelUsed,
      estimatedCostUsd: submissions.estimatedCostUsd,
      promptUsed: submissions.promptUsed,
      qualityScore: scores.qualityScore,
      finalScore: scores.finalScore,
    })
    .from(scores)
    .innerJoin(submissions, eq(scores.submissionId, submissions.id))
    .where(
      and(eq(submissions.challengeId, challenge.id), eq(submissions.status, "scored"))
    )
    .orderBy(desc(scores.finalScore));

  const best = pickBestPerEmail(rows)
    .sort((a, b) => parseFloat(b.finalScore) - parseFloat(a.finalScore))
    .slice(0, limit);

  return best.map((row, index) =>
    toWorkflowCard(
      index + 1,
      row.displayName,
      row.modelUsed,
      parseFloat(row.estimatedCostUsd),
      row.qualityScore,
      row.promptUsed
    )
  );
}
