import { NextResponse } from "next/server";
import { z } from "zod";

import { runToolArenaRound } from "@/lib/tool-arena/pipeline";
import { seedToolArenaStore } from "@/lib/tool-arena/store";

const BodySchema = z.object({
  challenge_id: z.string().optional(),
  dry_run: z.boolean().optional(),
});

export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    /* empty ok */
  }

  const parsed = BodySchema.safeParse(body);
  const opts = parsed.success ? parsed.data : {};

  const data = seedToolArenaStore();
  if (opts.challenge_id) {
    data.state.selected_challenge_id = opts.challenge_id;
  }
  if (opts.dry_run !== undefined) {
    data.state.dry_run = opts.dry_run;
  }

  const result = runToolArenaRound(data);

  return NextResponse.json({
    ok: true,
    state: result.state,
    verification_summary: result.verification_summary,
    marketplace_candidates: result.marketplace_candidates,
  });
}
