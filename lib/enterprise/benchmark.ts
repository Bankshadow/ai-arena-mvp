import type { JudgeResult } from "@/lib/judge/rubric-judge";

export type EnterpriseBenchmarkInput = {
  internalName: string;
  internalCost: number;
  output: string;
  selectedAgentIds: string[];
};

export async function runEnterpriseBenchmark(input: EnterpriseBenchmarkInput): Promise<{
  judged: JudgeResult | null;
  judgeMode: "llm" | "heuristic";
}> {
  if (input.output.trim().length < 40) {
    throw new Error("Paste at least 40 characters of workflow output.");
  }

  try {
    const res = await fetch("/api/judge-output", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ output: input.output }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Judge failed");
    }
    return { judged: data as JudgeResult, judgeMode: "llm" as const };
  } catch (err) {
    if (err instanceof Error && err.message.includes("40 characters")) throw err;
    return { judged: null, judgeMode: "heuristic" as const };
  }
}
