import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";
import type { MarketplaceListingRow } from "@/lib/supabase/types";
import type { MarketplaceCandidate } from "@/lib/tournament/types";

/** Stable slug for dedup — one listing per agent + challenge (no timestamp suffix). */
export function stableMarketplaceSlug(agentId: string, challengeTitle: string): string {
  const base = `${agentId}-${challengeTitle}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return base || `listing-${agentId}`;
}

function candidateToRow(candidate: MarketplaceCandidate) {
  const slug = stableMarketplaceSlug(candidate.agentId, candidate.challengeTitle);
  return {
    slug,
    title: `${candidate.agentName} · ${candidate.challengeTitle}`,
    agent_id: candidate.agentId,
    agent_name: candidate.agentName,
    challenge_title: candidate.challengeTitle,
    total_score: candidate.totalScore,
    marketplace_score: candidate.marketplaceScore,
    suggested_price_usd: candidate.suggestedPriceUsd,
    status: candidate.status,
    workflow_steps: [
      "Load challenge source document",
      "Run agent strategy for required output format",
      "Self-check against rubric dimensions",
      "Deliver structured final answer",
    ],
    prompt_template: `You are ${candidate.agentName}. Complete the challenge "${candidate.challengeTitle}" with maximum marketplace reusability (score ${candidate.marketplaceScore}/10).`,
    payload: { candidate },
  };
}

export type MarketplaceUpsertResult = {
  inserted: number;
  updated: number;
  error: string | null;
};

/**
 * Legacy tournament listings — written only on admin Publish (not on round complete).
 * Round pipeline uses marketplace_candidates via lib/marketplace/candidate-store.ts.
 */
export async function upsertMarketplaceCandidates(
  candidates: MarketplaceCandidate[],
): Promise<MarketplaceUpsertResult> {
  const admin = getSupabaseAdmin();
  const client = admin ?? getSupabase();
  if (!client) return { inserted: 0, updated: 0, error: "Supabase not configured" };

  let inserted = 0;
  let updated = 0;

  for (const candidate of candidates.slice(0, 5)) {
    const row = candidateToRow(candidate);

    const { data: existing, error: lookupError } = await client
      .from("marketplace_listings")
      .select("id, slug")
      .eq("agent_id", candidate.agentId)
      .eq("challenge_title", candidate.challengeTitle)
      .maybeSingle();

    if (lookupError) {
      return { inserted, updated, error: lookupError.message };
    }

    if (existing) {
      const { error: updateError } = await client
        .from("marketplace_listings")
        .update({
          title: row.title,
          agent_name: row.agent_name,
          total_score: row.total_score,
          marketplace_score: row.marketplace_score,
          suggested_price_usd: row.suggested_price_usd,
          status: row.status,
          workflow_steps: row.workflow_steps,
          prompt_template: row.prompt_template,
          payload: row.payload,
        })
        .eq("id", existing.id);

      if (updateError) {
        return { inserted, updated, error: updateError.message };
      }
      updated++;
      continue;
    }

    const { error: insertError } = await client.from("marketplace_listings").insert(row);
    if (insertError) {
      return { inserted, updated, error: insertError.message };
    }
    inserted++;
  }

  return { inserted, updated, error: null };
}

export async function fetchMarketplaceListings(
  status?: MarketplaceListingRow["status"],
  limit = 50,
): Promise<MarketplaceListingRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("marketplace_listings")
    .select("*")
    .order("marketplace_score", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as MarketplaceListingRow[];
}

export async function fetchMarketplaceListingBySlug(
  slug: string,
): Promise<MarketplaceListingRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as MarketplaceListingRow;
}

export async function fetchMarketplaceListingById(
  id: string,
): Promise<MarketplaceListingRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as MarketplaceListingRow;
}

export { isSupabaseConfigured };
