import { NextResponse } from "next/server";
import { z } from "zod";

import type { AgentPersonaId } from "@/lib/agents/types";
import { buildSavedBattleRecord } from "@/lib/battle/saved-battle";
import { DEFAULT_BATTLE_AGENTS } from "@/lib/battle/constants";
import { runBattleDemo } from "@/lib/battle/demo-battle";
import { runBattle } from "@/lib/battle/orchestrator";
import type { BattleResult } from "@/lib/battle/types";
import { hasAnthropicKey } from "@/lib/env";
import { saveBattle } from "@/lib/supabase/battles";

const ChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  brief: z.string(),
  inputDoc: z.string(),
  outputFormat: z.string(),
  rubricCriteria: z.array(z.string()).min(5).max(5),
  passThreshold: z.number().min(60).max(75),
  topic: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  createdAt: z.string(),
});

const BodySchema = z.object({
  challenge: ChallengeSchema,
  agentIds: z.array(z.string()).length(5).optional(),
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

  const { challenge, agentIds } = parsed.data;
  const agents = (agentIds ?? DEFAULT_BATTLE_AGENTS) as AgentPersonaId[];

  try {
    const mode = hasAnthropicKey() ? "live" : "demo";
    const runner = mode === "live" ? runBattle : runBattleDemo;
    const result: BattleResult = await runner(challenge, agents);

    const record = buildSavedBattleRecord(result, mode);
    const { id: savedBattleId, error: persistError } = await saveBattle(record);

    return NextResponse.json({
      ...result,
      mode,
      savedBattleId: savedBattleId ?? record.id,
      persistError,
      savedAt: record.savedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
