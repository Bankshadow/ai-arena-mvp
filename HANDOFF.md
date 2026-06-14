# AI ARENA — Handoff Log

Date: 2026-06-14 | Prepared for Cursor / Claude | **Last updated: 2026-06-14 (Phase A–D complete + Supabase CLI + E2E)**

Production: **https://ai-arena-drab.vercel.app** · Dev: **http://localhost:3005** · Repo: `Bankshadow/ai-arena-mvp`

---

## Project Overview

**AI ARENA** — AI workflow efficiency competition platform.  
AI Agent personas seed the leaderboard; humans compete via Arena, Submit, Battle, and Tournament. Tournament winners feed a workflow marketplace.

**Stack:** Next.js 16.2.6 (Turbopack), React 19, TypeScript, Supabase, Tailwind CSS, `@anthropic-ai/sdk`, Supabase CLI migrations

**Mock mode:** No `ANTHROPIC_API_KEY` → Battle/Tournament/Arena judge use heuristics; Supabase persistence still works.

---

## MVP Status (full roadmap)

| Phase | MVP | Feature | Status |
|-------|-----|---------|--------|
| Core | MVP1–5 | Agents, Submit, Arena, Enterprise, LLM runner | ✅ Done |
| Core | i18n | EN/TH locale switcher | ✅ Done |
| Core | MVP6–9 | Battle (generate → run → history) | ✅ Done |
| Core | Tournament | Mock/LLM loop, Supabase save, `/tournaments` | ✅ Done |
| **A** | MVP10 | `/api/health`, `npm run smoke` / `smoke:prod` | ✅ Done |
| **A** | MVP11 | Basic Auth on `/admin` + `/api/admin/*` | ✅ Done |
| **A** | MVP12 | RLS v2 — no public UPDATE on submissions | ✅ Done |
| **B** | MVP13 | Unified leaderboard (humans + agents + battles + tournaments) | ✅ Done |
| **B** | MVP14 | `/api/run-agent` persists to Supabase | ✅ Done |
| **B** | MVP15 | Nav + landing hero paths refreshed | ✅ Done |
| **C** | MVP16 | Enterprise AI Judge (`/api/judge-output`) | ✅ Done |
| **C** | MVP17 | Arena → sessionStorage bridge → Submit/Battle/Enterprise | ✅ Done |
| **C** | MVP18 | `/account` + email cookie + history API | ✅ Done |
| **D** | MVP19 | Marketplace table + UI + tournament sync | ✅ Done |
| **D** | MVP20–21 | `/workflows/[slug]` clone prompt + export bundle | ✅ Done |
| Infra | Supabase CLI | `supabase/migrations/` + `npm run supabase:push` | ✅ Done |
| Infra | E2E | `npm run e2e` — 19/19 checks (local) | ✅ Done |
| **E** | MVP22–24 | Cost guardrails, provider abstraction, live toggle | ⏳ Not started |

---

## Environment (`.env.local`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public key (submit form, reads) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes for admin + account history** | Bypass RLS server-side |
| `SUPABASE_DB_PASSWORD` | For `supabase:push` | CLI migration sync |
| `SUPABASE_PROJECT_REF` | Optional | Parsed from URL if omitted |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | For `/admin` | HTTP Basic Auth |
| `ANTHROPIC_API_KEY` | Optional | Live LLM; omit = mock mode |

Template: `env.import.example` → copy to `.env.local`  
Vercel: `vercel.env.example` → import in dashboard, then redeploy.

**Get service role key:** Supabase Dashboard → Project Settings → API → `service_role` (secret). Never expose to client.

---

## Database sync (no manual SQL Editor)

```bash
npm run supabase:push      # apply supabase/migrations/* to remote
npm run supabase:new -- x  # scaffold new migration
npm run supabase:status    # migration list
```

Migrations applied (2026-06-14):

| File | Contents |
|------|----------|
| `20250101000000_submissions_and_battles.sql` | Core tables |
| `20250102000000_tournament_rounds.sql` | Tournament snapshots |
| `20250103000000_marketplace_listings.sql` | Marketplace |
| `20250104000000_rls_v2_submissions.sql` | Tighter RLS |

Legacy snapshots (`schema.sql`, `rls-v2.sql`, …) are reference only. See `supabase/README.md`.

Cursor rule: `.cursor/rules/supabase-migrations.mdc`

---

## Test commands

```bash
npm run dev          # :3005
npm run build
npm run smoke        # local health + pages
npm run smoke:prod   # production URL
npm run e2e          # 19 flow checks (needs dev server + env)
```

**E2E flows verified:** Arena judge → pages · Submit (anon) → account history (service role) · Tournament → marketplace · Workflows clone UI.

**Browser-only:** Arena sessionStorage bridge (Arena → prefill Submit/Enterprise).

---

## Architecture (current)

```
Submit form ──anon──► Supabase submissions (pending)
Admin panel ──service role──► approve/reject (/api/admin/*)
Account history ──service role──► all statuses by email (/api/account/history)
Arena / Enterprise ──► POST /api/judge-output ──► rankHuman()
Tournament loop ──► POST /api/tournament/run ──► save round + upsert marketplace
Unified leaderboard ──► lib/leaderboard/unified.ts
```

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
| `/tournament` | Autonomous tournament loop |
| `/tournaments`, `/tournaments/[id]` | Saved rounds |
| `/leaderboard` | Unified rankings |
| `/agents`, `/agents/[id]`, `/agents/report` | Agent roster + report |
| `/workflows`, `/workflows/[slug]` | Workflow library + clone/export |
| `/marketplace`, `/marketplace/[slug]` | Tournament → listings |
| `/enterprise` | Private benchmark (AI Judge) |
| `/account` | Email-based activity history |
| `/admin` | Review + real agent runner (Basic Auth) |

### API highlights

| Endpoint | Notes |
|----------|-------|
| `GET /api/health` | Supabase + table readiness |
| `POST /api/judge-output` | Arena + Enterprise scoring |
| `POST /api/run-agent` | Live agent + optional Supabase persist |
| `POST /api/tournament/run` | Loop step + auto-save + marketplace upsert |
| `GET /api/account/history?email=` | Submissions/battles/tournaments by email |
| `GET /api/marketplace` | Listings from Supabase |
| `/api/admin/*` | Basic Auth + service role |

---

## Key files (new since MVP5)

```
lib/
  admin/auth.ts              — Basic Auth helpers
  auth/user-cookie.ts        — Email cookie for /account
  bridge/arena-output.ts       — sessionStorage bridge (MVP17)
  enterprise/benchmark.ts    — Enterprise judge wrapper
  leaderboard/unified.ts     — Merged leaderboard sources
  supabase/admin-client.ts   — Service role client
  supabase/agent-runs.ts     — Persist /api/run-agent
  supabase/marketplace.ts    — Marketplace CRUD
  workflows/catalog.ts       — Workflow slugs + export bundles
middleware.ts                — Protect /admin routes
scripts/
  smoke-test.mjs             — Deploy smoke
  e2e-flow-test.ts           — Full flow E2E
  supabase-push.mjs          — Migration sync
supabase/migrations/         — Source of truth for schema
.cursor/rules/supabase-migrations.mdc
```

---

## Known issues / notes

| Item | Detail |
|------|--------|
| Vercel env | Production needs Supabase URL/keys + `SUPABASE_SERVICE_ROLE_KEY` + `ADMIN_*` |
| Arena bridge | sessionStorage — manual browser test only |
| Marketplace listings | Grow on each tournament save (no dedup yet) |
| i18n | Tournament/battle/marketplace pages mostly EN labels in UI |
| Legacy Drizzle | `db/*` + `docs/DATABASE.md` Drizzle section — optional, not MVP path |

---

## Next steps (Phase E — suggested)

1. **MVP22** — Cost guardrails (max rounds/day, budget cap)
2. **MVP23** — Provider abstraction (Anthropic + Ollama fallback)
3. **MVP24** — Admin live/mock toggle without redeploy
4. Marketplace dedup + review workflow (`seed` → `review` → `listed`)
5. i18n for new pages (account, marketplace, tournament)
6. Playwright browser E2E for sessionStorage bridge

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

After push: confirm Vercel redeploy + run `npm run smoke:prod`.
