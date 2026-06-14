import { NextResponse } from "next/server";
import { z } from "zod";

import { saveTournamentRound, ensureTournamentTableReady } from "@/lib/supabase/tournaments";
import { upsertMarketplaceCandidates } from "@/lib/supabase/marketplace";
import { runTournamentLoopAsync, type LoopStep } from "@/lib/tournament/engine";
import { DEFAULT_RUNTIME_MODE } from "@/lib/tournament/routing/types";
import { shouldAutoSaveTournament } from "@/lib/tournament/saved-tournament";
import type { TournamentState } from "@/lib/tournament/types";

const StepSchema = z.enum(["full", "generate", "run", "evaluate"]);
const RuntimeModeSchema = z.enum(["mock", "groq_free", "hybrid_quality"]);

const BodySchema = z.object({
  state: z.custom<TournamentState>(),
  step: StepSchema.optional(),
  runtimeMode: RuntimeModeSchema.optional(),
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
  const runtimeMode =
    parsed.data.runtimeMode ??
    parsed.data.state.routing?.runtimeMode ??
    DEFAULT_RUNTIME_MODE;

  try {
    const result = await runTournamentLoopAsync(parsed.data.state, step, runtimeMode);
    const nextState: TournamentState = {
      tournament: result.tournament,
      leaderboard: result.leaderboard,
      history: result.history,
      marketplace: result.marketplace,
      routing: result.routing,
      constitution: result.constitution,
      memory: result.memory,
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
        if (nextState.marketplace.length > 0) {
          await upsertMarketplaceCandidates(nextState.marketplace.slice(0, 5));
        }
      }
    }

    return NextResponse.json({
      ...result,
      savedRoundId,
      persistError,
      engineLabel: result.engineLabel ?? runtimeMode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
