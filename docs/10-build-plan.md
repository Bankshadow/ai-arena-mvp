# AI ARENA — Build Plan

**Last updated:** 2026-06-14  
**Workflow:** Plan → Execute → Verify (vibe-coding with Cursor / Claude Code)

---

## Recommended build order

Build in layers. Each phase must pass `npm run build` before the next.

| Phase | Name | Status | Depends on |
|-------|------|--------|------------|
| 0 | Core platform | ✅ Done | — |
| 1 | Tournament mock loop | ✅ Done | Phase 0 |
| 2 | Supabase persistence | ✅ Done | Phase 1 |
| 3 | Model router + Groq | ✅ Partial | Phase 2 |
| 4 | Agent constitution | ✅ Mock-first | Phase 1 |
| 5 | Marketplace + Stack Builder | ✅ Done | Phase 1 |
| 6 | Memory Compiler MVP0 | ✅ Done | Phase 1, 4, 5 |
| 7 | Memory Supabase write | ⏳ Next | Phase 6 |
| 8 | LLM memory extractor | ⏳ Planned | Phase 7 |
| 9 | Premium judge wire-up | ⏳ Planned | Phase 3 |
| 10 | Memory → prompt injection | ⏳ Planned | Phase 8 |
| 11 | Marketplace publish flow | ⏳ Planned | Phase 5, 7 |

---

## Phase-by-phase implementation

### Phase 0 — Core platform ✅

- Next.js app router, landing, nav, i18n EN/TH
- Arena, Submit, Battle, Admin, Leaderboard
- Supabase submissions + battles

**Verify:** `npm run e2e`

### Phase 1 — Tournament mock loop ✅

- `lib/tournament/engine.ts`, `engine-mock.ts`
- `/tournament` UI with 5-min auto-loop
- Scoring in `lib/tournament/scoring.ts`
- Local round save

**Verify:** Complete one round offline; leaderboard updates

### Phase 2 — Supabase persistence ✅

- `tournament_rounds`, `marketplace_listings` migrations
- `saveTournamentRound()`, auto-save on complete
- `/tournaments` history list

**Verify:** Round appears in Supabase after configured env

### Phase 3 — Model router + Groq ⏳ Partial

- `ProviderAdapter`, `MockProviderAdapter`, `GroqProviderAdapter`
- `ModelRouter`, `RateLimitGuard`
- Runtime mode selector UI
- Migration `20250201000000` applied

**Remaining:**

- Wire Anthropic/OpenAI adapters for `final_judge`
- Persist `provider_usage_logs` on each call
- Sync DB `runtime_modes` with app modes

**Verify:** Groq round with `GROQ_API_KEY`; fallback to mock on error

### Phase 4 — Agent constitution ✅ Mock-first

- Types, mock data, builder UI, diff, battle
- Tournament constitution panel
- Migration `20250202000000`

**Remaining:**

- Supabase CRUD for constitution versions
- Approve flow for memory proposals → new version

### Phase 5 — Marketplace + Stack Builder ✅

- 13 component types, mock catalog, Arena Score
- Stack Builder + exports (JSON/MD/Cursor/Claude Code)
- Candidate detector from tournament evaluations

**Remaining:**

- Sync catalog to Supabase components table
- Publish workflow (review → published)

### Phase 6 — Memory Compiler MVP0 ✅

- Full `lib/memory/` pipeline (mock)
- 8 UI routes + tournament integration
- Migration `20250203000000`
- `MemoryProvider` + localStorage

**Verify:** Run tournament round → memory panel → articles appear

### Phase 7 — Memory Supabase write ⏳ Next

1. Create `lib/supabase/memory.ts` write helpers
2. After `runMemoryCompilePipeline()`, upsert to memory_* tables
3. Read `/memory/*` from Supabase with localStorage cache fallback
4. Add row types to `lib/supabase/types.ts`

**Verify:** Compile run row in `knowledge_compile_runs`; articles queryable from DB

### Phase 8 — LLM memory extractor ⏳

1. Define `MemoryExtractorPort` interface
2. Implement `LLMMemoryExtractor` using Groq or Anthropic
3. Keep `MockMemoryExtractor` as default
4. Confidence from model self-assessment

**Verify:** Articles differ meaningfully between mock and LLM modes

### Phase 9 — Premium judge wire-up ⏳

1. Implement `AnthropicProviderAdapter`, `OpenAIProviderAdapter`
2. Register in router for `hybrid_quality`
3. Log judge stage to `tournament_evaluations`

**Verify:** `hybrid_quality` round shows final judge in routing timeline

### Phase 10 — Memory → tournament prompts ⏳

1. `lib/runner/prompt-builder.ts` injects top agent lessons
2. Constitution proposals auto-apply on admin approve
3. `queryMemory()` used in challenge generation context

**Verify:** Lean agent prompt includes latest cost lesson after 3 rounds

### Phase 11 — Marketplace publish ⏳

1. Admin review UI for candidates → published components
2. Stripe / pricing (out of MVP scope — design only)
3. Evidence notes required before `listed` status

---

## Cursor task list

Copy-paste tasks for focused sessions:

### Task A — Memory Supabase persistence

```
Read docs/08-memory-compiler.md and docs/04-supabase-schema.md.
Create lib/supabase/memory.ts with upsert functions for memory_articles,
agent_lessons, knowledge_compile_runs. Call from runMemoryCompilePipeline
server path only. Keep localStorage fallback. Run npm run build.
```

### Task B — Anthropic final judge

```
Read docs/09-model-router.md. Implement AnthropicProviderAdapter matching
ProviderAdapter interface. Wire ModelRouter for final_judge in hybrid_quality.
Add tests via manual tournament round. Do not change mock mode behavior.
Run npm run build.
```

### Task C — Constitution proposal approve

```
Read docs/05-agent-constitution.md. Wire /constitution/proposals approve
button to lib/constitution/store — create new version from field_changes.
Update memory proposal status. Run npm run build.
```

### Task D — Prompt injection from memory

```
Read docs/08-memory-compiler.md. In lib/runner/prompt-builder.ts, append
top 3 agent_lessons for competitor to system prompt. Mock-first: read from
MemoryStore on client tournament path. Run npm run build.
```

### Task E — Component catalog Supabase sync

```
Read docs/07-marketplace-stack-builder.md. Create migration for marketplace_components
table OR extend marketplace_listings. Seed from mock-catalog.ts. Update
/components API to read DB with mock fallback.
```

---

## Risk list

| Risk | Impact | Mitigation |
|------|--------|------------|
| Groq rate limits on 5-min loop | Failed rounds | RateLimitGuard + mock fallback |
| Next.js 16 API drift | Build breaks | Read `node_modules/next/dist/docs/` before routing changes |
| localStorage loss | Memory/stacks lost | Phase 7 Supabase persistence |
| Mock/LLM score divergence | User distrust | Label runtime mode on all scores |
| RLS too permissive | Data tampering | Phase 7 tighten write policies |
| Agent ID mismatch (MVP1 vs tournament) | Empty agent memory | Document IDs; unify in future |
| Circular imports in tournament | Runtime crash | Shared constants in `lib/tournament/constants.ts` |
| Service role key in client | Security breach | ESLint + code review; server-only imports |

---

## Testing checklist

### Every feature PR

- [ ] `npm run build` passes
- [ ] `npm run lint` no new errors
- [ ] Only intended files changed (no drive-by refactors)
- [ ] Diff explained in PR / commit message

### Tournament features

- [ ] One full round in mock mode
- [ ] Pause/resume works
- [ ] Local save message appears
- [ ] Memory panel shows after evaluate
- [ ] (If Groq) Round with `GROQ_API_KEY` or confirm fallback

### Memory features

- [ ] `/memory` dashboard loads seeded data
- [ ] `/memory/lint` runs without error
- [ ] `/memory/query` returns matches for "lean cost"
- [ ] `/memory/compile` uses saved round

### Marketplace features

- [ ] Stack Builder add/remove component
- [ ] Export JSON valid parse
- [ ] Compatibility warnings display

### Supabase features

- [ ] `npm run supabase:push` succeeds
- [ ] Round saved when env configured
- [ ] Admin panel loads with Basic Auth

### Full regression

```bash
npm run dev          # :3005
npm run e2e          # 19 flow checks
npm run smoke        # health + key routes
```

---

## Documentation update rules

When shipping a phase:

1. Update relevant doc in `docs/01`–`10`
2. Append milestone to `HANDOFF.md`
3. Update route table in `README.md` if new pages
4. New Supabase tables → `docs/04-supabase-schema.md` + new migration file

---

## Related docs

- [PRD MVP](./02-prd-mvp.md)
- [Tech design](./03-tech-design.md)
- [AGENTS.md](../AGENTS.md)
