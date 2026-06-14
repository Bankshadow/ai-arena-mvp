import type { WorkflowCard } from "@/lib/data/mock-mvp";
import { MOCK_WORKFLOWS } from "@/lib/data/mock-mvp";

export type WorkflowDetail = WorkflowCard & {
  slug: string;
  promptTemplate: string;
  exportBundle: string;
};

const PROMPTS: Record<string, string> = {
  "section-first-pipeline": `You are an efficiency-focused analyst.

1. Extract only the sections needed from the source document.
2. Summarize each section in parallel (minimal tokens per call).
3. Run a dedicated risk pass on consolidated notes.
4. Format into: Executive Summary, Key Risks, Business Impact, Recommendations.

Keep total tokens under 4K. Prefer bullet structure over prose.`,
  "compress-then-structure": `Compress the input document into a tight bullet outline (max 400 words).
Then generate all required sections in one structured pass.
Validate risks against the outline before finalizing recommendations.`,
  "draft-refine": `Draft a complete first pass covering all required headings.
Run a critique pass listing missing risks and weak recommendations.
Rewrite the final answer incorporating critique fixes.`,
};

function buildExportBundle(detail: Omit<WorkflowDetail, "exportBundle">): string {
  return [
    `# ${detail.title}`,
    "",
    "## Strategy",
    detail.strategySummary,
    "",
    "## Steps",
    ...detail.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "## Prompt template",
    detail.promptTemplate,
    "",
    `Model: ${detail.modelUsed} · Est. cost: ${detail.cost} · Quality: ${detail.qualityScore}`,
  ].join("\n");
}

const SLUGS = ["section-first-pipeline", "compress-then-structure", "draft-refine"] as const;

export const WORKFLOW_CATALOG: WorkflowDetail[] = MOCK_WORKFLOWS.map((wf, i) => {
  const slug = SLUGS[i] ?? `workflow-${wf.rank}`;
  const promptTemplate = PROMPTS[slug] ?? `Execute the ${wf.title} workflow efficiently.`;
  const base = { ...wf, slug, promptTemplate };
  return { ...base, exportBundle: buildExportBundle(base) };
});

export function getWorkflowBySlug(slug: string): WorkflowDetail | undefined {
  return WORKFLOW_CATALOG.find((w) => w.slug === slug);
}

export function getWorkflowSlugByRank(rank: number): string | undefined {
  return WORKFLOW_CATALOG.find((w) => w.rank === rank)?.slug;
}

export function getAllWorkflowSlugs(): string[] {
  return WORKFLOW_CATALOG.map((w) => w.slug);
}
