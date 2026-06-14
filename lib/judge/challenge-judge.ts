import Anthropic from "@anthropic-ai/sdk";

import type { AgentRun } from "@/lib/agents/types";
import type { GeneratedChallenge } from "@/lib/challenge/types";
import type { JudgeResult } from "@/lib/judge/rubric-judge";

const JUDGE_MODEL = "claude-sonnet-4-6";

const JUDGE_SYSTEM = `You are an impartial AI judge evaluating agent submissions for a challenge.
Score against the rubric and return ONLY a JSON object — no prose, no markdown fences.`;

function buildJudgePrompt(output: string, challenge: GeneratedChallenge): string {
  const criteria = challenge.rubricCriteria.map((c, i) => `- ${i + 1}. ${c}`).join("\n");

  return `Score this submission for the challenge below.

CHALLENGE: ${challenge.title}
TASK: ${challenge.brief}

REQUIRED OUTPUT FORMAT:
${challenge.outputFormat}

RUBRIC CRITERIA:
${criteria}

SOURCE DOCUMENT (ground truth — penalize facts not found here):
${challenge.inputDoc}

SUBMISSION TO EVALUATE:
${output}

Score using these dimensions (same scale as executive-summary battles):
- accuracy: 0–25. Are stated facts consistent with the source document?
- completeness: 0–20. Does it cover all required themes from the source?
- structure: 0–15. Does it follow the required output format and sections?
- riskId: 0–10. How well are risks identified and explained?
- recommendation: 0–10. Are recommendations specific, actionable, and prioritized?
- hallucinationPenalty: 0–15. Points to DEDUCT for facts not in the source. 0 if clean.
- formatPenalty: 0–10. Points to DEDUCT if required sections are missing or malformed.

Return ONLY this JSON:
{"accuracy":N,"completeness":N,"structure":N,"riskId":N,"recommendation":N,"hallucinationPenalty":N,"formatPenalty":N}`;
}

function clampResult(r: JudgeResult): JudgeResult {
  return {
    accuracy: clamp(r.accuracy, 0, 25),
    completeness: clamp(r.completeness, 0, 20),
    structure: clamp(r.structure, 0, 15),
    riskId: clamp(r.riskId, 0, 10),
    recommendation: clamp(r.recommendation, 0, 10),
    hallucinationPenalty: clamp(r.hallucinationPenalty, 0, 15),
    formatPenalty: clamp(r.formatPenalty, 0, 10),
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(v)));
}

function heuristicJudge(output: string, challenge: GeneratedChallenge): JudgeResult {
  const lower = output.toLowerCase();
  const formatLower = challenge.outputFormat.toLowerCase();
  const wantsExec = formatLower.includes("executive summary");
  const wantsRisks = formatLower.includes("risk");
  const wantsRecs = formatLower.includes("recommend");

  const hasExec = wantsExec ? lower.includes("executive summary") || lower.includes("summary") : output.length > 200;
  const hasRisks = wantsRisks ? lower.includes("risk") : true;
  const hasRecs = wantsRecs ? lower.includes("recommend") : true;
  const sections = [hasExec, hasRisks, hasRecs].filter(Boolean).length;

  const accuracy = output.length > 150 ? 17 : 11;
  const completeness = sections * 6;
  const structure = sections >= 3 ? 12 : 6;
  const riskId = hasRisks ? 7 : 3;
  const recommendation = hasRecs ? 7 : 3;
  const formatPenalty = sections < 3 ? 4 : 0;

  return { accuracy, completeness, structure, riskId, recommendation, hallucinationPenalty: 2, formatPenalty };
}

/** Judge a submission against a generated challenge rubric. */
export async function judgeChallengeOutput(
  output: string,
  challenge: GeneratedChallenge,
): Promise<JudgeResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return heuristicJudge(output, challenge);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: JUDGE_MODEL,
      max_tokens: 256,
      system: JUDGE_SYSTEM,
      messages: [{ role: "user", content: buildJudgePrompt(output, challenge) }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return clampResult(JSON.parse(text.trim()) as JudgeResult);
  } catch {
    return heuristicJudge(output, challenge);
  }
}

export function applyJudgeToRun(run: AgentRun, judged: JudgeResult): AgentRun {
  return {
    ...run,
    rubric: {
      accuracy: judged.accuracy,
      completeness: judged.completeness,
      structure: judged.structure,
      riskId: judged.riskId,
      recommendation: judged.recommendation,
    },
    hallucinationPenalty: judged.hallucinationPenalty,
    formatPenalty: judged.formatPenalty,
  };
}
