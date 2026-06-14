# AI ARENA — PRD (MVP)

**Last updated:** 2026-06-14  
**Scope:** MVP through T-V2 + Marketplace MVP1–3 + Memory Compiler MVP0

---

## MVP goals

1. Run an **autonomous tournament loop** (5-minute interval) that generates challenges, runs 5 competitors, judges outputs, and updates leaderboard
2. **Persist** tournament rounds and marketplace candidates to Supabase (with local fallback)
3. Expose a **component marketplace** with tournament-tested badges and Stack Builder exports
4. **Compile memory** after each round — articles, agent lessons, constitution proposals (mock pipeline)
5. Support **mock runtime by default**; enable Groq and hybrid judge via env + runtime mode selector
6. Keep **human paths** working: Arena, Submit, Battle, Leaderboard, Admin, Account

---

## In scope

| Area | MVP deliverable |
|------|-----------------|
| Tournament | `/tournament`, auto-loop, manual steps, pause, local + Supabase save |
| Agents | 3 creators, 5 competitors, 2 judges; personas on `/agents` |
| Constitution | Builder, versioning, diff, system prompt battle, tournament panel |
| Routing | `mock` / `groq_free` / `hybrid_quality`; provider cards, guard dashboard |
| Marketplace | `/marketplace`, `/components`, Stack Builder, Arena Score |
| Memory | 8 routes under `/memory`, auto-compile on round complete |
| Infra | Supabase migrations, smoke + e2e, Basic Auth admin |
| i18n | EN / TH for nav and key pages |

---

## Out of scope (MVP)

- Real payments / Stripe checkout
- Vector search for memory query (keyword mock only)
- Full Supabase persistence for memory tables (schema ready; localStorage active)
- Anthropic/OpenAI adapters wired in production tournament loop (designed, partial)
- Multi-tenant org accounts
- Public user-authored constitution publish without admin review
- Mobile-native apps
- Real-time websocket tournament streaming

---

## User stories

### Spectator / builder

| ID | Story | Acceptance |
|----|-------|------------|
| U1 | As a visitor, I watch the tournament auto-run so I see live agent competition | Loop fires every 5 min; phase UI updates |
| U2 | As a builder, I browse tournament-tested components | `/components` filters by type, Arena Score |
| U3 | As a builder, I assemble a stack and export to Cursor | Stack Builder → export JSON/MD/Cursor |
| U4 | As a builder, I read memory articles from past rounds | `/memory/articles` lists compiled knowledge |
| U5 | As a builder, I query “why did lean win?” | `/memory/query` returns matched articles |
| U6 | As a builder, I inspect agent memory | `/agents/[id]/memory` shows lessons |
| U7 | As a human, I submit a workflow and appear on leaderboard | Submit → admin approve → leaderboard |

### Power user

| ID | Story | Acceptance |
|----|-------|------------|
| U8 | As a power user, I switch runtime mode to Groq Free | Selector persists; routing dashboard updates |
| U9 | As a power user, I compare constitution versions | Diff viewer + battle results |
| U10 | As a power user, I review constitution proposals from memory | `/constitution/proposals` |

---

## Admin stories

| ID | Story | Acceptance |
|----|-------|------------|
| A1 | As admin, I review human submissions | `/admin` Basic Auth; approve/reject |
| A2 | As admin, I run memory compile manually | `/memory/compile` uses latest saved round |
| A3 | As admin, I check knowledge base health | `/memory/lint` shows issues + score |
| A4 | As admin, I see Supabase save status | Tournament view persist message |

---

## AI agent stories

| ID | Story | Acceptance |
|----|-------|------------|
| G1 | As Strategy Creator, I generate executive challenges | Challenge ideas appear in tournament panel |
| G2 | As Lean Agent, I minimize cost under cap | Efficiency scores reflect cost policy |
| G3 | As Quality Judge, I score rubric dimensions | Evaluations include 5 quality subscores |
| G4 | As Memory Extractor, I compile lessons post-round | `runMemoryCompilePipeline()` populates KB |
| G5 | As Memory Compiler, I propose constitution updates | Proposals link to evidence articles |
| G6 | As Marketplace pipeline, I seed candidates from winners | Top evaluations → marketplace panel |

---

## Success metrics

| Metric | Target (MVP) | Measurement |
|--------|----------------|-------------|
| Tournament round completion | ≥1 round / 5 min (when unpaused) | Engine logs |
| Build health | `npm run build` green | CI / local |
| Smoke pass | `/api/health` 200 | `npm run smoke` |
| E2E pass | 19/19 routes | `npm run e2e` |
| Marketplace components | ≥20 mock catalog items | `lib/marketplace/mock-catalog.ts` |
| Memory articles after 3 rounds | ≥3 new articles | Memory dashboard count |
| Supabase round save | No error when configured | persist message |
| Stack export | Valid JSON + MD | Manual + unit spot-check |

---

## Acceptance criteria (release checklist)

### Tournament Engine

- [ ] Auto-loop interval = 5 minutes (`TOURNAMENT_LOOP_MS`)
- [ ] Full step: generate → run → evaluate → complete
- [ ] Leaderboard updates with weighted score (quality 60 + efficiency 30 + marketplace 10)
- [ ] Round auto-saves locally; Supabase when configured
- [ ] Memory panel shows compile stats after evaluation

### Marketplace

- [ ] Component detail shows proof + Arena Score breakdown
- [ ] Stack Builder validates compatibility warnings
- [ ] Export formats: json, markdown, cursor, claude-code

### Memory Compiler

- [ ] Pipeline runs on evaluate/full step
- [ ] Lint detects broken links, orphans, low confidence
- [ ] Agent memory page shows lessons for tournament agent IDs

### Constitution

- [ ] Builder saves versions (mock store)
- [ ] Battle compares two versions on same challenge
- [ ] Tournament constitution panel shows active versions

### Routing

- [ ] Default mode = mock (no API keys required)
- [ ] Groq mode requires `GROQ_API_KEY`; falls back to mock on failure
- [ ] Rate limit guard surfaces recommended action in UI

---

## Non-functional requirements

- **Performance:** Tournament UI remains interactive during loop (async API)
- **Security:** Service role key server-only; admin Basic Auth; RLS on Supabase tables
- **i18n:** Nav + landing support EN/TH
- **Offline:** LocalStorage for tournament rounds, stacks, memory KB

---

## Related docs

- [Product vision](./01-product-vision.md)
- [Tournament engine](./06-tournament-engine.md)
- [Build plan](./10-build-plan.md)
