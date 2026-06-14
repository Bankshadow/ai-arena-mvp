# TASK — Phase 1: Multi-Provider Tournament Engine Foundation

**Status:** ✅ Phase 1 implemented (2026-06-14)  
**Date logged:** 2026-06-14  
**Reference:** [`docs/TOURNAMENT-ENGINE-V2.md`](TOURNAMENT-ENGINE-V2.md) · [`docs/MOCK-VS-LIVE.md`](MOCK-VS-LIVE.md)

---

## Goal

Evolve AI ARENA from mock-first tournament mode into a **real autonomous multi-provider tournament engine**, while keeping **mock mode as the default fallback**.

This is **foundation hardening**, not greenfield — ~70% of Phase 1 already exists in `lib/tournament/`.

---

## Already in repo (do not rewrite)

| Component | Location |
|-----------|----------|
| ProviderAdapter interface | `lib/tournament/providers/types.ts` |
| MockProviderAdapter | `lib/tournament/providers/mock-adapter.ts` |
| GroqProviderAdapter | `lib/tournament/providers/groq-adapter.ts` |
| ModelRouter | `lib/tournament/router/model-router.ts` |
| RateLimitGuard | `lib/tournament/guard/rate-limit-guard.ts` |
| In-memory usage tracker | `lib/tournament/providers/usage-tracker.ts` |
| Routed loop + fallbacks | `lib/tournament/routed-loop.ts`, `lib/tournament/loop-service.ts` |
| Server API | `app/api/tournament/run/route.ts` |
| Runtime modes | `mock` · `groq_free` · `hybrid_quality` in `lib/tournament/routing/types.ts` |
| Supabase schema (unused by app) | `provider_usage_logs` in `20250201000000_model_provider_routing.sql` |

---

## Gaps to close in Phase 1

1. **ProviderUsageLogger** — persist usage to `provider_usage_logs` (graceful if table missing)
2. **Split modules** per V2 layout (`task-routes`, `runtime-modes`, `estimates`, `usage/usage-logger.ts`)
3. **`marketplace_summary`** task type (alias or replace `marketplace_polish`)
4. **`estimatedCostUsd`** on `GuardAssessment`
5. **`DEFAULT_RUNTIME_MODE = "mock"`** + server-side `resolveEffectiveRuntimeMode()`
6. **Unified `executeRoutedTask()`** — per-task mock fallback + consistent logging
7. **Server enforcement** in `/api/tournament/run` (never trust client mode alone)
8. **`scripts/tournament-routing-smoke.ts`** + extend `e2e-flow-test.ts`
9. **Docs** — update HANDOFF T-MVP2 status, TOURNAMENT-ENGINE-V2 § layout

**Deferred to Phase 2:** real Anthropic/OpenAI adapters, hybrid final judge on Claude/GPT.

---

## Implementation steps (when approved to code)

### Step 0 — Types & defaults

- [x] Add `marketplace_summary` to `TaskType`
- [x] Add `estimatedCostUsd` to `GuardAssessment`
- [x] Set `DEFAULT_RUNTIME_MODE = "mock"`
- [x] Add `lib/tournament/routing/resolve-mode.ts` (`resolveEffectiveRuntimeMode`)

### Step 1 — Module split (refactor, no behavior change)

- [x] `lib/tournament/router/task-routes.ts`
- [x] `lib/tournament/router/runtime-modes.ts`
- [x] `lib/tournament/router/index.ts`
- [x] `lib/tournament/guard/estimates.ts`

### Step 2 — ProviderUsageLogger

- [x] `lib/tournament/usage/usage-logger.ts`
- [x] `lib/supabase/provider-usage.ts` (insert helper)
- [x] Wire logger from `routed-loop.ts` (batch log at round end)

### Step 3 — Unified execution + fallback

- [x] `executeRoutedTask()` with per-task mock fallback (`router/execute-routed-task.ts`)
- [x] Wire `marketplace_summary` at end of round (timeline step)
- [x] Keep whole-loop mock fallback in `loop-service.ts`

### Step 4 — Server-side mode enforcement

- [x] Resolve mode in `POST /api/tournament/run` before loop
- [x] Return `effectiveRuntimeMode` in API response
- [x] Align `lib/tournament/admin-settings.ts` with server rules

### Step 5 — Tests / smoke

- [x] `scripts/tournament-routing-smoke.ts`
- [x] `npm run smoke:router` in `package.json`
- [x] Extend `scripts/e2e-flow-test.ts` (routing meta assertions)
- [x] Run `npm run build`, `npm run smoke:router`

### Step 6 — Docs

- [x] Update `HANDOFF.md` T-MVP2 status
- [ ] Update `docs/TOURNAMENT-ENGINE-V2.md` implemented vs planned (optional polish)

---

## Decisions locked for Phase 1 (pending re-confirm at start)

| Decision | Choice |
|----------|--------|
| Default runtime mode | `mock` |
| `marketplace_summary` | Add new type; alias `marketplace_polish` internally |
| Premium final judge | Stay mock until Phase 2 |
| Supabase usage logging | Best-effort; no hard fail if table missing |
| React components | No direct LLM calls; API/server only |

---

## Risks (review before coding)

- Groq JSON parse failures → per-task mock fallback required
- `hybrid_quality` UX → label as “Groq agents + mock final judge” until Phase 2
- In-memory usage counters reset on cold start → Supabase logger mitigates
- Rate limit estimates are heuristic → tune `estimates.ts` only

---

## Acceptance criteria

- [ ] Tournament runs fully in **mock** with zero API keys
- [ ] **Groq** runs only when `GROQ_API_KEY` set and mode is `groq_free` or `hybrid_quality`
- [ ] Missing config → clear history events + mock fallback (no 500 on public demo)
- [ ] Provider usage logged consistently (in-memory + Supabase when configured)
- [ ] No API keys exposed to client
- [ ] `npm run build` + `npm run smoke` pass
