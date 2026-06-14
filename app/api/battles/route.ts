import { NextResponse } from "next/server";

import { battleRowsToListItems, fetchBattles, isSupabaseConfigured } from "@/lib/supabase/battles";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ battles: [], source: "local" as const });
  }

  try {
    const rows = await fetchBattles();
    return NextResponse.json({
      battles: battleRowsToListItems(rows),
      source: "supabase" as const,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message, battles: [], source: "demo" as const },
      { status: 200 },
    );
  }
}
