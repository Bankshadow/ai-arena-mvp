import Anthropic from "@anthropic-ai/sdk";
import type { RubricScores } from "@/lib/agents/types";

const JUDGE_MODEL = "claude-sonnet-4-6";

const JUDGE_SYSTEM = `You are an impartial AI judge evaluating executive summaries produced by AI agents. You score each submission against a rubric and return ONLY a JSON object — no prose, no markdown fences.`;

const JUDGE_PROMPT = (output: string) => `Score this executive summary using the rubric below. Return ONLY a JSON object.

RUBRIC:
- accuracy: 0–25. Are all stated facts, figures, and claims consistent with the source document?
- completeness: 0–20. Does it cover financial performance, product/tech, market, risks, and Q4 outlook?
- structure: 0–15. Are the three required sections (Executive Summary, Key Risks, Recommendations) present and well-organized?
- riskId: 0–10. How thoroughly are strategic risks identified, ranked, and explained?
- recommendation: 0–10. Are the recommendations specific, actionable, and prioritized?
- hallucinationPenalty: 0–15. Points to DEDUCT if the summary contains facts not found in the source. 0 if clean.
- formatPenalty: 0–10. Points to DEDUCT if required headings or sections are missing or malformed.

SOURCE DOCUMENT REFERENCE (board report key facts):
- Revenue $142.3M +18% YoY, EBITDA $26.8M -4%, Net cash $84M, burn $9.2M/month
- AI Platform v3 launched, +$8.4M new ARR, legacy churn 12%, 3 P1 incidents
- Market share 14.2%, competitor 30% cheaper, win rate dropped 42% vs 48%
- Top 5 risks: competitor pricing, infra costs +35%, EU AI Act compliance, VP Eng resignation, customer concentration 38%
- Q4 guidance $148–154M, 3 board action items

EXECUTIVE SUMMARY TO EVALUATE:
${output}

Return ONLY this JSON (no other text):
{"accuracy":N,"completeness":N,"structure":N,"riskId":N,"recommendation":N,"hallucinationPenalty":N,"formatPenalty":N}`;

export type JudgeResult = RubricScores & {
  hallucinationPenalty: number;
  formatPenalty: number;
};

/** Run the AI Judge on a completed agent output. Falls back to heuristic if no API key. */
export async function judgeOutput(output: string): Promise<JudgeResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return heuristicJudge(output);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: JUDGE_MODEL,
      max_tokens: 256,
      system: JUDGE_SYSTEM,
      messages: [{ role: "user", content: JUDGE_PROMPT(output) }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const parsed = JSON.parse(text.trim()) as JudgeResult;
    return clampResult(parsed);
  } catch {
    return heuristicJudge(output);
  }
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

/** Heuristic fallback judge (no API key required). */
function heuristicJudge(output: string): JudgeResult {
  const lower = output.toLowerCase();
  const hasExecSummary = lower.includes("executive summary");
  const hasRisks = lower.includes("key risk") || lower.includes("strategic risk");
  const hasRecommendations = lower.includes("recommendation");
  const wordCount = output.split(/\s+/).length;

  const accuracy = wordCount > 100 ? 18 : 12;
  const completeness = [hasExecSummary, hasRisks, hasRecommendations].filter(Boolean).length * 6;
  const structure = hasExecSummary && hasRisks && hasRecommendations ? 12 : 6;
  const riskId = hasRisks ? 7 : 3;
  const recommendation = hasRecommendations ? 7 : 3;
  const formatPenalty = (!hasExecSummary || !hasRisks || !hasRecommendations) ? 4 : 0;

  return { accuracy, completeness, structure, riskId, recommendation, hallucinationPenalty: 2, formatPenalty };
}
