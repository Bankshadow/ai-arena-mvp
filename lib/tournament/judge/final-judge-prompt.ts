import type { AgentRun, Challenge } from "@/lib/tournament/types";

export type FinalJudgeScores = {
  accuracy: number;
  completeness: number;
  structure: number;
  usefulness: number;
  formatCompliance: number;
  reusability: number;
  enterpriseValue: number;
  repeatability: number;
  hallucinationPenalty: number;
  missingOutputPenalty: number;
  badFormattingPenalty: number;
  qualityJudgeNotes: string;
};

export function buildFinalJudgePrompt(run: AgentRun, challenge: Challenge): {
  system: string;
  user: string;
} {
  return {
    system:
      "You are the Final Quality Judge for an AI ARENA tournament. Score submissions against the rubric. Return ONLY valid JSON — no markdown fences.",
    user: `Score this submission (quality dimensions max 60, marketplace max 10):

Challenge: ${challenge.title}
Pass threshold: ${challenge.passThreshold}/100

Source document:
${challenge.inputDoc.slice(0, 4000)}

Required output format:
${challenge.outputFormat}

Agent: ${run.agentName}
Submission:
${run.fullOutput.slice(0, 6000)}

Return JSON:
{"accuracy":0-15,"completeness":0-15,"structure":0-10,"usefulness":0-10,"formatCompliance":0-10,"reusability":0-4,"enterpriseValue":0-3,"repeatability":0-3,"hallucinationPenalty":0 to -10,"missingOutputPenalty":0 or -10,"badFormattingPenalty":0 or -5,"qualityJudgeNotes":"one sentence"}`,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(v)));
}

export function parseFinalJudgeResponse(text: string): FinalJudgeScores {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
  const r = JSON.parse(trimmed) as FinalJudgeScores;
  return {
    accuracy: clamp(r.accuracy, 0, 15),
    completeness: clamp(r.completeness, 0, 15),
    structure: clamp(r.structure, 0, 10),
    usefulness: clamp(r.usefulness, 0, 10),
    formatCompliance: clamp(r.formatCompliance, 0, 10),
    reusability: clamp(r.reusability, 0, 4),
    enterpriseValue: clamp(r.enterpriseValue, 0, 3),
    repeatability: clamp(r.repeatability, 0, 3),
    hallucinationPenalty: clamp(r.hallucinationPenalty, -10, 0),
    missingOutputPenalty: r.missingOutputPenalty <= -5 ? -10 : 0,
    badFormattingPenalty: clamp(r.badFormattingPenalty, -5, 0),
    qualityJudgeNotes: r.qualityJudgeNotes ?? "Final judge scored submission.",
  };
}
