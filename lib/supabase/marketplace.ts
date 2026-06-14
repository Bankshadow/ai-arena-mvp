import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";
import type { MarketplaceListingRow } from "@/lib/supabase/types";
import type { MarketplaceCandidate } from "@/lib/tournament/types";

function slugify(title: string, agentId: string): string {
  const base = `${agentId}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base}-${Date.now().toString(36).slice(-4)}`;
}

function candidateToInsert(candidate: MarketplaceCandidate) {
  const slug = slugify(candidate.challengeTitle, candidate.agentId);
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

export async function upsertMarketplaceCandidates(
  candidates: MarketplaceCandidate[],
): Promise<{ inserted: number; error: string | null }> {
  const admin = getSupabaseAdmin();
  const client = admin ?? getSupabase();
  if (!client) return { inserted: 0, error: "Supabase not configured" };

  let inserted = 0;
  for (const candidate of candidates.slice(0, 5)) {
    const row = candidateToInsert(candidate);
    const { error } = await client.from("marketplace_listings").insert(row);
    if (!error) inserted++;
  }

  return { inserted, error: null };
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
