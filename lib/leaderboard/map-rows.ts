import type { LeaderboardRow } from "@/components/LeaderboardTable";
import type { SubmissionRow } from "@/lib/supabase/types";

export function submissionToLeaderboardRow(
  row: SubmissionRow,
  rank: number
): LeaderboardRow {
  return {
    rank,
    player: row.name,
    qualityScore: Number(row.quality_score ?? 0),
    cost: Number(row.estimated_cost),
    costScore: Number(row.cost_score ?? 0),
    finalScore: Number(row.final_score ?? 0),
    modelUsed: row.model_used,
    submittedAt: row.reviewed_at ?? row.created_at,
    highlight: rank <= 3,
  };
}

export function mapApprovedToLeaderboardRows(submissions: SubmissionRow[]): LeaderboardRow[] {
  return submissions.map((row, index) => submissionToLeaderboardRow(row, index + 1));
}
