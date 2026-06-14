import { NextResponse } from "next/server";
import { z } from "zod";

import { scoreField } from "@/lib/agents/scoring";
import { getAgentRuns } from "@/lib/agents/simulate";
import type { AgentPersonaId } from "@/lib/agents/types";
import { hasAnthropicKey } from "@/lib/env";
import { judgeOutput } from "@/lib/judge/rubric-judge";
import { persistAgentRunAsSubmission } from "@/lib/supabase/agent-runs";
import { runAgent } from "@/lib/runner/run-agent";

const BodySchema = z.object({
  agentId: z.string(),
  challengeSlug: z.string().optional().default("executive-summary-battle"),
  persist: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  if (!hasAnthropicKey()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 400 });
  }

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

  const { agentId, challengeSlug, persist } = parsed.data;

  try {
    const { run, fullOutput } = await runAgent(agentId as AgentPersonaId, challengeSlug);

    const judged = await judgeOutput(fullOutput);
    run.rubric = {
      accuracy: judged.accuracy,
      completeness: judged.completeness,
      structure: judged.structure,
      riskId: judged.riskId,
      recommendation: judged.recommendation,
    };
    run.hallucinationPenalty = judged.hallucinationPenalty;
    run.formatPenalty = judged.formatPenalty;

    const simRuns = getAgentRuns(challengeSlug).map((r) =>
      r.agentId === agentId ? run : r,
    );
    const scores = scoreField(simRuns);
    const score = scores.find((s) => s.agentId === agentId)!;

    let savedSubmissionId: string | null = null;
    let persistError: string | null = null;

    if (persist) {
      const saved = await persistAgentRunAsSubmission(
        agentId as AgentPersonaId,
        run,
        score,
        fullOutput,
        challengeSlug,
      );
      savedSubmissionId = saved.id;
      persistError = saved.error;
    }

    return NextResponse.json({ run, score, fullOutput, savedSubmissionId, persistError });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
