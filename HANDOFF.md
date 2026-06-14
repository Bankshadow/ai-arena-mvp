# AI ARENA — Handoff Log
Date: 2026-06-14 | Prepared for Cursor | Last updated: 2026-06-14 (post-audit fixes)

---

## Project Overview

**AI ARENA** — AI workflow efficiency competition platform.
Core concept: AI Agent personas compete first to seed the leaderboard (solve cold-start), then human users join and compete against them.

Stack: Next.js 16.2.6 (Turbopack), React 19, TypeScript, Supabase, Drizzle ORM, Tailwind CSS, `@anthropic-ai/sdk`

---

## MVP Status

| MVP | Feature | Status |
|-----|---------|--------|
| MVP1 | 10 AI Agent personas + simulated leaderboard | ✅ Done |
| MVP2 | Challenge page + submission form → Supabase | ✅ Done |
| MVP3 | Human vs AI arena (AI Judge scoring) | ✅ Done |
| MVP4 | Enterprise private benchmark | ✅ Done |
| MVP5 | Real LLM API runner + AI Judge | ✅ Done |
| i18n | EN/TH locale switcher + dictionaries | ✅ Done |

---

## Audit Log — Resolved (2026-06-14)

| # | Issue | Fix |
|---|-------|-----|
| 1 | Dead code — `components/leaderboard/leaderboard-table.tsx` never imported | ✅ Deleted; active component is `components/LeaderboardTable.tsx` |
| 2 | Arena (MVP3) used heuristic judge, not AI Judge | ✅ Added `POST /api/judge-output`; `arena-view.tsx` calls it before `rankHuman()` |

---

## What Was Built (MVP5 + post-audit)

### Files Created
- `lib/runner/prompt-builder.ts` — Per-agent prompt strategies for all 10 personas. Each persona has a distinct system prompt + multi-step workflow (e.g. laureate: draft→critique→rewrite, redliner: 2-round adversarial review, hivemind: 3 specialist analysts)
- `lib/runner/run-agent.ts` — Calls real Anthropic API. Model mapping: frugal/spartan → `claude-haiku-4-5`, sprinter/hivemind/scholar/redliner/sentinel → `claude-sonnet-4-6`, laureate/architect/atlas → `claude-opus-4-8`. Captures real tokensIn/tokensOut/costUsd/latencyMs.
- `lib/judge/rubric-judge.ts` — AI Judge using `claude-sonnet-4-6`. Scores 5 rubric dimensions: accuracy(0-25), completeness(0-20), structure(0-15), riskId(0-10), recommendation(0-10). Also returns hallucinationPenalty and formatPenalty. Falls back to heuristic keyword judge when no API key.
- `app/api/run-agent/route.ts` — `POST /api/run-agent` body: `{agentId, challengeSlug}`. Orchestrates: run → judge → scoreField() → returns `{run, score, fullOutput}`.
- `app/api/judge-output/route.ts` — `POST /api/judge-output` body: `{output}`. Runs `judgeOutput()` and returns rubric scores. Used by Arena (MVP3). Works without API key (heuristic fallback).

### Files Modified
- `lib/env.ts` — Added `hasAnthropicKey()`
- `.env.example` — Added `ANTHROPIC_API_KEY="sk-ant-..."`
- `components/admin/admin-review-panel.tsx` — Added "Run Real Agent" panel (violet section at top of admin page). Persona picker + real-time results display.
- `components/arena/arena-view.tsx` — Submits to `/api/judge-output`, passes rubric into `rankHuman()`; loading + error states.
- `lib/agents/human.ts` — `rankHuman()` accepts optional `JudgeResult` from AI Judge; heuristic fallback when omitted (Enterprise demo still uses this).
- `package.json` — `@anthropic-ai/sdk` installed

### Files Deleted
- `components/leaderboard/leaderboard-table.tsx` — unused duplicate of `LeaderboardTable.tsx`

### Env Required
Add to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Architecture

```
Challenge input (BOARD_REPORT in prompt-builder.ts)
        ↓
lib/runner/run-agent.ts  ← calls Anthropic API with per-persona prompt
        ↓
lib/judge/rubric-judge.ts  ← claude-sonnet-4-6 judges the output
        ↓
lib/agents/scoring.ts::scoreField()  ← pure scoring pipeline (shared with mock)
        ↓
app/api/run-agent/route.ts  ← returns {run, score, fullOutput}
        ↓
components/admin/admin-review-panel.tsx  ← displays result

Arena (MVP3) path:
  user output → POST /api/judge-output → rankHuman(judged) → leaderboard UI
```

### Scoring Formula
```
FINAL = 0.55·qualityAdj + 0.20·costEff + 0.10·tokenEff + 0.10·speedEff + 0.05·robustness
qualityAdj = qualityRaw − hallucinationPenalty − formatPenalty
qualityRaw = accuracy + completeness + structure + riskId + recommendation  (max 80)
```

### Model Pricing (used in run-agent.ts)
- `claude-haiku-4-5`: $0.000001/in $0.000005/out
- `claude-sonnet-4-6`: $0.000003/in $0.000015/out
- `claude-opus-4-8`: $0.000005/in $0.000025/out

---

## Known Issues (Open)

_None from the audit log — see Next Steps for remaining work._

---

## Key File Map

```
lib/
  agents/
    types.ts          — AgentPersona, AgentRun, AgentScore, LeaderboardEntry, RubricScores
    personas.ts       — 10 agent personas (frugal, laureate, sprinter, hivemind, scholar, spartan, architect, redliner, sentinel, atlas)
    simulate.ts       — Deterministic mock data + getAgentRuns() / getAgentLeaderboard()
    scoring.ts        — scoreField() pure function — shared by agents + humans
    human.ts          — rankHuman() injects human run into agent field and re-scores (optional AI Judge rubric)
  runner/
    prompt-builder.ts — buildPrompt(agentId) → {systemPrompt, userPrompt}; BOARD_REPORT const
    run-agent.ts      — runAgent(agentId, challengeSlug) → {run, fullOutput}
  judge/
    rubric-judge.ts   — judgeOutput(text) → JudgeResult (rubric + penalties)
    score-submission.ts — legacy OpenAI judge (not used by new flow)
  data/
    challenges.ts     — EXECUTIVE_SUMMARY_BATTLE challenge definition
  supabase/
    index.ts          — createBrowserSupabase(), isSupabaseConfigured()
    scoring.ts        — computeCostScore(), computeFinalScore()
    types.ts          — SubmissionRow, SubmissionStatus
  env.ts              — hasDatabaseUrl(), hasOpenAiKey(), hasAnthropicKey()
  constants.ts        — DEFAULT_CHALLENGE_SLUG
  i18n/               — EN/TH dictionaries, locale provider, server helpers

app/
  page.tsx                          — Landing page
  agents/page.tsx                   — Agent roster
  agents/[id]/page.tsx              — Agent detail (params is Promise<{id}> — must await)
  arena/page.tsx                    — Human vs AI arena (MVP3)
  challenge/[slug]/page.tsx         — Challenge detail
  leaderboard/page.tsx              — Live leaderboard (Supabase + fallback mock)
  workflows/page.tsx                — Workflow showcase
  enterprise/page.tsx               — Private benchmark (MVP4)
  admin/page.tsx                    — Admin review panel + Real Agent runner
  submit/page.tsx                   — Submission form
  api/run-agent/route.ts            — POST: run real agent + judge
  api/judge-output/route.ts         — POST: judge human output (Arena)

components/
  Nav.tsx                           — Navigation (8 links, i18n)
  LeaderboardTable.tsx              — Active leaderboard table component
  admin/admin-review-panel.tsx      — Admin UI (submission review + real agent runner)
  arena/arena-view.tsx              — MVP3 human vs AI comparison (AI Judge)
  challenge/challenge-detail.tsx    — Challenge page UI
  enterprise/enterprise-view.tsx    — MVP4 private benchmark UI
  landing/landing-page.tsx          — Landing page
  leaderboard/leaderboard-view.tsx  — Leaderboard page logic
  submit/mvp-submit-form.tsx        — Submission form (posts to Supabase directly)
  workflows/workflow-grid.tsx       — Workflow cards
  workflows/workflows-page-shell.tsx — Workflow page shell
  i18n/
    locale-provider.tsx             — useTranslations() hook
    language-switcher.tsx           — EN/TH switcher

lib/i18n/dictionaries/
  en/   — English strings (nav.ts, pages.ts, landing.ts)
  th/   — Thai strings (nav.ts, pages.ts, landing.ts)
```

---

## Next Steps (Suggested)

1. **Persist real agent runs** — Save results from `/api/run-agent` to Supabase `submissions` table so real runs appear on the public leaderboard
2. **Enterprise AI Judge** — Wire `/api/judge-output` into `enterprise-view.tsx` when users paste real output (currently uses heuristic via quality slider)
3. **Workflows content** — The workflows page shows mock data; populate with real workflow case studies
4. **Auth** — Add Supabase Auth so users have persistent submission history

---

## Next.js 16 Breaking Change (Critical)

Dynamic route params are a `Promise` and must be awaited:
```typescript
// app/agents/[id]/page.tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // ← must await
}
```
Do NOT write `params.id` directly — it will be undefined in production.
