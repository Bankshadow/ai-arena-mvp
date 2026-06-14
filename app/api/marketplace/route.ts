import { NextResponse } from "next/server";

import { fetchMarketplaceListings, isSupabaseConfigured } from "@/lib/supabase/marketplace";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ listings: [], source: "local" as const });
  }

  const listings = await fetchMarketplaceListings();
  return NextResponse.json({ listings, source: "supabase" as const });
}
