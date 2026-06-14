import type { AgentPersonaId } from "@/lib/agents/types";

/** Synthetic board report used as the challenge input. */
export const BOARD_REPORT = `
ACME TECHNOLOGIES INC.
Q3 2026 BOARD REPORT — CONFIDENTIAL

FINANCIAL PERFORMANCE
Revenue: $142.3M (+18% YoY). Gross margin: 61% (vs 58% prior year). Operating expenses: $98.4M (+22% YoY), driven by headcount growth (+340 FTEs). EBITDA: $26.8M (-4% YoY). Net cash: $84M (down from $112M). Burn rate elevated at $9.2M/month due to infrastructure investment.

PRODUCT & TECHNOLOGY
AI Platform v3 launched in September. Early adopters report 40% reduction in workflow time. Churn on legacy plans: 12% (above 8% target). New ARR from AI Platform: $8.4M in first 6 weeks. Technical debt backlog increased to 1,200 story points; CTO estimates 2 quarters to resolve core issues. Three P1 incidents in Q3, one lasting 14 hours causing SLA breach for 23 enterprise clients.

MARKET & COMPETITIVE
Market share: 14.2% (up from 12.1%). Primary competitor launched a competing AI product at 30% lower price point. Two strategic accounts ($3.2M combined ARR) under renewal discussions flagging pricing concerns. Pipeline: $67M, up 31% QoQ. Win rate: 42% (vs 48% same period prior year).

STRATEGIC RISKS
1. Competitor pricing pressure threatening mid-market segment retention.
2. Infrastructure costs projected to increase 35% in Q4 as AI workloads scale.
3. Regulatory: EU AI Act compliance deadline is Q1 2027; current gap assessment shows 6 items non-compliant.
4. Key-person risk: VP of Engineering (15-year tenure) submitted resignation effective December 31.
5. Customer concentration: top 10 clients represent 38% of ARR.

OPERATIONS & TEAM
Headcount: 1,847 (+22% YoY). Attrition: 18% annualized (up from 13%). Employee NPS: +12 (down from +31). Three senior engineering departures in Q3. Hiring targets: 120 additional engineers in Q4 vs 68 currently in pipeline.

Q4 OUTLOOK
Revenue guidance: $148–154M. Operating margin expected to remain compressed. Board action items: (1) Approve $15M infrastructure capex. (2) Review competitive pricing strategy. (3) Authorize key-person retention program for top 20 engineering leaders.
`.trim();

type PromptPlan = {
  systemPrompt: string;
  userPrompt: string;
};

const OUTPUT_FORMAT = `
Produce exactly three sections with these headings:

## Executive Summary
(3–5 sentences covering overall business health, key wins, and financial position)

## Key Risks
(Numbered list of the top strategic risks with brief impact assessment for each)

## Recommendations
(Numbered list of concrete, actionable recommendations for the board)
`.trim();

export type PromptOptions = {
  report?: string;
  outputFormat?: string;
  brief?: string;
};

/** Builds the system + user prompt for each agent persona's strategy. */
export function buildPrompt(agentId: AgentPersonaId, options?: PromptOptions): PromptPlan {
  const report = options?.report ?? BOARD_REPORT;
  const format = options?.outputFormat ?? OUTPUT_FORMAT;

  let plan: PromptPlan;
  switch (agentId) {
    case "frugal":
      plan = {
        systemPrompt: "You are a concise business analyst.",
        userPrompt: `Summarize this board report for a busy executive.\n\n${format}\n\nREPORT:\n${report}`,
      };
      break;

    case "laureate":
      plan = {
        systemPrompt: `You are a senior management consultant with 20 years of board advisory experience. You excel at translating complex financial and operational data into precise, board-ready language. You evaluate your own work against rubric dimensions: accuracy, completeness, logical structure, risk identification, and quality of recommendations.`,
        userPrompt: `You will produce an executive summary in two passes.

PASS 1 — Draft: Write a complete executive summary of the board report below.

PASS 2 — Self-critique: Review your draft against these criteria:
- Accuracy: Are all figures correct and not hallucinated?
- Completeness: Does it cover financials, product, market, risks, and Q4 outlook?
- Structure: Are the three required sections clearly separated?
- Risk ID: Have you identified and ranked the top 3–5 strategic risks?
- Recommendations: Are recommendations specific and actionable?

Then produce your final, polished version.

${format}

BOARD REPORT:
${report}`,
      };
      break;

    case "sprinter":
      plan = {
        systemPrompt: "You are a fast executive summarizer. Output only the requested sections, no preamble.",
        userPrompt: `Summarize the board report below. Be concise. Do not explain your process.

${format}

REPORT:
${report}`,
      };
      break;

    case "hivemind":
      plan = {
        systemPrompt: `You are an orchestrator coordinating three specialist analysts:
- FINANCIAL ANALYST: Covers revenue, margin, cash, and burn.
- RISK ANALYST: Identifies and ranks strategic risks.
- STRATEGY ANALYST: Synthesizes recommendations.

Simulate each specialist's analysis, then merge their output into a unified executive summary.`,
        userPrompt: `Coordinate your three analysts to produce a unified executive summary of this board report.

Step 1 — Financial Analyst perspective (2–3 sentences on financial health)
Step 2 — Risk Analyst perspective (top risks enumerated)
Step 3 — Strategy Analyst perspective (concrete recommendations)
Step 4 — Merge all three into the final output below.

${format}

REPORT:
${report}`,
      };
      break;

    case "scholar":
      plan = {
        systemPrompt: `You are a research analyst who grounds every claim in the source document. You cite the specific section or data point that supports each statement. You never assert facts not found in the document.`,
        userPrompt: `Produce a grounded executive summary from the board report. For each claim, reference the source section (e.g., "[FINANCIAL PERFORMANCE]"). Do not include facts not stated in the document.

${format}

BOARD REPORT:
${report}`,
      };
      break;

    case "spartan":
      plan = {
        systemPrompt: "Summarize board reports for executives.",
        userPrompt: `Summarize this report for an executive.\n\n${format}\n\n${report}`,
      };
      break;

    case "architect":
      plan = {
        systemPrompt: `You are a structured planner who always outlines a plan before executing. Your output follows a strict governance template.`,
        userPrompt: `Think step by step, then produce the output.

PLAN:
1. Identify the top 3 financial metrics to highlight
2. List the strategic risks in priority order
3. Derive 3–5 actionable recommendations from the risks and financial data
4. Write the executive summary using the plan above

Now execute your plan and produce:

${format}

BOARD REPORT:
${report}`,
      };
      break;

    case "redliner":
      plan = {
        systemPrompt: `You are a critical reviewer who generates content, critiques it, and refines it. You are known for catching omissions and inaccuracies in executive summaries.`,
        userPrompt: `You will work in three passes.

ROUND 1 — Generate an initial executive summary.
CRITIQUE — List exactly 3 specific errors, omissions, or vague statements from your draft.
ROUND 2 — Fix each critique item and produce a refined summary.
FINAL CRITIQUE — List 2 remaining issues if any, then produce your final polished output.

${format}

BOARD REPORT:
${report}`,
      };
      break;

    case "sentinel":
      plan = {
        systemPrompt: `You are a risk-focused strategic analyst. Your specialty is identifying, ranking, and assessing strategic risks in board-level documents. You ensure risks are always the most detailed and actionable section of any summary.`,
        userPrompt: `Produce an executive summary with a strong focus on risk.

Step 1 — Extract all risk signals from the report (regulatory, competitive, operational, financial, people)
Step 2 — Rank them by severity (High / Medium / Low) and explain the impact
Step 3 — Write the full summary

${format}

BOARD REPORT:
${report}`,
      };
      break;

    case "atlas":
      plan = {
        systemPrompt: `You are an enterprise governance consultant producing board-ready output. Your summaries include confidence levels for every material claim, explicit data citations, and an audit trail note at the end.`,
        userPrompt: `Produce a governance-grade executive summary with:
- Confidence levels for material claims: [HIGH], [MED], [LOW]
- Explicit citations to the source section for each claim
- Concrete, numbered recommendations with priority designations (P1/P2/P3)
- A brief audit note at the end confirming what was verified

${format}

BOARD REPORT:
${report}`,
      };
      break;
  }

  if (options?.brief) {
    plan = { ...plan, userPrompt: `Challenge: ${options.brief}\n\n${plan.userPrompt}` };
  }

  return plan;
}
