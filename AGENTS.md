# AI ARENA — Agent Instructions

**Source of truth for Cursor, Claude Code, and human contributors.**  
Read this file before writing code. Read the relevant `docs/*.md` before starting a feature.

---

<!-- BEGIN:nextjs-agent-rules -->
## Next.js version warning

This is **NOT** the Next.js you know. This project uses **Next.js 16.2.6** with breaking changes — APIs, conventions, and file structure may differ from your training data.

Before modifying routing, middleware/proxy, or data fetching:

```
node_modules/next/dist/docs/
```

Heed deprecation notices (e.g. middleware → proxy migration).
<!-- END:nextjs-agent-rules -->

---

## Project summary

**AI ARENA** is a self-improving, tournament-tested AI workflow marketplace.

**Live:** https://ai-arena-mvp.vercel.app  
**Alias:** https://ai-arena-drab.vercel.app (same deployment family)
- **Dev:** http://localhost:3005 (`npm run dev`)
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase, provider adapters

### What it does

1. **Autonomous Tournament Engine** — every 5 minutes, AI agents generate challenges, compete, get judged, update leaderboard
2. **Agent Constitution system** — versioned agent operating specs with diff + system prompt battle
3. **Model Provider Router** — Groq-first loops; premium models for final judge (optional)
4. **Marketplace + Stack Builder** — tournament-tested components with Arena Score; export to Cursor/Claude Code
5. **Memory Compiler** — learns from every round: articles, agent lessons, constitution proposals, marketplace evidence

Humans also compete via Arena, Submit, and Battle. Unified leaderboard at `/leaderboard`.

---

## Current architecture

```
app/                    Next.js App Router (pages + API)
components/             React UI by domain
lib/
  tournament/           Engine, scoring, agents, loop-service
  tournament/providers/ Mock + Groq adapters
  tournament/router/    ModelRouter
  tournament/guard/     RateLimitGuard
  constitution/       Versions, diff, battle, store
  marketplace/          Catalog, stacks, Arena Score, exports
  memory/               Capture, extract, compile, lint, query, pipeline
  supabase/             DB clients + save helpers
  judge/                Rubric scoring
  i18n/                 EN/TH dictionaries
supabase/migrations/    Ordered SQL migrations
docs/                   Product + technical documentation pack
```

### Key entry points

| Concern | File |
|---------|------|
| Tournament loop (client fallback) | `lib/tournament/engine.ts` |
| Tournament loop (API) | `lib/tournament/loop-service.ts` |
| Memory pipeline | `lib/memory/pipeline.ts` |
| Provider interface | `lib/tournament/providers/types.ts` |
| Tournament UI | `components/tournament/tournament-view.tsx` |
| Global providers | `components/providers.tsx` |

### Data flow (round complete)

```
POST /api/tournament/run → runTournamentLoopAsync()
  → runRoutedTournamentStep()
  → finalizeConstitutionMetaFromEvaluations()
  → runMemoryCompilePipeline()
  → saveTournamentRound() [if configured]
  → client mergeKb(memoryKb)
```

---

## Coding rules

### General

1. **Minimize scope** — smallest correct diff; no unrelated refactors
2. **Match existing conventions** — read surrounding code before writing
3. **Business logic in `lib/`** — not in React components or API route bodies
4. **TypeScript strict** — no `any` unless unavoidable; prefer existing types
5. **No comments** unless explaining non-obvious business logic

### Do not

- Remove or rewrite the Tournament Engine, Marketplace, or Memory layers without explicit request
- Delete mock implementations when adding real LLM calls — keep mock as fallback
- Put secrets in client code or `NEXT_PUBLIC_*` vars
- Edit applied Supabase migrations — add new migration files
- Use `git commit --amend` unless user explicitly requests and hook rules allow

### Do

- Run `npm run build` after substantive changes
- Explain what changed and why after each feature
- Update `docs/` when changing architecture or schema
- Use Zod for API request validation

---

## File structure rules

| Kind | Location | Naming |
|------|----------|--------|
| Page | `app/<route>/page.tsx` | Thin wrapper |
| View | `components/<domain>/<name>-view.tsx` | Client component |
| API | `app/api/<domain>/<action>/route.ts` | POST/GET handlers |
| Domain logic | `lib/<domain>/` | kebab-case files |
| Types | `lib/<domain>/types.ts` | Shared types |
| UI primitives | `components/ui/` | shadcn-style |
| Migrations | `supabase/migrations/YYYYMMDDHHMMSS_name.sql` | Sequential |

**Import alias:** `@/` → project root

---

## UI style rules

- **Theme:** Dark (`#030303` bg), neon cyan `#22d3ee` + violet `#a78bfa` accents
- **Cards:** `.glass-card` class from `app/globals.css`
- **Fonts:** Geist Sans (body), Geist Mono (labels/code)
- **Icons:** `lucide-react`
- **Layout:** Max-width containers, `rounded-2xl` cards, subtle `border-white/10`
- **Accent per domain:**
  - Tournament: emerald primary
  - Memory: cyan
  - Constitution: violet
  - Marketplace: mixed by component type color
- **i18n:** New user-facing strings → add to `lib/i18n/dictionaries/en/` and `th/`

---

## Supabase rules

- Apply migrations: `npm run supabase:push`
- New migration: `npm run supabase:new -- description`
- **Client:** anon key for RLS-governed reads/inserts
- **Server:** service role for admin, account history, future memory writes
- Reference: `docs/04-supabase-schema.md`, `supabase/README.md`
- Cursor rule: `.cursor/rules/supabase-migrations.mdc`

---

## Mock-first policy

**Default implementation order:**

1. **Mock data + localStorage** — ship UX and types
2. **Supabase schema + persistence** — apply migration, add save helpers
3. **Real LLM APIs** — behind adapter interface with mock fallback

| Layer | Mock location | Real gate |
|-------|---------------|-----------|
| Tournament runs | `lib/tournament/engine-mock.ts` | `GROQ_API_KEY` + runtime mode |
| Final judge | Mock heuristics | `ANTHROPIC_API_KEY` / hybrid mode |
| Memory extract | `lib/memory/extractor.ts` rules | Future `MemoryExtractorPort` |
| Marketplace catalog | `lib/marketplace/mock-catalog.ts` | Supabase sync (planned) |
| Constitution | `lib/constitution/mock-data.ts` | Supabase CRUD (planned) |

**Never break the app when API keys are missing.**

See [`docs/MOCK-VS-LIVE.md`](docs/MOCK-VS-LIVE.md) and `lib/runtime/modes.ts`.

---

## Provider adapter policy

All LLM calls go through `ProviderAdapter`:

```typescript
// lib/tournament/providers/types.ts
interface ProviderAdapter {
  readonly id: ProviderId;
  generateText(params: GenerateTextParams): Promise<GenerateTextResult>;
  estimateCost(params: EstimateCostParams): number;
  getProviderStatus(): ProviderStatus;
  getRateLimitInfo(): RateLimitInfo;
}
```

- Add providers in `lib/tournament/providers/` — implement interface
- Route via `ModelRouter` in `lib/tournament/router/model-router.ts`
- Pre-flight via `rateLimitGuard.assess()` in `lib/tournament/guard/`
- On failure → fallback to mock + tournament history event
- Never call Groq/Anthropic/OpenAI directly from UI components

---

## Security rules

- `SUPABASE_SERVICE_ROLE_KEY` — server-only (`lib/supabase/` admin helpers)
- Admin routes — HTTP Basic Auth (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
- RLS v2 — no public UPDATE on submissions
- Validate all API inputs with Zod
- Do not commit `.env.local` or real keys
- Do not log full API keys or user emails in client console

---

## Testing rules

```bash
npm run build      # Required after code changes
npm run lint       # ESLint
npm run smoke      # API health + key routes (local)
npm run e2e        # 19 flow checks (dev server on :3005 must be running)
```

**Before marking a feature done:** build must pass.

---

## Documentation update rules

| Change type | Update |
|-------------|--------|
| New feature / module | Relevant `docs/0X-*.md` |
| New route | `README.md`, `HANDOFF.md` |
| New migration | `docs/04-supabase-schema.md` |
| Architecture shift | `docs/03-tech-design.md` + ask user first |

**Documentation pack index:**

| Doc | Topic |
|-----|-------|
| `docs/01-product-vision.md` | Vision, positioning, thesis |
| `docs/02-prd-mvp.md` | MVP scope, stories, acceptance |
| `docs/03-tech-design.md` | Architecture, data flow, errors |
| `docs/04-supabase-schema.md` | Tables, RLS, migrations |
| `docs/05-agent-constitution.md` | Constitution model, battles |
| `docs/06-tournament-engine.md` | Loop, scoring, events |
| `docs/07-marketplace-stack-builder.md` | Components, stacks, exports |
| `docs/08-memory-compiler.md` | Learning layer |
| `docs/09-model-router.md` | Providers, guard, cost |
| `docs/10-build-plan.md` | Phases, tasks, risks, testing |

---

## Plan → Execute → Verify workflow

Use this for every non-trivial feature:

### 1. Plan

- Read relevant `docs/*.md` and existing code
- Identify files to touch (list explicitly)
- Confirm in scope vs `docs/02-prd-mvp.md`
- **Ask before changing architecture** (new dependencies, moving modules, new DB tables)

### 2. Execute

- Implement smallest working slice
- Mock-first unless task explicitly requires Supabase/LLM
- Follow file structure and UI style rules
- Do not rewrite unrelated code

### 3. Verify

- Run `npm run build`
- Manually test affected routes
- **After each feature:** explain diff (what/why) and report check results

---

## Hard rules (always enforce)

| Rule | Detail |
|------|--------|
| Do not rewrite unrelated code | Touch only files required for the task |
| Ask before changing architecture | New top-level modules, provider patterns, DB redesign |
| After each feature, explain diff and run checks | What changed, why, build/lint result |
| Do not remove Tournament Engine | Memory and Marketplace are layers on top |
| Keep mock fallback | Real APIs optional via env keys |
| Commits | Only when user explicitly asks |

---

## Quick reference

### Tournament agents

- **Creators:** strategy, technical, growth
- **Competitors:** lean, premium, rag, multi-agent, fast
- **Judges:** quality, efficiency

### Runtime modes

- `mock` (default) · `groq_free` · `hybrid_quality`

### localStorage keys

- `ai-arena-tournament-rounds`
- `ai-arena-memory-kb`
- `ai-arena-stack-draft` · `ai-arena-stacks`

### Key routes

| Route | Purpose |
|-------|---------|
| `/tournament` | Autonomous engine |
| `/marketplace`, `/components` | Marketplace |
| `/stack-builder` | Stack assembly |
| `/memory` | Knowledge base |
| `/agents/constitution-builder` | Constitution editor |
| `/constitution/proposals` | Memory-driven updates |

---

## Related files

- [`HANDOFF.md`](HANDOFF.md) — session log, env vars, MVP status
- [`README.md`](README.md) — quick start
- [`.cursor/rules/`](.cursor/rules/) — Cursor-specific rules
