import type { WorkflowCard } from "@/lib/data/mock-mvp";

const WORKFLOW_NOTES_MARKER = "--- Workflow notes ---";

export function splitPromptAndNotes(promptUsed: string): {
  prompt: string;
  notes: string;
} {
  const idx = promptUsed.indexOf(WORKFLOW_NOTES_MARKER);
  if (idx === -1) {
    return { prompt: promptUsed.trim(), notes: "" };
  }
  return {
    prompt: promptUsed.slice(0, idx).trim(),
    notes: promptUsed.slice(idx + WORKFLOW_NOTES_MARKER.length).trim(),
  };
}

export function appendWorkflowNotes(promptUsed: string, workflowNotes: string): string {
  const notes = workflowNotes.trim();
  if (!notes) return promptUsed.trim();
  return `${promptUsed.trim()}\n\n${WORKFLOW_NOTES_MARKER}\n${notes}`;
}

export function deriveWorkflowSteps(promptUsed: string, notes?: string): string[] {
  const source = (notes?.trim() || promptUsed).trim();
  const numbered = source
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(\d+[\).\]]|[-*•])\s*/, "").trim())
    .filter((line) => line.length >= 8);

  if (numbered.length >= 2) {
    return numbered.slice(0, 6);
  }

  const sentences = source
    .split(/(?:\.|;|\n)+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);

  if (sentences.length >= 2) {
    return sentences.slice(0, 5);
  }

  return [
    "Parse and chunk the input document",
    "Extract summary, risks, and recommendations",
    "Optimize model choice per step for cost",
    "Format final deliverable",
  ];
}

export function buildStrategySummary(prompt: string, notes: string): string {
  const text = (notes || prompt).replace(/\s+/g, " ").trim();
  if (text.length <= 200) return text;
  return `${text.slice(0, 197)}…`;
}

export function toWorkflowCard(
  rank: number,
  displayName: string,
  modelUsed: string,
  costUsd: number,
  qualityScore: number,
  promptUsed: string
): WorkflowCard {
  const { prompt, notes } = splitPromptAndNotes(promptUsed);
  return {
    rank,
    title: rank === 1 ? `${displayName}'s winning workflow` : `${displayName}'s workflow`,
    modelUsed,
    cost: `$${costUsd.toFixed(2)}`,
    qualityScore,
    strategySummary: buildStrategySummary(prompt, notes),
    steps: deriveWorkflowSteps(prompt, notes),
  };
}
