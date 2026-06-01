"use server";

import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/index";
import { challenges, submissions } from "@/db/schema";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { parseCostLimit } from "@/lib/queries/challenges";
import { scoreSubmissionById } from "@/lib/judge/score-submission";
import {
  submissionFormSchema,
  type SubmissionFormInput,
} from "@/lib/validations/submission";

export type SubmitChallengeSuccess = {
  success: true;
  submissionId: string;
  attemptNumber: number;
  maxAttempts: number;
  displayName: string;
  email: string;
  modelUsed: string;
  estimatedCostUsd: number;
  scoringStatus: "scored" | "pending";
  qualityScore?: number;
  costEfficiencyScore?: number;
  finalScore?: number;
};

export type SubmitChallengeFailure = {
  success: false;
  error: string;
};

export type SubmitChallengeResult = SubmitChallengeSuccess | SubmitChallengeFailure;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function submitChallengeEntry(
  raw: SubmissionFormInput
): Promise<SubmitChallengeResult> {
  const parsed = submissionFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Invalid submission. Please check your entries." };
  }

  const input = parsed.data;
  const slug = input.challengeSlug || DEFAULT_CHALLENGE_SLUG;

  let db;
  try {
    db = getDb();
  } catch {
    return {
      success: false,
      error: "Submissions are unavailable — database is not configured.",
    };
  }

  const [challenge] = await db
    .select()
    .from(challenges)
    .where(eq(challenges.slug, slug))
    .limit(1);

  if (!challenge) {
    return { success: false, error: "Challenge not found." };
  }

  if (challenge.status !== "open") {
    const statusMessage =
      challenge.status === "closed"
        ? "This challenge is closed for submissions."
        : "This challenge is not open yet. Join the waitlist and check back soon.";
    return { success: false, error: statusMessage };
  }

  if (new Date() > challenge.deadlineAt) {
    return { success: false, error: "The submission deadline has passed." };
  }

  const costLimit = parseCostLimit(challenge.costLimitUsd);
  if (input.estimatedCostUsd > costLimit) {
    return {
      success: false,
      error: `Estimated cost must be $${costLimit.toFixed(2)} or less.`,
    };
  }

  const email = normalizeEmail(input.email);

  const existing = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(and(eq(submissions.challengeId, challenge.id), eq(submissions.email, email)));

  const attemptNumber = existing.length + 1;

  if (attemptNumber > challenge.maxAttempts) {
    return {
      success: false,
      error: `You have used all ${challenge.maxAttempts} submission attempts for this challenge.`,
    };
  }

  const [row] = await db
    .insert(submissions)
    .values({
      challengeId: challenge.id,
      displayName: input.displayName.trim(),
      email,
      promptUsed: input.promptUsed,
      modelUsed: input.modelUsed,
      estimatedCostUsd: input.estimatedCostUsd.toFixed(4),
      output: input.output,
      status: "pending",
      attemptNumber,
    })
    .returning({ id: submissions.id });

  const scoreResult = await scoreSubmissionById(row.id);

  if (scoreResult.success) {
    return {
      success: true,
      submissionId: row.id,
      attemptNumber,
      maxAttempts: challenge.maxAttempts,
      displayName: input.displayName.trim(),
      email,
      modelUsed: input.modelUsed,
      estimatedCostUsd: input.estimatedCostUsd,
      scoringStatus: "scored",
      qualityScore: scoreResult.qualityScore,
      costEfficiencyScore: scoreResult.costEfficiencyScore,
      finalScore: scoreResult.finalScore,
    };
  }

  if (!scoreResult.skipped) {
    console.error("[submit] judge failed:", row.id, scoreResult.error);
  }

  return {
    success: true,
    submissionId: row.id,
    attemptNumber,
    maxAttempts: challenge.maxAttempts,
    displayName: input.displayName.trim(),
    email,
    modelUsed: input.modelUsed,
    estimatedCostUsd: input.estimatedCostUsd,
    scoringStatus: "pending",
  };
}
