import { NextResponse } from "next/server";
import { z } from "zod";

import { saveTournamentRound, ensureTournamentTableReady } from "@/lib/supabase/tournaments";
import { runTournamentLoopAsync, type LoopStep } from "@/lib/tournament/engine";
import { shouldAutoSaveTournament } from "@/lib/tournament/saved-tournament";
import type { TournamentState } from "@/lib/tournament/types";

const StepSchema = z.enum(["full", "generate", "run", "evaluate"]);

const BodySchema = z.object({
  state: z.custom<TournamentState>(),
  step: StepSchema.optional(),
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

  const step = (parsed.data.step ?? "full") as LoopStep;

  try {
    const result = await runTournamentLoopAsync(parsed.data.state, step);
    const nextState: TournamentState = {
      tournament: result.tournament,
      leaderboard: result.leaderboard,
      history: result.history,
      marketplace: result.marketplace,
    };

    let savedRoundId: string | null = null;
    let persistError: string | null = null;

    if (shouldAutoSaveTournament(nextState)) {
      const tableError = await ensureTournamentTableReady();
      if (tableError) {
        persistError = tableError;
      } else {
        const saved = await saveTournamentRound(nextState, result.mode);
        savedRoundId = saved.id;
        persistError = saved.error;
      }
    }

    return NextResponse.json({
      ...result,
      savedRoundId,
      persistError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
