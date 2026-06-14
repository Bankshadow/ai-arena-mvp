# AI ARENA — Memory Compiler

**Last updated:** 2026-06-14  
**Code:** `lib/memory/` · **UI:** `/memory/*` · **Inspired by:** [claude-memory-compiler](https://github.com/coleam00/claude-memory-compiler)

**Purpose:** AI ARENA learns from every tournament — not just scores rounds.

---

## Overview

The Memory Compiler is a **learning layer** sitting alongside the Tournament Engine, Constitution system, and Marketplace. It does not replace them.

```
Tournament complete
    → capture events
    → extract lessons
    → compile articles
    → update agent lessons
    → propose constitution changes
    → attach marketplace evidence
    → lint knowledge base
    → feed next tournament (query + prompt injection — planned)
```

**Entry point:** `runMemoryCompilePipeline()` in `lib/memory/pipeline.ts`

---

## Memory capture

**Module:** `lib/memory/event-capture.ts`  
**Function:** `captureTournamentEvents(state: TournamentState)`

Derives structured events from tournament state:

| Phase | Trigger |
|-------|---------|
| `tournament_started` | Round begins |
| `challenge_generated` | Ideas created |
| `challenge_selected` | Idea picked |
| `agents_running` | Active runs present |
| `judging` | Evaluations running |
| `leaderboard_updated` | Scores computed |
| `marketplace_seeded` | Candidates attached |
| `tournament_completed` | Phase complete |
| `memory_extracted` / `memory_compiled` | Pipeline stages |

**Output:** `TournamentMemoryEvent[]` → `tournament_events` table (when persisted)

---

## Tournament logs

**Module:** `lib/memory/extractor.ts`  
**Function:** `createDailyLog(state, events)`

Produces `MemoryLog`:

- One digest per round (`log_date`, `title`, `summary`)
- Winner, score, challenge title
- `event_count`, full `payload` for drill-down

**UI:** Memory dashboard "Daily logs" stat

---

## Memory extractor

**Function:** `extractTournamentLessons(state, events)`

**Input:** Tournament evaluations, routing meta, constitution meta, marketplace candidates

**Output:** `ExtractedLesson[]` — intermediate format before article compilation

Each lesson includes:

- `article_type` (one of 10 types)
- `title`, `summary`, `body`
- `confidence` (0–1 heuristic)
- `tags[]`, `agent_ids[]`
- `lesson_types[]` for agent lesson mapping

### Mock behavior (current)

Rules-based extraction from:

- Winner/loser score gaps
- Cost limit penalties
- Runtime mode / provider usage
- Constitution version deltas
- Marketplace scores

### LLM-ready (future)

Replace body of `extractTournamentLessons()` with:

```typescript
interface MemoryExtractorPort {
  extract(input: ExtractorInput): Promise<ExtractedLesson[]>;
}
// MockExtractor | LLMExtractor
```

---

## Knowledge articles

**Module:** `lib/memory/compiler.ts`  
**Function:** `compileMemoryArticles(extracted, compileRunId, tournamentId, round)`

**Output:**

- `MemoryArticle[]` — slug, type, body, confidence, evidence_ids
- `MemoryArticleLink[]` — graph edges

### Article types

| Type | Use |
|------|-----|
| `agent_pattern` | Recurring winning behaviors |
| `failure_mode` | Systematic losses |
| `cost_insight` | $/quality patterns |
| `model_routing_insight` | Provider selection lessons |
| `challenge_design_lesson` | Creator brief quality |
| `judge_bias` | Scoring skew detection |
| `marketplace_opportunity` | Listable workflow gaps |
| `strategy_recommendation` | Actionable advice |
| `constitution_change` | Evidence for spec updates |
| `benchmark_summary` | Round rollup |

**UI:** `/memory/articles`, `/memory/articles/[id]`

---

## Agent lessons

**Module:** `lib/memory/agent-lessons.ts`  
**Functions:**

- `updateAgentLessons(extracted, articles, tournamentId, round)`
- `getAgentMemorySummary(agentId, lessons)`

### Lesson types

`strength`, `weakness`, `failure_mode`, `cost_pattern`, `latency_pattern`, `prompt_pattern`, `model_provider_pattern`, `recommended_change`

**UI:** `/agents/[id]/memory` — four-quadrant lesson card

**Note:** Uses tournament agent IDs (`lean`, `premium`, …) not MVP1 persona IDs (`frugal`, etc.)

---

## Constitution update proposals

**Module:** `lib/memory/constitution-proposals.ts`  
**Function:** `generateConstitutionProposals(extracted, articles, tournamentId, round)`

**Output:** `ConstitutionUpdateProposal[]`

| Field | Purpose |
|-------|---------|
| `field_changes[]` | `{ field, before, after, rationale }` |
| `status` | `draft` \| `pending_review` \| `approved` \| `rejected` |
| `article_id` | Evidence link |
| `proposed_version` | Suggested bump (e.g. v1.2 → v1.3) |

**UI:** `/constitution/proposals`

**Future:** Approve → `lib/constitution/store` creates new version

---

## Marketplace evidence

**Module:** `lib/memory/marketplace-evidence.ts`  
**Function:** `buildMarketplaceEvidence(state, articles)`

Links `marketplace_candidate_id` → `evidence_article_ids[]` with confidence note.

Feeds marketplace trust layer: listings cite tournament memory articles.

---

## Memory query

**Module:** `lib/memory/query.ts`  
**Function:** `queryMemory(query, kb)`

**Current:** Keyword match over article titles, summaries, tags, lesson content

**Also:** `buildStrategyRecommendations()` → `strategy_recommendations[]`

**UI:** `/memory/query`  
**API:** `POST /api/memory/query`

**Future:** Supabase full-text or pgvector on `memory_articles.body`

---

## Memory lint

**Module:** `lib/memory/linter.ts`  
**Function:** `lintMemoryKnowledgeBase(input)`

### Checks

| Code | Severity | Description |
|------|----------|-------------|
| `broken_link_from/to` | error | Article link target missing |
| `orphan_article` | warning | No links when KB > 3 articles |
| `low_confidence` | warning | confidence < 0.5 |
| `stale_lesson` | info | `stale` flag or age > 30 days |
| `contradictory_lessons` | warning | Linked contradicts edges |
| `missing_agent_backlink` | warning | Article cites agent but no lesson |
| `marketplace_no_evidence` | warning | Candidate without evidence note |

**Output:** `MemoryLintReport` with `health_score` (0–100)

**UI:** `/memory/lint`  
**API:** `POST /api/memory/lint`

---

## Storage

### Client: `MemoryStore`

- Key: `ai-arena-memory-kb`
- Merge: `mergeCompileResult(partialKb)`
- Provider: `MemoryProvider` in `components/memory/memory-provider.tsx`

### Server seed

- `seedKnowledgeBase()` — demo articles on first load
- `getServerKnowledgeBase()` — SSR helpers

### Supabase (schema ready, write path TBD)

Tables in `20250203000000_tournament_memory_compiler.sql`

---

## UI routes

| Route | View component |
|-------|----------------|
| `/memory` | `memory-dashboard-view.tsx` |
| `/memory/articles` | `memory-articles-view.tsx` |
| `/memory/articles/[id]` | `memory-article-detail-view.tsx` |
| `/memory/compile` | `memory-compile-view.tsx` |
| `/memory/lint` | `memory-lint-view.tsx` |
| `/memory/query` | `memory-query-view.tsx` |
| `/agents/[id]/memory` | `agent-memory-view.tsx` |
| `/constitution/proposals` | `constitution-proposals-view.tsx` |

**Tournament panel:** `memory-tournament-panel.tsx`

---

## Admin compile

`/memory/compile` POSTs latest saved tournament round to `/api/memory/compile`.

Auto-compile also runs on every tournament evaluate/full step.

---

## Related docs

- [Supabase schema](./04-supabase-schema.md)
- [Agent constitution](./05-agent-constitution.md)
- [Tournament engine](./06-tournament-engine.md)
