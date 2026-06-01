import { z } from "zod";

export const judgeQualitySchema = z.object({
  quality_score: z.number().int().min(0).max(100),
  rationale: z.string(),
});

export type JudgeQualityResult = z.infer<typeof judgeQualitySchema>;

export type ScoreSubmissionSuccess = {
  success: true;
  qualityScore: number;
  costEfficiencyScore: number;
  finalScore: number;
};

export type ScoreSubmissionFailure = {
  success: false;
  error: string;
  skipped?: boolean;
};

export type ScoreSubmissionResult = ScoreSubmissionSuccess | ScoreSubmissionFailure;
