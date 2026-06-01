import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { getDb } from "@/db/index";
import { challenges, scores, submissions } from "@/db/schema";
import { parseCostLimit } from "@/lib/queries/challenges";

import {
  computeCostEfficiencyScore,
  computeFinalScore,
  parseWeight,
} from "./compute-scores";
import { buildJudgeSystemPrompt, buildJudgeUserPrompt } from "./prompt";
import {
  judgeQualitySchema,
  type ScoreSubmissionResult,
} from "./types";

const JUDGE_MODEL = process.env.JUDGE_MODEL ?? "gpt-4o-mini";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function callQualityJudge(
  client: OpenAI,
  challengeName: string,
  output: string,
  modelUsed: string
) {
  const completion = await client.chat.completions.parse({
    model: JUDGE_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: buildJudgeSystemPrompt(challengeName) },
      { role: "user", content: buildJudgeUserPrompt(output, modelUsed) },
    ],
    response_format: zodResponseFormat(judgeQualitySchema, "judge_quality"),
  });

  const parsed = completion.choices[0]?.message?.parsed;
  if (!parsed) {
    throw new Error("AI Judge returned an empty response.");
  }
  return parsed;
}

export async function scoreSubmissionById(
  submissionId: string
): Promise<ScoreSubmissionResult> {
  const client = getOpenAIClient();
  if (!client) {
    return {
      success: false,
      error: "OPENAI_API_KEY is not configured.",
      skipped: true,
    };
  }

  let db;
  try {
    db = getDb();
  } catch {
    return { success: false, error: "Database is not configured." };
  }

  const [row] = await db
    .select({
      submission: submissions,
      challenge: challenges,
    })
    .from(submissions)
    .innerJoin(challenges, eq(submissions.challengeId, challenges.id))
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!row) {
    return { success: false, error: "Submission not found." };
  }

  const { submission, challenge } = row;

  const [existingScore] = await db
    .select()
    .from(scores)
    .where(eq(scores.submissionId, submissionId))
    .limit(1);

  if (existingScore) {
    return {
      success: true,
      qualityScore: existingScore.qualityScore,
      costEfficiencyScore: existingScore.costEfficiencyScore,
      finalScore: parseFloat(existingScore.finalScore),
    };
  }

  await db
    .update(submissions)
    .set({ status: "scoring" })
    .where(eq(submissions.id, submissionId));

  try {
    const judgeResult = await callQualityJudge(
      client,
      challenge.name,
      submission.output,
      submission.modelUsed
    );

    const estimatedCost = parseFloat(submission.estimatedCostUsd);
    const costLimit = parseCostLimit(challenge.costLimitUsd);
    const qualityWeight = parseWeight(challenge.qualityWeight);
    const costWeight = parseWeight(challenge.costWeight);

    const costEfficiencyScore = computeCostEfficiencyScore(estimatedCost, costLimit);
    const finalScore = computeFinalScore(
      judgeResult.quality_score,
      costEfficiencyScore,
      qualityWeight,
      costWeight
    );

    await db.insert(scores).values({
      submissionId,
      qualityScore: judgeResult.quality_score,
      costEfficiencyScore,
      finalScore: finalScore.toFixed(2),
      judgeModel: JUDGE_MODEL,
      judgeRaw: {
        rationale: judgeResult.rationale,
        estimatedCostUsd: estimatedCost,
        costLimitUsd: costLimit,
        qualityWeight,
        costWeight,
      },
    });

    await db
      .update(submissions)
      .set({ status: "scored" })
      .where(eq(submissions.id, submissionId));

    return {
      success: true,
      qualityScore: judgeResult.quality_score,
      costEfficiencyScore,
      finalScore,
    };
  } catch (err) {
    await db
      .update(submissions)
      .set({ status: "pending" })
      .where(eq(submissions.id, submissionId));

    const message = err instanceof Error ? err.message : "Scoring failed.";
    console.error("[judge] scoreSubmissionById failed:", submissionId, err);
    return { success: false, error: message };
  }
}

export async function scorePendingSubmissions(limit = 20): Promise<{
  processed: number;
  scored: number;
  failed: number;
  skipped: boolean;
}> {
  if (!getOpenAIClient()) {
    return { processed: 0, scored: 0, failed: 0, skipped: true };
  }

  const db = getDb();
  const pending = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(eq(submissions.status, "pending"))
    .limit(limit);

  let scored = 0;
  let failed = 0;

  for (const { id } of pending) {
    const result = await scoreSubmissionById(id);
    if (result.success) scored++;
    else if (!result.skipped) failed++;
  }

  return { processed: pending.length, scored, failed, skipped: false };
}
