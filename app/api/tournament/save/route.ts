import { NextResponse } from "next/server";
import { z } from "zod";

import { hasAnthropicKey } from "@/lib/env";
import { saveTournamentState } from "@/lib/tournament/persistence";
import type { TournamentState } from "@/lib/tournament/types";

const BodySchema = z.object({
  state: z.custom<TournamentState>(),
  mode: z.enum(["live", "mock"]).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const mode = parsed.data.mode ?? (hasAnthropicKey() ? "live" : "mock");
  const result = await saveTournamentState(parsed.data.state, mode);
  return NextResponse.json(result);
}
