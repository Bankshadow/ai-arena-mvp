import { getSupabaseAdmin } from "@/lib/supabase/admin-client";
import { getSupabase } from "@/lib/supabase";
import type { MarketplaceCandidateRow } from "@/lib/supabase/types";
import type {
  ArenaScoreBreakdown,
  CandidateStatus,
  ComponentPerformanceProof,
  JudgeNote,
  MarketplaceCandidateRecord,
  TournamentEvidence,
} from "@/lib/marketplace/types";

function client() {
  return getSupabaseAdmin() ?? getSupabase();
}

function rowToRecord(row: MarketplaceCandidateRow): MarketplaceCandidateRecord {
  return {
    id: row.id,
    dedup_key: row.dedup_key,
    component_type: row.component_type as MarketplaceCandidateRecord["component_type"],
    challenge_category: row.challenge_category,
    winning_agent: row.winning_agent,
    strategy_hash: row.strategy_hash,
    title: row.title,
    description: row.description,
    tournament_id: row.tournament_id,
    source_round: row.source_round,
    agent_id: row.agent_id ?? undefined,
    agent_name: row.agent_name ?? undefined,
    challenge_title: row.challenge_title ?? undefined,
    total_score: Number(row.total_score),
    marketplace_score: Number(row.marketplace_score),
    status: row.status,
    tested_runs: row.tested_runs,
    avg_score: Number(row.avg_score),
    avg_cost: Number(row.avg_cost),
    avg_tokens: Number(row.avg_tokens),
    avg_latency: Number(row.avg_latency),
    evidence: (row.evidence ?? []) as TournamentEvidence[],
    judge_notes: (row.judge_notes ?? []) as JudgeNote[],
    proof: row.proof as ComponentPerformanceProof,
    arena_score: row.arena_score as ArenaScoreBreakdown,
    component_id: row.component_id ?? undefined,
    payload: row.payload ?? {},
    last_seen_at: row.last_seen_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function recordToRow(record: MarketplaceCandidateRecord): Omit<MarketplaceCandidateRow, "created_at"> & {
  created_at?: string;
} {
  return {
    id: record.id,
    dedup_key: record.dedup_key,
    component_type: record.component_type,
    challenge_category: record.challenge_category,
    winning_agent: record.winning_agent,
    strategy_hash: record.strategy_hash,
    title: record.title,
    description: record.description,
    tournament_id: record.tournament_id,
    source_round: record.source_round,
    agent_id: record.agent_id ?? null,
    agent_name: record.agent_name ?? null,
    challenge_title: record.challenge_title ?? null,
    total_score: record.total_score,
    marketplace_score: record.marketplace_score,
    status: record.status,
    tested_runs: record.tested_runs,
    avg_score: record.avg_score,
    avg_cost: record.avg_cost,
    avg_tokens: record.avg_tokens,
    avg_latency: record.avg_latency,
    evidence: record.evidence,
    judge_notes: record.judge_notes,
    proof: record.proof,
    arena_score: record.arena_score,
    component_id: record.component_id ?? null,
    payload: record.payload,
    last_seen_at: record.last_seen_at,
    updated_at: record.updated_at,
    created_at: record.created_at,
  };
}

export async function fetchCandidateByDedupKey(
  dedupKey: string,
): Promise<MarketplaceCandidateRecord | null> {
  const supabase = client();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketplace_candidates")
    .select("*")
    .eq("dedup_key", dedupKey)
    .maybeSingle();

  if (error || !data) return null;
  return rowToRecord(data as MarketplaceCandidateRow);
}

export async function fetchCandidateById(id: string): Promise<MarketplaceCandidateRecord | null> {
  const supabase = client();
  if (!supabase) return null;

  const { data, error } = await supabase.from("marketplace_candidates").select("*").eq("id", id).maybeSingle();

  if (error || !data) return null;
  return rowToRecord(data as MarketplaceCandidateRow);
}

export async function insertCandidate(
  record: MarketplaceCandidateRecord,
): Promise<MarketplaceCandidateRecord | null> {
  const supabase = client();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketplace_candidates")
    .insert(recordToRow(record))
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToRecord(data as MarketplaceCandidateRow);
}

export async function updateCandidate(
  record: MarketplaceCandidateRecord,
): Promise<MarketplaceCandidateRecord | null> {
  const supabase = client();
  if (!supabase) return null;

  const { id, created_at: _c, ...patch } = recordToRow(record);
  const { data, error } = await supabase
    .from("marketplace_candidates")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToRecord(data as MarketplaceCandidateRow);
}

export async function listCandidates(filter?: {
  status?: CandidateStatus | CandidateStatus[];
  limit?: number;
}): Promise<MarketplaceCandidateRecord[]> {
  const supabase = client();
  if (!supabase) return [];

  let query = supabase
    .from("marketplace_candidates")
    .select("*")
    .order("last_seen_at", { ascending: false })
    .limit(filter?.limit ?? 100);

  if (filter?.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    query = query.in("status", statuses);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as MarketplaceCandidateRow[]).map(rowToRecord);
}
