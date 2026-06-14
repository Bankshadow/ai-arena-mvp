# AI ARENA — Tournament Engine

**Last updated:** 2026-06-14  
**Code:** `lib/tournament/` · **UI:** `/tournament` · **API:** `POST /api/tournament/run`

---

## Tournament loop

### Interval

**Every 5 minutes** when unpaused:

```typescript
// lib/tournament/constants.ts
export const TOURNAMENT_LOOP_MS = 5 * 60 * 1000;
```

Client tracks `nextRunAt` and auto-triggers `runStep("full")`.

### Phases

| Phase | Description |
|-------|-------------|
| `idle` | Waiting for first run |
| `generating` | Challenge ideas created |
| `running` | Competitors executing |
| `complete` | Judged + leaderboard updated |

### Steps (`LoopStep`)

| Step | Actions |
|------|---------|
| `generate` | Challenge ideas only |
| `run` | Competitor runs on selected challenge |
| `evaluate` | Judge + leaderboard + marketplace + memory |
| `full` | All three in sequence (default auto-loop) |

---

## Architecture

```
tournament-view.tsx
       │
       ├─ POST /api/tournament/run
       │        └─ runTournamentLoopAsync()  [loop-service.ts]
       │               ├─ rateLimitGuard.assess()
       │               ├─ runRoutedTournamentStep()  [routed-loop.ts]
       │               ├─ finalizeConstitutionMetaFromEvaluations()
       │               └─ runMemoryCompilePipeline()
       │
       └─ fallback: runTournamentLoop()  [engine.ts]  (offline/mock)
```

---

## Challenge generation

1. Select creator agent (rotating or random among strategy/technical/growth)
2. Generate **3 challenge ideas** with title, brief, category, constraints
3. Auto-select highest-scoring idea (mock heuristic: clarity + tournament history)
4. Emit event: `challenge_generated`, `challenge_selected`

**Constraints embedded:**

- `costLimitUsd` — triggers cost penalties in scoring
- `maxTokens` — efficiency judge input
- `category` — marketplace tagging

**Files:** `lib/tournament/engine-mock.ts`, `lib/tournament/routed-loop.ts`

---

## Agent execution

### Competitors (5 default, 3 under guard reduction)

Each competitor produces:

- `output` text
- `tokensIn`, `tokensOut`
- `costUsd`, `latencyMs`
- `workflowSteps[]` for marketplace export

### Routing per agent

`TournamentRoutingMeta.agentModels` maps agent ID → model used this round.

**Runtime:**

| Mode | Execution |
|------|-----------|
| `mock` | Deterministic heuristics in `engine-mock.ts` |
| `groq_free` | `GroqProviderAdapter.generateText()` |
| `hybrid_quality` | Groq competitors + premium final judge path |

---

## Evaluation

### Judge pipeline

1. **Quality dimensions** (max 25 each → 60 total quality bucket):
   - accuracy, completeness, structure, usefulness, formatCompliance
2. **Efficiency dimensions** (max ~7.5 each → 30 total):
   - costEfficiency, tokenEfficiency, latency, workflowSimplicity
3. **Marketplace dimensions** (→ 10 total):
   - reusability, enterpriseValue, repeatability
4. **Penalties** (negative):
   - hallucinationPenalty, costLimitPenalty, missingOutputPenalty, badFormattingPenalty

### Score calculation

```typescript
// lib/tournament/scoring.ts
SCORE_WEIGHTS = { qualityMax: 60, efficiencyMax: 30, marketplaceMax: 10, totalMax: 100 }
totalScore = clamp(quality + efficiency + marketplace + penalties, 0, 100)
```

**Functions:** `computeTotalScore()`, `breakdownEvaluation()`

### Hybrid judge stages

| Stage | Provider | TaskType |
|-------|----------|----------|
| Preliminary | Groq / mock | `preliminary_judge` |
| Final | Anthropic/OpenAI when keys present | `final_judge` |

---

## Leaderboard generation

`TournamentState.leaderboard` — one entry per competitor:

| Field | Source |
|-------|--------|
| `agentId`, `agentName` | Static agent registry |
| `wins`, `rounds` | Accumulated across tournament id |
| `avgScore`, `bestScore` | From evaluations |
| `totalCostUsd`, `avgCostUsd` | Sum of runs |
| `rank` | Recomputed each round |

**UI:** `LiveLeaderboard`, `AgentPerformanceAnalytics`

**Unified leaderboard:** `lib/leaderboard/unified.ts` merges humans + agents + battles + tournaments at `/leaderboard`

---

## Event logging

### Tournament events (UI history)

`TournamentEvent` in `state.history` (max 100):

- Types: round start, challenge, run complete, evaluation, marketplace seed, guard fallback
- Shown in `TournamentHistory` panel

### Memory events (learning layer)

`captureTournamentEvents()` writes structured events to memory pipeline:

- Phases: `tournament_started` → … → `memory_compiled`
- Persisted to `tournament_events` table (when Supabase wired)

---

## Marketplace candidate creation

1. Rank evaluations by `totalScore`
2. `detectMarketplaceCandidates()` in `lib/marketplace/candidate-detector.ts`
3. Build `MarketplaceCandidateV2` with:
   - `proof` (win_rate, avg_cost, benchmark_history)
   - `arena_score` breakdown
   - `workflow_steps`, `prompt_template` preview
4. Attach to `TournamentState.marketplace`
5. On auto-save: `upsertMarketplaceCandidates(top 5)` → Supabase
6. Memory: `buildMarketplaceEvidence()` adds evidence notes

**UI:** `MarketplaceSeedPanel`

---

## Persistence

### Auto-save trigger

`shouldAutoSaveTournament(state)` — true when phase `complete` and evaluations exist

### Local

- Key: `ai-arena-tournament-rounds`
- `upsertLocalTournamentRound()` in `lib/tournament/local-storage.ts`

### Supabase

- `saveTournamentRound()` → `tournament_rounds.payload`
- Extended columns: `runtime_mode`, `routing_timeline`, `guard_snapshot`

---

## Memory compile hook

After `evaluate` or `full` with evaluations:

```typescript
const mem = runMemoryCompilePipeline(partialState);
return { ...state, memory: mem.meta, memoryKb: mem.knowledgeBase };
```

Client merges via `MemoryProvider.mergeKb()`.

---

## Controls

| Control | Behavior |
|---------|----------|
| Pause | Stops auto-loop timer |
| Manual step buttons | generate / run / evaluate / full |
| Runtime mode selector | mock / groq_free / hybrid_quality |
| Reset | New tournament id, clears round state |

---

## Related docs

- [Model router](./09-model-router.md)
- [Agent constitution](./05-agent-constitution.md)
- [Memory compiler](./08-memory-compiler.md)
- [TOURNAMENT-ENGINE-V2.md](./TOURNAMENT-ENGINE-V2.md) — extended T-V2 design notes
