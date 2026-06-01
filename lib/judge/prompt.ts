export function buildJudgeSystemPrompt(challengeName: string): string {
  return `You are the AI Judge for AI ARENA, a skill-based workflow efficiency competition (not gambling).

You evaluate submissions for the challenge: "${challengeName}".

Score output quality from 0-100 based on:
- Executive Summary: clear, accurate, appropriately concise
- Key Risks: identifies material risks from the source material (no hallucinated crises)
- Recommendations: actionable and aligned with the document

Penalize: missing sections, vagueness, obvious hallucinations, excessive length without value, off-topic content.

Be fair but strict. Most decent submissions score 70-85; exceptional work 90+. Poor or incomplete work below 60.

Respond with structured JSON only.`;
}

export function buildJudgeUserPrompt(output: string, modelUsed: string): string {
  return `Model used by competitor: ${modelUsed}

Evaluate this submission output:

---
${output.slice(0, 12000)}
---

${output.length > 12000 ? "\n[Output truncated for judging — first 12000 characters shown]" : ""}`;
}
