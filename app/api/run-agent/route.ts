import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAnthropicKey } from "@/lib/env";
import { runAgent } from "@/lib/runner/run-agent";
import { judgeOutput } from "@/lib/judge/rubric-judge";
import { scoreField } from "@/lib/agents/scoring";
import { getAgentRuns } from "@/lib/agents/simulate";
import type { AgentPersonaId } from "@/lib/agents/types";

const BodySchema = z.object({
  agentId: z.string(),
  challengeSlug: z.string().optional().default("executive-summary-battle"),
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

  const { agentId, challengeSlug } = parsed.data;

  try {
    // 1. Run the agent (real LLM call)
    const { run, fullOutput } = await runAgent(agentId as AgentPersonaId, challengeSlug);

    // 2. Judge the output (real AI judge)
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

    // 3. Score within the full simulated field so ranking is stable
    const simRuns = getAgentRuns(challengeSlug).map((r) =>
      r.agentId === agentId ? run : r
    );
    const scores = scoreField(simRuns);
    const score = scores.find((s) => s.agentId === agentId)!;

    return NextResponse.json({ run, score, fullOutput });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
