import type { SavedBattleRecord } from "@/lib/battle/saved-battle";
import { toBattleListItem } from "@/lib/battle/saved-battle";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { BattleRow } from "@/lib/supabase/types";

function rowToRecord(row: BattleRow): SavedBattleRecord {
  const payload = row.payload as Omit<SavedBattleRecord, "id">;
  return { ...payload, id: row.id, savedAt: row.created_at };
}

export async function saveBattle(
  record: SavedBattleRecord,
): Promise<{ id: string | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { id: null, error: "Supabase is not configured." };
  }

  const payload = {
    challenge: record.challenge,
    entries: record.entries,
    winner: record.winner,
    passedCount: record.passedCount,
    mode: record.mode,
    savedAt: record.savedAt,
  };

  const { data, error } = await supabase
    .from("battles")
    .insert({
      id: record.id,
      title: record.challenge.title,
      topic: record.challenge.topic,
      difficulty: record.challenge.difficulty,
      pass_threshold: record.challenge.passThreshold,
      mode: record.mode,
      winner_agent_id: record.winner?.agentId ?? null,
      winner_tokens: record.winner?.totalTokens ?? null,
      passed_count: record.passedCount,
      payload,
    })
    .select("id")
    .single();

  if (error) return { id: null, error: error.message };
  return { id: (data as { id: string }).id, error: null };
}

export async function fetchBattles(): Promise<SavedBattleRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("battles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return (data as BattleRow[]).map(rowToRecord);
}

export async function fetchBattleById(id: string): Promise<SavedBattleRecord | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("battles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToRecord(data as BattleRow);
}

export function battleRowsToListItems(rows: SavedBattleRecord[]) {
  return rows.map(toBattleListItem);
}

export { isSupabaseConfigured };
