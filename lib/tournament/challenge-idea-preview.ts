import type { Challenge, ChallengeIdea } from "@/lib/tournament/types";

/** Build a full challenge preview document from a generator idea (mock-first). */
export function buildChallengePreviewFromIdea(idea: ChallengeIdea): Challenge {
  const passThreshold =
    idea.difficulty === "easy" ? 62 : idea.difficulty === "hard" ? 72 : 66;

  return {
    id: idea.id,
    title: idea.title,
    brief: idea.brief,
    inputDoc:
      `SOURCE DOCUMENT — ${idea.title.toUpperCase()}\n\n` +
      `Context: Internal memo on ${idea.topic}. Key metrics include 18% YoY growth, ` +
      `91% gross retention, $4.2M initiative budget, and 47 open integration requests. ` +
      `Top risks: pricing pressure, compliance review, engineering capacity. ` +
      `Q4 priorities: expand rollout, reduce time-to-value, launch self-serve dashboard.`,
    outputFormat: "## Executive Summary\n## Key Risks\n## Recommendations",
    passThreshold,
    costLimitUsd: 1.0,
    selectedFrom: idea.creatorId,
    createdAt: new Date().toISOString(),
  };
}
