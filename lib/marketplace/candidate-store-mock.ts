import type { MarketplaceCandidateRecord } from "@/lib/marketplace/types";

const GLOBAL_KEY = "__ai_arena_marketplace_candidates__";

type Store = Map<string, MarketplaceCandidateRecord>;

function getStore(): Store {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: Store };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Map();
  }
  return g[GLOBAL_KEY]!;
}

export function mockGetCandidateByDedupKey(dedupKey: string): MarketplaceCandidateRecord | null {
  return getStore().get(dedupKey) ?? null;
}

export function mockGetCandidateById(id: string): MarketplaceCandidateRecord | null {
  for (const record of getStore().values()) {
    if (record.id === id) return record;
  }
  return null;
}

export function mockUpsertCandidate(record: MarketplaceCandidateRecord): MarketplaceCandidateRecord {
  getStore().set(record.dedup_key, record);
  return record;
}

export function mockListCandidates(filter?: {
  status?: MarketplaceCandidateRecord["status"] | MarketplaceCandidateRecord["status"][];
  limit?: number;
}): MarketplaceCandidateRecord[] {
  let list = [...getStore().values()];
  if (filter?.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    list = list.filter((c) => statuses.includes(c.status));
  }
  list.sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime());
  return list.slice(0, filter?.limit ?? 100);
}

export function mockUpdateCandidateStatus(
  id: string,
  status: MarketplaceCandidateRecord["status"],
  patch?: Partial<MarketplaceCandidateRecord>,
): MarketplaceCandidateRecord | null {
  const existing = mockGetCandidateById(id);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...patch,
    status,
    updated_at: new Date().toISOString(),
  };
  getStore().set(existing.dedup_key, updated);
  return updated;
}

export function mockClearCandidates(): void {
  getStore().clear();
}
