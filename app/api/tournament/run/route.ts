import { NextResponse } from "next/server";
import { z } from "zod";

import { processRoundCandidates } from "@/lib/marketplace/candidate-store";
import { saveTournamentRound, ensureTournamentTableReady } from "@/lib/supabase/tournaments";
import { runTournamentLoopAsync, type LoopStep } from "@/lib/tournament/engine";
import { newId } from "@/lib/tournament/engine-mock";
import {
  resolveEffectiveRuntimeMode,
  runtimeModeResolutionNote,
} from "@/lib/tournament/routing/resolve-mode";
import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";
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
  const requestedRuntimeMode =
    parsed.data.runtimeMode ?? parsed.data.state.routing?.runtimeMode;
  const effectiveRuntimeMode: TournamentRuntimeMode = resolveEffectiveRuntimeMode({
    requested: requestedRuntimeMode,
    stateMode: parsed.data.state.routing?.runtimeMode,
  });
  const modeNote = runtimeModeResolutionNote(requestedRuntimeMode, effectiveRuntimeMode);

  try {
    const result = await runTournamentLoopAsync(
      parsed.data.state,
      step,
      effectiveRuntimeMode,
    );
    const nextState: TournamentState = {
      tournament: result.tournament,
      leaderboard: result.leaderboard,
      history: result.history,
      marketplace: result.marketplace,
      routing: result.routing,
      constitution: result.constitution,
      memory: result.memory,
    };

    if (modeNote) {
      nextState.history = [
        {
          id: newId(),
          tournamentId: nextState.tournament.id,
          round: nextState.tournament.round,
          type: "manual_run" as const,
          message: modeNote,
          timestamp: new Date().toISOString(),
        },
        ...nextState.history,
      ].slice(0, 100);
    }

    let savedRoundId: string | null = null;
    let persistError: string | null = null;
    let candidatePipeline: Awaited<ReturnType<typeof processRoundCandidates>> | null = null;

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

    if (
      nextState.tournament.phase === "complete" &&
      nextState.tournament.evaluations.length > 0
    ) {
      candidatePipeline = await processRoundCandidates(nextState);
    }

    return NextResponse.json({
      ...result,
      requestedRuntimeMode: requestedRuntimeMode ?? null,
      effectiveRuntimeMode,
      modeResolutionNote: modeNote,
      savedRoundId,
      persistError,
      candidatePipeline,
      engineLabel: result.engineLabel ?? effectiveRuntimeMode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
