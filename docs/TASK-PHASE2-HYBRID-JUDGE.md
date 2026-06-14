# TASK — Phase 2: T-MVP3 Hybrid Final Judge

**Status:** ✅ Implemented (2026-06-14)  
**Reference:** [`docs/TOURNAMENT-ENGINE-V2.md`](TOURNAMENT-ENGINE-V2.md) · Phase 1 [`TASK-PHASE1-TOURNAMENT-ENGINE.md`](TASK-PHASE1-TOURNAMENT-ENGINE.md)

---

## Goal

In `hybrid_quality` mode, run **Groq (or mock) agent loops** but score runs with a **premium final judge** (Anthropic or OpenAI) when keys exist. Fall back to mock/heuristic judging when keys or guard skip.

---

## What shipped

| Component | Location |
|-----------|----------|
| Anthropic adapter | `lib/tournament/providers/anthropic-adapter.ts` |
| OpenAI adapter | `lib/tournament/providers/openai-adapter.ts` |
| Hybrid evaluator | `lib/tournament/judge/hybrid-evaluator.ts` |
| Final judge prompt + parse | `lib/tournament/judge/final-judge-prompt.ts` |
| Shared efficiency scores | `lib/tournament/judge/efficiency-scores.ts` |
| Premium routing | `lib/tournament/router/runtime-modes.ts`, `task-routes.ts` |
| Server mode resolution | `lib/tournament/routing/resolve-mode.ts` (hybrid without Groq if premium key) |
| Routed loop wiring | `lib/tournament/routed-loop.ts` |

---

## Behavior

| Mode | Agent runs | Final judge |
|------|------------|-------------|
| `mock` | Mock | Mock/heuristic |
| `groq_free` | Groq (or mock) | Mock/heuristic |
| `hybrid_quality` + Groq | Groq | Premium if `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` |
| `hybrid_quality` + premium only | Mock | Premium final judge |
| Guard `skip_final_judge` | Any | Mock/heuristic |
| Parse/API failure per run | — | Mock fallback for that run only |

---

## Env vars

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Premium final judge (preferred) |
| `OPENAI_API_KEY` | Premium final judge fallback |
| `TOURNAMENT_ANTHROPIC_JUDGE_MODEL` | Override Anthropic judge model |
| `TOURNAMENT_OPENAI_JUDGE_MODEL` | Override OpenAI judge model |
| `GROQ_API_KEY` | Optional for hybrid agent runs |

---

## Verification

```bash
npm run smoke:router   # hybrid final_judge routing + resolve without Groq
npm run build
```

Manual: set `hybrid_quality` in `/admin`, run a tournament round with `ANTHROPIC_API_KEY` — evaluation notes should show `anthropic-final` or `openai-final`.
