import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";

import type {
  ChallengeDifficulty,
  GeneratedChallenge,
  GenerateChallengeInput,
} from "@/lib/challenge/types";

const DESIGNER_MODEL = "claude-sonnet-4-6";

const DESIGNER_SYSTEM = `You are a challenge designer for an AI efficiency competition.
Create fair, self-contained challenges with a source document agents must read and a clear deliverable format.
Return ONLY valid JSON — no markdown fences, no commentary.`;

type ChallengePayload = Omit<GeneratedChallenge, "id" | "topic" | "difficulty" | "createdAt">;

function buildPrompt(topic: string, difficulty: ChallengeDifficulty): string {
  return `Design a ${difficulty}-difficulty challenge about: "${topic}".

Requirements:
- inputDoc: 600–1200 words of realistic fictional source material agents must summarize/analyze
- outputFormat: explicit section headings and structure agents must follow
- rubricCriteria: exactly 5 evaluation criteria as strings
- passThreshold: integer 60–75 (minimum quality score out of 100 to pass)
- brief: one paragraph explaining what agents must produce

Return ONLY this JSON shape:
{"title":"...","brief":"...","inputDoc":"...","outputFormat":"...","rubricCriteria":["...","...","...","...","..."],"passThreshold":65}`;
}

function clampDifficulty(d?: ChallengeDifficulty): ChallengeDifficulty {
  return d ?? "medium";
}

function clampPayload(raw: ChallengePayload, topic: string, difficulty: ChallengeDifficulty): GeneratedChallenge {
  return {
    id: randomUUID(),
    title: raw.title?.trim() || `${topic} Challenge`,
    brief: raw.brief?.trim() || `Analyze the source document and produce structured output about ${topic}.`,
    inputDoc: raw.inputDoc?.trim() || fallbackChallenge(topic, difficulty).inputDoc,
    outputFormat: raw.outputFormat?.trim() || fallbackChallenge(topic, difficulty).outputFormat,
    rubricCriteria:
      Array.isArray(raw.rubricCriteria) && raw.rubricCriteria.length >= 5
        ? raw.rubricCriteria.slice(0, 5).map(String)
        : fallbackChallenge(topic, difficulty).rubricCriteria,
    passThreshold: clampThreshold(raw.passThreshold),
    topic,
    difficulty,
    createdAt: new Date().toISOString(),
  };
}

function clampThreshold(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 65;
  return Math.min(75, Math.max(60, Math.round(n)));
}

function parseJson(text: string): ChallengePayload {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(trimmed) as ChallengePayload;
}

/** Deterministic fallback when no API key or generation fails. */
export function fallbackChallenge(
  topic: string,
  difficulty: ChallengeDifficulty,
): GeneratedChallenge {
  const threshold = difficulty === "easy" ? 60 : difficulty === "hard" ? 72 : 65;
  return {
    id: randomUUID(),
    title: `${topic} — Efficiency Brief`,
    brief: `Read the source document and produce a structured brief about ${topic}. Meet all required sections with accurate facts from the source only.`,
    inputDoc: `NORTHSTAR ANALYTICS — INTERNAL BRIEF (${topic.toUpperCase()})

EXECUTIVE CONTEXT
Northstar Analytics is a mid-size B2B SaaS company ($94M ARR) evaluating its ${topic} strategy for FY2027. The leadership team needs a concise brief for the next board meeting.

CURRENT STATE
- Active customers: 1,240 (+14% YoY)
- Gross retention: 91%; net retention: 108%
- ${topic} initiative budget: $4.2M approved in Q2
- Pilot cohort: 180 accounts, 62% adoption within 30 days
- Support tickets related to ${topic}: down 18% after onboarding revamp

KEY METRICS
- Time-to-value for new ${topic} users: 11 days (target: 7)
- NPS for ${topic} feature set: +34 (company average: +28)
- Churn in accounts without ${topic} enabled: 9.4% vs 5.1% with adoption
- Competitive gap: two rivals launched similar capabilities at 20–35% lower price

RISKS
1. Pricing pressure in mid-market segment
2. Integration backlog — 47 open API requests from enterprise clients
3. Compliance review pending for EU data residency
4. Engineering capacity: 3 open senior roles unfilled for 90+ days
5. Customer concentration: top 8 accounts = 31% of ${topic}-related revenue

Q4 PRIORITIES
- Expand ${topic} to 400 additional accounts
- Reduce implementation time to 8 days
- Launch self-serve analytics dashboard
- Board asks for clear ROI narrative and top 3 investment recommendations`,
    outputFormat: `Produce exactly three sections:

## Executive Summary
(3–5 sentences on overall ${topic} health and business impact)

## Key Risks
(Numbered list of top strategic risks with brief impact notes)

## Recommendations
(Numbered list of specific, prioritized actions for leadership)`,
    rubricCriteria: [
      "Accuracy — facts and figures match the source document",
      "Completeness — covers metrics, risks, and Q4 priorities",
      "Structure — all three required sections present and organized",
      "Risk identification — strategic risks ranked with impact",
      "Recommendations — specific, actionable, and prioritized",
    ],
    passThreshold: threshold,
    topic,
    difficulty,
    createdAt: new Date().toISOString(),
  };
}

/** Generate a challenge via the Challenge Designer agent. */
export async function generateChallenge(input: GenerateChallengeInput = {}): Promise<GeneratedChallenge> {
  const topic = input.topic?.trim() || "product analytics rollout";
  const difficulty = clampDifficulty(input.difficulty);

  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackChallenge(topic, difficulty);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: DESIGNER_MODEL,
      max_tokens: 4096,
      system: DESIGNER_SYSTEM,
      messages: [{ role: "user", content: buildPrompt(topic, difficulty) }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const payload = parseJson(text);
    return clampPayload(payload, topic, difficulty);
  } catch {
    return fallbackChallenge(topic, difficulty);
  }
}
