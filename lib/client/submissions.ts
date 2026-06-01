import {
  computeCostScore,
  computeFinalScore,
  estimateQualityScore,
} from "./scoring";

export type LocalSubmission = {
  id: string;
  name: string;
  email: string;
  role: string;
  promptUsed: string;
  modelUsed: string;
  estimatedCost: number;
  outputResult: string;
  workflowNotes: string;
  qualityScore: number;
  costScore: number;
  finalScore: number;
  createdAt: string;
};

const STORAGE_KEY = "ai-arena-submissions";

export function loadSubmissions(): LocalSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalSubmission[];
  } catch {
    return [];
  }
}

export function saveSubmission(
  data: Omit<LocalSubmission, "id" | "qualityScore" | "costScore" | "finalScore" | "createdAt">
): LocalSubmission {
  const qualityScore = estimateQualityScore(data.outputResult);
  const costScore = computeCostScore(data.estimatedCost);
  const finalScore = computeFinalScore(qualityScore, costScore);

  const entry: LocalSubmission = {
    ...data,
    id: crypto.randomUUID(),
    qualityScore,
    costScore,
    finalScore,
    createdAt: new Date().toISOString(),
  };

  const existing = loadSubmissions();
  existing.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return entry;
}

export function getBestSubmissionPerEmail(
  submissions: LocalSubmission[]
): LocalSubmission[] {
  const byEmail = new Map<string, LocalSubmission>();
  for (const sub of submissions) {
    const key = sub.email.toLowerCase();
    const prev = byEmail.get(key);
    if (!prev || sub.finalScore > prev.finalScore) {
      byEmail.set(key, sub);
    }
  }
  return Array.from(byEmail.values());
}
