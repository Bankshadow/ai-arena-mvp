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

export type BattleRow = {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  pass_threshold: number;
  mode: string;
  winner_agent_id: string | null;
  winner_tokens: number | null;
  passed_count: number;
  payload: Record<string, unknown>;
  created_at: string;
};

export type TournamentRoundRow = {
  id: string;
  tournament_id: string;
  round: number;
  mode: string;
  phase: string;
  winner_agent_id: string | null;
  winner_score: number | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type MarketplaceListingRow = {
  id: string;
  slug: string;
  title: string;
  agent_id: string;
  agent_name: string;
  challenge_title: string;
  total_score: number;
  marketplace_score: number;
  suggested_price_usd: number;
  status: "seed" | "review" | "listed";
  workflow_steps: string[];
  prompt_template: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};
