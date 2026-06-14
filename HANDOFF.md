# AI ARENA — Handoff Log

Date: 2026-06-14 | Prepared for Cursor / Claude | **Last updated: 2026-06-14 (Tournament Engine Phase 1)**

Production: **https://ai-arena-mvp.vercel.app** · Alias: **https://ai-arena-drab.vercel.app** · Dev: **http://localhost:3005** · Repo: `Bankshadow/ai-arena-mvp`

**Mock vs live:** [`docs/MOCK-VS-LIVE.md`](docs/MOCK-VS-LIVE.md) · **Architecture doc (Tournament V2):** [`docs/TOURNAMENT-ENGINE-V2.md`](docs/TOURNAMENT-ENGINE-V2.md) · **Marketplace:** [`docs/07-marketplace-stack-builder.md`](docs/07-marketplace-stack-builder.md)

---

## Project Overview

**AI ARENA** — Tournament-tested AI workflow marketplace.  
AI agents compete on real challenges; winning workflows, prompts, rubrics, and routing policies become reusable **components with benchmark proof**.

**Product flow:** `Tournament → Proof → Component → Stack → Export`

**Stack:** Next.js 16.2.6 (Turbopack), React 19, TypeScript, Supabase, Tailwind CSS, `@anthropic-ai/sdk`, Supabase CLI migrations

**Mock mode:** No API keys → Battle/Tournament/Arena use heuristics; candidate pipeline falls back to in-memory store.

---

## MVP Status (full roadmap)

| Phase | MVP | Feature | Status |
|-------|-----|---------|--------|
| Core | MVP1–5 | Agents, Submit, Arena, Enterprise, LLM runner | ✅ Done |
| Core | i18n | EN/TH locale switcher | ✅ Done |
| Core | MVP6–9 | Battle (generate → run → history) | ✅ Done |
| Core | Tournament | Mock/LLM loop, Supabase save, `/tournaments` | ✅ Done |
| **A** | MVP10 | `/api/health`, `npm run smoke` / `smoke:prod` | ✅ Done |
| **A** | MVP11 | Basic Auth on `/api/admin/*` (page public + demo fallback) | ✅ Done |
| **A** | MVP12 | RLS v2 — no public UPDATE on submissions | ✅ Done |
| **B** | MVP13 | Unified leaderboard (humans + agents + battles + tournaments) | ✅ Done |
| **B** | MVP14 | `/api/run-agent` persists to Supabase | ✅ Done |
| **B** | MVP15 | Nav + landing hero paths refreshed | ✅ Done |
| **C** | MVP16 | Enterprise AI Judge (`/api/judge-output`) | ✅ Done |
| **C** | MVP17 | Arena → sessionStorage bridge → Submit/Battle/Enterprise | ✅ Done |
| **C** | MVP18 | `/account` + email cookie + history API | ✅ Done |
| **D** | MVP19 | Marketplace listings table + legacy UI | ✅ Done |
| **D** | MVP20–21 | `/workflows/[slug]` clone prompt + export bundle | ✅ Done |
| **MKT** | Phase 1 | Proof cards — `/marketplace`, `/components`, `/stack-builder` | ✅ Done (UI + mock catalog) |
| **MKT** | Phase 2 | Tournament → candidate pipeline + admin review (no auto-publish) | ✅ Done · migration pushed |
| Infra | Supabase CLI | `supabase/migrations/` + `npm run supabase:push` | ✅ Done |
| Infra | E2E | `npm run e2e` — 19/19 checks (local) | ✅ Done |
| **T-V2** | T-MVP1 | Mock tournament loop | ✅ Done |
| **T-V2** | T-MVP2 | Groq-powered agent loop + routing foundation | ✅ Phase 1 done · see task doc |
| **T-V2** | T-MVP3 | Hybrid judge (Groq + Claude/GPT final) | ✅ Phase 2 done · see task doc |
| **T-V2** | T-MVP4 | Benchmark + marketplace polish | ✅ Proof UI + candidate pipeline |
| **T-V2** | T-MVP5 | Enterprise tournaments + audit | ⏳ Partial |

---

## Environment (`.env.local`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public key (submit form, reads) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes for admin + account history** | Bypass RLS server-side |
| `SUPABASE_DB_PASSWORD` | For `supabase:push` | CLI migration sync |
| `SUPABASE_PROJECT_REF` | Optional | Parsed from URL if omitted |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | For `/api/admin/*` in production | HTTP Basic Auth |
| `ANTHROPIC_API_KEY` | Optional | Live LLM (final judge, premium tasks); omit = mock |
| `GROQ_API_KEY` | Optional (T-MVP2+) | Groq-first tournament loops (free tier, fast) |
| `OPENAI_API_KEY` | Optional | GPT final judge / benchmark fallback |
| `TOURNAMENT_ANTHROPIC_JUDGE_MODEL` | Optional | Override hybrid final judge model |
| `TOURNAMENT_OPENAI_JUDGE_MODEL` | Optional | Override OpenAI final judge model |
| `TOURNAMENT_DEFAULT_RUNTIME_MODE` | Optional | `free` \| `cheap` \| `quality` \| `enterprise` |

Template: `.env.example` → copy to `.env.local`  
Vercel: `vercel.env.example` → import in dashboard, then redeploy.

**Get service role key:** Supabase Dashboard → Project Settings → API → `service_role` (secret). Never expose to client.

---

## Database sync (no manual SQL Editor)

```bash
npm run supabase:push      # apply supabase/migrations/* to remote
npm run supabase:new -- x  # scaffold new migration
npm run supabase:status    # migration list
```

Migrations in repo:

| File | Contents |
|------|----------|
| `20250101000000_submissions_and_battles.sql` | Core tables |
| `20250102000000_tournament_rounds.sql` | Tournament snapshots |
| `20250103000000_marketplace_listings.sql` | Legacy published listings |
| `20250104000000_rls_v2_submissions.sql` | Tighter RLS |
| `20250201000000_model_provider_routing.sql` | T-V2 providers, profiles, usage logs |
| `20250202000000_agent_constitutions.sql` | Constitution schema |
| `20250203000000_tournament_memory_compiler.sql` | Memory compiler tables |
| `20250204000000_marketplace_candidates.sql` | Candidate review pipeline · **applied to remote** |

Legacy snapshots (`schema.sql`, `rls-v2.sql`, …) are reference only. See `supabase/README.md`.

Cursor rule: `.cursor/rules/supabase-migrations.mdc`

---

## Test commands

```bash
npm run dev          # :3005
npm run build
npm run smoke        # local health + pages
npm run smoke:prod   # production URL
npm run smoke:router   # tournament routing unit smoke (no server)
npm run e2e          # 19 flow checks (needs dev server + env)
```

**E2E flows verified:** Arena judge → pages · Submit (anon) → account history (service role) · Tournament → marketplace · Workflows clone UI.

**Browser bridge:** `npm run e2e:browser` (Playwright) verifies Arena sessionStorage → Submit / Battle / Enterprise.

---

## Architecture (current)

```
Submit form ──anon──► Supabase submissions (pending)
Admin panel ──service role──► approve/reject submissions (/api/admin/submissions/*)
Admin panel ──► marketplace candidates (/api/admin/marketplace-candidates/*)
Account history ──service role──► all statuses by email (/api/account/history)
Arena / Enterprise ──► POST /api/judge-output ──► rankHuman()
Tournament loop ──► POST /api/tournament/run
                    ├── resolveEffectiveRuntimeMode() (server)
                    ├── save round (tournament_rounds) when complete
                    ├── processRoundCandidates() → marketplace_candidates
                    └── ProviderUsageLogger → provider_usage_logs (best-effort)
Admin Publish ──► promoteCandidateToComponent() → catalog + Stack Builder
Unified leaderboard ──► lib/leaderboard/unified.ts
```

### Marketplace candidate pipeline (Phase 2)

| Step | Module |
|------|--------|
| Detect assets (6 types) | `lib/marketplace/candidate-pipeline.ts` → `detectMarketplaceCandidates()` |
| Dedup key | `component_type + challenge_category + winning_agent + strategy_hash` |
| Upsert + metrics | `lib/marketplace/candidate-store.ts` |
| Mock fallback | `lib/marketplace/candidate-store-mock.ts` (in-memory when Supabase unavailable) |
| Admin review | `detected` → `review_needed` → `approved` → **Publish** → `published` |
| Catalog | `lib/marketplace/published-catalog.ts` + `refreshComponentCatalog()` |

**Important:** Round complete does **not** write `marketplace_listings`. Listings upsert is legacy; publish goes through admin.

### Scoring (unchanged)

```
FINAL = 0.55·qualityAdj + 0.20·costEff + 0.10·tokenEff + 0.10·speedEff + 0.05·robustness
qualityAdj = qualityRaw − hallucinationPenalty − formatPenalty
```

---

## Routes (app)

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/challenge/executive-summary-battle` | Challenge #1 |
| `/submit` | Human submission (Supabase) |
| `/arena` | Human vs AI (AI Judge) |
| `/battle` | Token efficiency battle |
| `/battles`, `/battles/[id]` | Battle history |
| `/tournament` | Autonomous tournament loop + proof pipeline panel |
| `/tournaments`, `/tournaments/[id]` | Saved rounds |
| `/leaderboard` | Unified rankings |
| `/agents`, `/agents/[id]`, `/agents/report` | Agent roster + report |
| `/workflows`, `/workflows/[slug]` | Workflow library + clone/export |
| `/marketplace` | Marketplace hub (proof sections + flow strip) |
| `/marketplace/[slug]` | Legacy Supabase listings |
| `/components`, `/components/[id]` | Component catalog + proof detail (9 sections) |
| `/stack-builder`, `/stacks/[id]` | Stack Builder + export (JSON/MD/Cursor/Claude) |
| `/enterprise` | Private benchmark (AI Judge) |
| `/account` | Email-based activity history |
| `/admin` | Submissions + **marketplace candidate review** + demo dashboard |

### API highlights

| Endpoint | Notes |
|----------|-------|
| `GET /api/health` | Supabase + table readiness |
| `POST /api/judge-output` | Arena + Enterprise scoring |
| `POST /api/run-agent` | Live agent + optional Supabase persist |
| `POST /api/tournament/run` | Loop step + **effectiveRuntimeMode** + candidate pipeline + usage log |
| `GET /api/account/history?email=` | Submissions/battles/tournaments by email |
| `GET /api/marketplace` | Legacy listings from Supabase |
| `GET /api/admin/marketplace-candidates` | Pending candidates (mock or Supabase) |
| `POST /api/admin/marketplace-candidates/[id]/{approve\|reject\|publish\|archive}` | Review workflow |
| `/api/admin/*` | Basic Auth + service role where configured |

---

## Key files

```
lib/
  marketplace/
    candidate-pipeline.ts      — detect, dedup, metrics, evidence
    candidate-store.ts         — upsert, processRoundCandidates, admin transitions
    candidate-store-mock.ts    — in-memory fallback
    published-catalog.ts       — promoteCandidateToComponent
    mock-catalog.ts            — static + published components
    component-proof-card.tsx   — (components/marketplace/) proof UI
  tournament/
    loop-service.ts, routed-loop.ts, engine-mock.ts
  supabase/
    marketplace-candidates.ts  — candidate CRUD
    marketplace.ts             — legacy listings (publish-only path)
  admin/auth.ts                — Basic Auth on /api/admin/*
components/
  admin/admin-marketplace-candidates-panel.tsx
  marketplace/marketplace-hub-view.tsx, stack-builder-view.tsx
app/api/tournament/run/route.ts
supabase/migrations/20250204000000_marketplace_candidates.sql
docs/TASK-PHASE1-TOURNAMENT-ENGINE.md   — Tournament Engine Phase 1 (complete)
```

---

## Known issues / notes

| Item | Detail |
|------|--------|
| Vercel env | Production needs Supabase URL/keys + `SUPABASE_SERVICE_ROLE_KEY` + `ADMIN_*` |
| Production URL | Canonical: `ai-arena-mvp.vercel.app` · alias: `ai-arena-drab.vercel.app` |
| Arena bridge | Playwright `npm run e2e:browser` — sessionStorage → Submit/Battle/Enterprise |
| `marketplace_candidates` table | Applied via `supabase:push` (2026-06-14) |
| Candidate store | Works in-memory without Supabase; persists when table + service role ready |
| Legacy listings | `marketplace_listings` dedup `(agent_id, challenge_title)` — not used on round complete |
| i18n | Tournament/battle/marketplace routing UI — EN + TH dictionaries | ✅ Done (core shells) |
| Default runtime mode | Code default is **`mock`**; Groq modes require `GROQ_API_KEY` |

---

## Next steps (ordered — do one at a time)

| # | Task | Status |
|---|------|--------|
| **1** | Sync HANDOFF with marketplace Phase 1/2 | ✅ Done |
| **2** | `npm run supabase:push` — `marketplace_candidates` | ✅ Done |
| **3** | Tournament Engine Phase 1 — [`docs/TASK-PHASE1-TOURNAMENT-ENGINE.md`](docs/TASK-PHASE1-TOURNAMENT-ENGINE.md) | ✅ Done |
| **4** | T-MVP3 — Hybrid final judge (Anthropic/OpenAI adapters) · [`docs/TASK-PHASE2-HYBRID-JUDGE.md`](docs/TASK-PHASE2-HYBRID-JUDGE.md) | ✅ Done |
| **5** | i18n for tournament / marketplace routing UI | ✅ Done |
| **6** | Playwright E2E for sessionStorage bridge | ✅ Done |

**Note:** Phase 1 + Phase 2 (hybrid judge) complete — run `npm run smoke:router` for routing checks.

---

## Next.js 16 (critical)

Dynamic route `params` is a **Promise** — always `await params`:

```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

---

## Git / deploy log

| Date | Commit | Notes |
|------|--------|-------|
| 2026-06-14 | `a0f172b` | Tournament Supabase + LLM mock-first |
| 2026-06-14 | `1c6872c` | Phase A–D, migrations CLI, E2E, marketplace, account |
| 2026-06-14 | (local) | Stabilization pass + marketplace proof Phase 1/2 |

After push: confirm Vercel redeploy + run `npm run smoke:prod`.
