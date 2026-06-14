import { NextResponse } from "next/server";

import { fetchMarketplaceListingBySlug } from "@/lib/supabase/marketplace";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const listing = await fetchMarketplaceListingBySlug(slug);
  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(listing);
}
