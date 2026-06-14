# Mock vs live mode

AI ARENA is **mock-first**: every public route renders with demo or local data when Supabase or API keys are missing. Live mode layers on top without breaking the demo.

Reference implementation: `lib/runtime/modes.ts`.

---

## Layers

| Layer | Live gate | Mock fallback |
|-------|-----------|---------------|
| **Supabase reads/writes** | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Empty arrays, demo catalogs, localStorage |
| **Admin approve/reject** | Above + `SUPABASE_SERVICE_ROLE_KEY` + Basic Auth on `/api/admin/*` in production | `AdminMockDashboard` on `/admin` |
| **Tournament loop (API)** | `GROQ_API_KEY` + runtime mode `groq_free` / `hybrid_quality` | `lib/tournament/engine-mock.ts` via router |
| **Tournament loop (client)** | Calls `POST /api/tournament/run` | Sync mock in `lib/tournament/engine.ts` |
| **Arena / Battle judge** | `ANTHROPIC_API_KEY` | Heuristic rubric scoring |
| **Marketplace listings DB** | Supabase + tournament save | `lib/marketplace/mock-catalog.ts` |

---

## Tournament runtime modes (app)

| Mode | Behavior |
|------|----------|
| `mock` | All provider adapters resolve to mock |
| `groq_free` | Groq for generation/runs when `GROQ_API_KEY` set; else mock |
| `hybrid_quality` | Groq agents + mock final judge until premium adapters ship |

On provider failure or rate-limit guard block, `lib/tournament/loop-service.ts` **falls back to mock** and appends a history event.

---

## Pages that never require Supabase

- `/`, `/tournament`, `/leaderboard`, `/marketplace`, `/stack-builder`
- `/battles`, `/tournaments` — demo history merged when API unavailable
- `/admin` — demo dashboard when service role missing

---

## Production URLs

- **Primary:** https://ai-arena-mvp.vercel.app
- **Alias:** https://ai-arena-drab.vercel.app

Both point at the same Vercel deployment family; use the primary URL in docs and `npm run smoke:prod`.
