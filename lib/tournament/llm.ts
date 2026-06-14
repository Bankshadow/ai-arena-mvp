import Anthropic from "@anthropic-ai/sdk";

import { CREATOR_AGENTS, getCompetitor } from "@/lib/tournament/agents";
import { evaluateAgentRunsMock, newId } from "@/lib/tournament/engine-mock";
import { breakdownEvaluation } from "@/lib/tournament/scoring";
import type {
  AgentRun,
  Challenge,
  ChallengeIdea,
  CompetitorAgentId,
  CreatorAgentId,
  Evaluation,
  EvaluationScores,
} from "@/lib/tournament/types";

type ModelId = "claude-haiku-4-5" | "claude-sonnet-4-6" | "claude-opus-4-8";

const PRICING: Record<ModelId, { in: number; out: number }> = {
  "claude-haiku-4-5": { in: 0.000001, out: 0.000005 },
  "claude-sonnet-4-6": { in: 0.000003, out: 0.000015 },
  "claude-opus-4-8": { in: 0.000005, out: 0.000025 },
};

const COMPETITOR_CONFIG: Record<
  CompetitorAgentId,
  { model: ModelId; maxTokens: number; workflowSteps: number; system: string }
> = {
  lean: {
    model: "claude-haiku-4-5",
    maxTokens: 900,
    workflowSteps: 1,
    system: "You are a lean AI agent. Be concise. Minimize tokens while meeting all required sections.",
  },
  premium: {
    model: "claude-opus-4-8",
    maxTokens: 2500,
    workflowSteps: 3,
    system: "You are a premium quality agent. Draft, self-critique, then deliver a polished final answer.",
  },
  rag: {
    model: "claude-sonnet-4-6",
    maxTokens: 1500,
    workflowSteps: 2,
    system: "You are a RAG agent. Ground every claim in the source document with section citations.",
  },
  "multi-agent": {
    model: "claude-sonnet-4-6",
    maxTokens: 2200,
    workflowSteps: 4,
    system: "You simulate three specialists (analyst, risk, strategy) then merge into one deliverable.",
  },
  fast: {
    model: "claude-sonnet-4-6",
    maxTokens: 800,
    workflowSteps: 1,
    system: "You are a fast agent. Single pass, tight output, no preamble.",
  },
};

function client(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function parseJson<T>(text: string): T {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(trimmed) as T;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(v)));
}

export async function generateChallengeIdeasLLM(round: number): Promise<ChallengeIdea[]> {
  const creators = CREATOR_AGENTS.map((c) => `${c.id}: ${c.name} (${c.specialty})`).join("\n");

  const message = await client().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: "You design AI tournament challenges. Return ONLY valid JSON — no markdown fences.",
    messages: [
      {
        role: "user",
        content: `Tournament round ${round}. Three creator agents propose one challenge idea each:\n\n${creators}\n\nReturn JSON array of exactly 3 objects:\n[{"creatorId":"strategy"|"technical"|"growth","title":"...","brief":"...","topic":"...","difficulty":"easy"|"medium"|"hard","noveltyScore":0-100,"feasibilityScore":0-100}]`,
      },
    ],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  type RawIdea = {
    creatorId: CreatorAgentId;
    title: string;
    brief: string;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    noveltyScore: number;
    feasibilityScore: number;
  };

  const raw = parseJson<RawIdea[]>(text);
  return raw.slice(0, 3).map((item) => {
    const creator = CREATOR_AGENTS.find((c) => c.id === item.creatorId);
    const novelty = clamp(item.noveltyScore, 40, 100);
    const feasibility = clamp(item.feasibilityScore, 40, 100);
    return {
      id: newId(),
      creatorId: item.creatorId,
      creatorName: creator?.name ?? item.creatorId,
      title: item.title,
      brief: item.brief,
      topic: item.topic,
      difficulty: item.difficulty,
      noveltyScore: novelty,
      feasibilityScore: feasibility,
      selectionScore: Math.round(novelty * 0.45 + feasibility * 0.55),
    };
  });
}

export async function buildChallengeDocumentLLM(idea: ChallengeIdea): Promise<Challenge> {
  const passThreshold = idea.difficulty === "easy" ? 62 : idea.difficulty === "hard" ? 72 : 66;

  const message = await client().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: "You write realistic fictional source documents for AI benchmarks. Return ONLY JSON.",
    messages: [
      {
        role: "user",
        content: `Create a source document for this tournament challenge:\n\nTitle: ${idea.title}\nBrief: ${idea.brief}\nTopic: ${idea.topic}\n\nReturn JSON:\n{"inputDoc":"600-900 word fictional source memo","outputFormat":"required markdown sections"}`,
      },
    ],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const parsed = parseJson<{ inputDoc: string; outputFormat?: string }>(text);

  return {
    id: newId(),
    title: idea.title,
    brief: idea.brief,
    inputDoc: parsed.inputDoc,
    outputFormat: parsed.outputFormat ?? "## Executive Summary\n## Key Risks\n## Recommendations",
    passThreshold,
    costLimitUsd: 1.0,
    selectedFrom: idea.creatorId,
    createdAt: new Date().toISOString(),
  };
}

export function selectBestChallengeIdea(ideas: ChallengeIdea[]): ChallengeIdea {
  return [...ideas].sort((a, b) => b.selectionScore - a.selectionScore)[0]!;
}

export async function runCompetitorAgentLLM(
  agentId: CompetitorAgentId,
  challenge: Challenge,
): Promise<AgentRun> {
  const agent = getCompetitor(agentId);
  const cfg = COMPETITOR_CONFIG[agentId];
  const t0 = Date.now();

  const message = await client().messages.create({
    model: cfg.model,
    max_tokens: cfg.maxTokens,
    system: cfg.system,
    messages: [
      {
        role: "user",
        content: `Challenge: ${challenge.title}\n${challenge.brief}\n\nRequired format:\n${challenge.outputFormat}\n\nSource document:\n${challenge.inputDoc}`,
      },
    ],
  });

  const latencyMs = Date.now() - t0;
  const fullOutput = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");

  const tokensIn = message.usage.input_tokens;
  const tokensOut = message.usage.output_tokens;
  const pricing = PRICING[cfg.model];
  const costUsd = Math.round((tokensIn * pricing.in + tokensOut * pricing.out) * 10000) / 10000;

  return {
    id: newId(),
    agentId,
    agentName: agent.name,
    challengeId: challenge.id,
    modelUsed: cfg.model,
    tokensIn,
    tokensOut,
    costUsd,
    latencyMs,
    workflowSteps: cfg.workflowSteps,
    outputPreview: fullOutput.slice(0, 140).replace(/\n/g, " "),
    fullOutput,
  };
}

export async function runCompetitorAgentsLLM(challenge: Challenge): Promise<AgentRun[]> {
  const ids: CompetitorAgentId[] = ["lean", "premium", "rag", "multi-agent", "fast"];
  return Promise.all(ids.map((id) => runCompetitorAgentLLM(id, challenge)));
}

type QualityJudgeResult = {
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

async function judgeRunQualityLLM(run: AgentRun, challenge: Challenge): Promise<QualityJudgeResult> {
  const message = await client().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: "You are the Quality Judge for an AI tournament. Return ONLY JSON.",
    messages: [
      {
        role: "user",
        content: `Score this submission (quality max 60, marketplace max 10):\n\nChallenge: ${challenge.title}\nSource:\n${challenge.inputDoc}\n\nRequired:\n${challenge.outputFormat}\n\nSubmission:\n${run.fullOutput}\n\nReturn JSON:\n{"accuracy":0-15,"completeness":0-15,"structure":0-10,"usefulness":0-10,"formatCompliance":0-10,"reusability":0-4,"enterpriseValue":0-3,"repeatability":0-3,"hallucinationPenalty":0 to -10,"missingOutputPenalty":0 or -10,"badFormattingPenalty":0 or -5,"qualityJudgeNotes":"..."}`,
      },
    ],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const r = parseJson<QualityJudgeResult>(text);
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
    qualityJudgeNotes: r.qualityJudgeNotes ?? "Quality judged by LLM.",
  };
}

function efficiencyScoresForRun(run: AgentRun, runs: AgentRun[], challenge: Challenge) {
  const minTokens = Math.min(...runs.map((r) => r.tokensIn + r.tokensOut));
  const minCost = Math.min(...runs.map((r) => r.costUsd));
  const minLatency = Math.min(...runs.map((r) => r.latencyMs));

  return {
    costEfficiency: Math.round(10 * Math.min(1, minCost / run.costUsd)),
    tokenEfficiency: Math.round(10 * Math.min(1, minTokens / (run.tokensIn + run.tokensOut))),
    latency: Math.round(5 * Math.min(1, minLatency / run.latencyMs)),
    workflowSimplicity: Math.round(5 * (1 / run.workflowSteps) * Math.min(run.workflowSteps, 2)),
    costLimitPenalty: run.costUsd > challenge.costLimitUsd ? -10 : 0,
    efficiencyJudgeNotes:
      run.tokensIn + run.tokensOut === minTokens
        ? "Lowest token footprint in field."
        : `Tokens: ${(run.tokensIn + run.tokensOut).toLocaleString()} in field of ${runs.length}.`,
  };
}

export async function evaluateAgentRunsLLM(
  runs: AgentRun[],
  challenge: Challenge,
): Promise<Evaluation[]> {
  const judged = await Promise.all(runs.map((run) => judgeRunQualityLLM(run, challenge)));

  return runs.map((run, i) => {
    const q = judged[i]!;
    const eff = efficiencyScoresForRun(run, runs, challenge);
    const scores: EvaluationScores = {
      accuracy: q.accuracy,
      completeness: q.completeness,
      structure: q.structure,
      usefulness: q.usefulness,
      formatCompliance: q.formatCompliance,
      costEfficiency: eff.costEfficiency,
      tokenEfficiency: eff.tokenEfficiency,
      latency: eff.latency,
      workflowSimplicity: eff.workflowSimplicity,
      reusability: q.reusability,
      enterpriseValue: q.enterpriseValue,
      repeatability: q.repeatability,
      hallucinationPenalty: q.hallucinationPenalty,
      costLimitPenalty: eff.costLimitPenalty,
      missingOutputPenalty: q.missingOutputPenalty,
      badFormattingPenalty: q.badFormattingPenalty,
    };

    const breakdown = breakdownEvaluation(scores);
    return {
      id: newId(),
      runId: run.id,
      agentId: run.agentId,
      agentName: run.agentName,
      qualityJudgeNotes: q.qualityJudgeNotes,
      efficiencyJudgeNotes: eff.efficiencyJudgeNotes,
      scores,
      ...breakdown,
      passed: breakdown.totalScore >= challenge.passThreshold,
    };
  });
}

export async function evaluateAgentRunsWithFallback(
  runs: AgentRun[],
  challenge: Challenge,
  round: number,
): Promise<Evaluation[]> {
  try {
    return await evaluateAgentRunsLLM(runs, challenge);
  } catch {
    return evaluateAgentRunsMock(runs, challenge, round);
  }
}
