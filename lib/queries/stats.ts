import { and, count, eq, sql } from "drizzle-orm";

import { getDb } from "@/db/index";
import { submissions, waitlistSignups } from "@/db/schema";

export async function getWaitlistCount(): Promise<number> {
  const db = getDb();
  const [row] = await db.select({ value: count() }).from(waitlistSignups);
  return row?.value ?? 0;
}

export async function getChallengeSubmissionStats(challengeId: string) {
  const db = getDb();

  const [submissionRow] = await db
    .select({ value: count() })
    .from(submissions)
    .where(eq(submissions.challengeId, challengeId));

  const [playerRow] = await db
    .select({ value: sql<number>`count(distinct ${submissions.email})::int` })
    .from(submissions)
    .where(eq(submissions.challengeId, challengeId));

  const [scoredOnly] = await db
    .select({ value: count() })
    .from(submissions)
    .where(
      and(eq(submissions.challengeId, challengeId), eq(submissions.status, "scored"))
    );

  return {
    submissionCount: submissionRow?.value ?? 0,
    uniqueSubmitters: Number(playerRow?.value ?? 0),
    scoredCount: scoredOnly?.value ?? 0,
  };
}
