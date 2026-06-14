import {
  buildCandidateFromDraft,
  detectCandidatesForRound,
  mergeCandidateOnDuplicate,
  type CandidateDraft,
} from "@/lib/marketplace/candidate-pipeline";
import {
  mockGetCandidateByDedupKey,
  mockGetCandidateById,
  mockListCandidates,
  mockUpsertCandidate,
} from "@/lib/marketplace/candidate-store-mock";
import { refreshComponentCatalog } from "@/lib/marketplace/mock-catalog";
import { promoteCandidateToComponent } from "@/lib/marketplace/published-catalog";
import type {
  CandidateStatus,
  CandidateUpsertResult,
  MarketplaceCandidateRecord,
} from "@/lib/marketplace/types";
import {
  fetchCandidateByDedupKey,
  fetchCandidateById,
  insertCandidate,
  listCandidates as listCandidatesDb,
  updateCandidate,
} from "@/lib/supabase/marketplace-candidates";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { TournamentState } from "@/lib/tournament/types";

export type ProcessRoundResult = {
  processed: number;
  created: number;
  updated: number;
  records: MarketplaceCandidateRecord[];
  error: string | null;
};

async function findByDedupKey(dedupKey: string): Promise<MarketplaceCandidateRecord | null> {
  if (isSupabaseConfigured()) {
    const row = await fetchCandidateByDedupKey(dedupKey);
    if (row) return row;
  }
  return mockGetCandidateByDedupKey(dedupKey);
}

/** Insert or merge candidate — never auto-publish. */
export async function upsertMarketplaceCandidate(
  draft: CandidateDraft,
  state: TournamentState,
): Promise<CandidateUpsertResult> {
  const detected = detectCandidatesForRound(state);
  if (!detected) {
    throw new Error("Tournament round not ready for candidate detection");
  }

  const { winner, winnerRun } = detected;
  const existing = await findByDedupKey(draft.dedup_key);

  if (existing) {
    const merged = mergeCandidateOnDuplicate(existing, state, winner, winnerRun);
    const saved = await persistCandidate(merged, false);
    return { record: saved, created: false, updated: true };
  }

  const record = buildCandidateFromDraft(draft, state, winner, winnerRun);
  const saved = await persistCandidate(record, true);
  return { record: saved, created: true, updated: false };
}

async function persistCandidate(
  record: MarketplaceCandidateRecord,
  isInsert: boolean,
): Promise<MarketplaceCandidateRecord> {
  if (isSupabaseConfigured()) {
    const saved = isInsert ? await insertCandidate(record) : await updateCandidate(record);
    if (saved) {
      mockUpsertCandidate(saved);
      return saved;
    }
  }
  return mockUpsertCandidate(record);
}

/** Run full pipeline after a completed tournament round. */
export async function processRoundCandidates(state: TournamentState): Promise<ProcessRoundResult> {
  const detected = detectCandidatesForRound(state);
  if (!detected) {
    return { processed: 0, created: 0, updated: 0, records: [], error: null };
  }

  let created = 0;
  let updated = 0;
  const records: MarketplaceCandidateRecord[] = [];
  let error: string | null = null;

  for (const draft of detected.drafts) {
    try {
      const result = await upsertMarketplaceCandidate(draft, state);
      records.push(result.record);
      if (result.created) created++;
      if (result.updated) updated++;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    processed: detected.drafts.length,
    created,
    updated,
    records,
    error,
  };
}

export async function listMarketplaceCandidates(filter?: {
  status?: CandidateStatus | CandidateStatus[];
  limit?: number;
}): Promise<MarketplaceCandidateRecord[]> {
  const mock = mockListCandidates(filter);
  if (isSupabaseConfigured()) {
    const rows = await listCandidatesDb(filter);
    if (rows.length > 0) {
      const byId = new Map<string, MarketplaceCandidateRecord>();
      for (const row of rows) byId.set(row.dedup_key, row);
      for (const m of mock) if (!byId.has(m.dedup_key)) byId.set(m.dedup_key, m);
      return [...byId.values()].slice(0, filter?.limit ?? 100);
    }
  }
  return mock;
}

export async function getMarketplaceCandidate(id: string): Promise<MarketplaceCandidateRecord | null> {
  if (isSupabaseConfigured()) {
    const row = await fetchCandidateById(id);
    if (row) return row;
  }
  return mockGetCandidateById(id);
}

export async function setCandidateStatus(
  id: string,
  status: CandidateStatus,
): Promise<MarketplaceCandidateRecord | null> {
  const existing = await getMarketplaceCandidate(id);
  if (!existing) return null;

  if (status === "published") {
    const { candidate } = promoteCandidateToComponent(existing);
    refreshComponentCatalog();
    return persistCandidate(candidate, false);
  }

  const updated = { ...existing, status, updated_at: new Date().toISOString() };
  if (status === "archived" || status === "draft") {
    return persistCandidate(updated, false);
  }
  if (status === "approved") {
    return persistCandidate({ ...updated, status: "approved" }, false);
  }
  return persistCandidate(updated, false);
}

export async function approveCandidate(id: string): Promise<MarketplaceCandidateRecord | null> {
  return setCandidateStatus(id, "approved");
}

export async function rejectCandidate(id: string): Promise<MarketplaceCandidateRecord | null> {
  return setCandidateStatus(id, "archived");
}

export async function publishCandidate(id: string): Promise<MarketplaceCandidateRecord | null> {
  return setCandidateStatus(id, "published");
}

export async function archiveCandidate(id: string): Promise<MarketplaceCandidateRecord | null> {
  const existing = await getMarketplaceCandidate(id);
  if (!existing) return null;
  const updated = { ...existing, status: "archived" as const, updated_at: new Date().toISOString() };
  return persistCandidate(updated, false);
}

/** Admin status transitions with guard rails. */
export async function transitionCandidate(
  id: string,
  action: "approve" | "reject" | "publish" | "archive",
): Promise<MarketplaceCandidateRecord | null> {
  switch (action) {
    case "approve":
      return approveCandidate(id);
    case "reject":
      return rejectCandidate(id);
    case "publish":
      return publishCandidate(id);
    case "archive":
      return archiveCandidate(id);
    default:
      return null;
  }
}

// Re-export pipeline helpers for tests and admin UI
export {
  buildCandidateDedupKey,
  detectMarketplaceCandidates,
  attachTournamentEvidence,
  updateComponentMetrics,
} from "@/lib/marketplace/candidate-pipeline";
export { promoteCandidateToComponent } from "@/lib/marketplace/published-catalog";
