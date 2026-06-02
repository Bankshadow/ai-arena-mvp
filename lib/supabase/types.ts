export type SubmissionStatus = "pending" | "approved" | "rejected";

export type SubmissionRow = {
  id: string;
  challenge_id: string;
  name: string;
  email: string;
  role: string | null;
  prompt_used: string;
  model_used: string;
  estimated_cost: number;
  output_result: string;
  workflow_notes: string | null;
  quality_score: number | null;
  cost_score: number | null;
  final_score: number | null;
  status: SubmissionStatus;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type SubmissionInsert = {
  challenge_id?: string;
  name: string;
  email: string;
  role?: string | null;
  prompt_used: string;
  model_used: string;
  estimated_cost: number;
  output_result: string;
  workflow_notes?: string | null;
  status?: SubmissionStatus;
};
