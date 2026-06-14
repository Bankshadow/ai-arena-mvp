# AI ARENA — Model Provider Router

**Last updated:** 2026-06-14  
**Code:** `lib/tournament/providers/`, `lib/tournament/router/`, `lib/tournament/guard/`  
**Schema:** `20250201000000_model_provider_routing.sql`

---

## Design principle

**Groq-first for frequency. Claude/GPT for judgment.**

The tournament loop runs every 5 minutes — all-premium inference is unsustainable. The router assigns the cheapest capable provider per task type, with guard rails and graceful fallback to mock.

---

## Provider adapter interface

**File:** `lib/tournament/providers/types.ts`

```typescript
interface ProviderAdapter {
  readonly id: ProviderId;
  generateText(params: GenerateTextParams): Promise<GenerateTextResult>;
  estimateCost(params: EstimateCostParams): number;
  getProviderStatus(): ProviderStatus;
  getRateLimitInfo(): RateLimitInfo;
}
```

### `GenerateTextParams`

| Field | Purpose |
|-------|---------|
| `taskType` | Routing key |
| `system`, `user` | Prompts |
| `model?` | Override |
| `maxTokens`, `temperature`, `jsonMode` | Generation controls |

### `GenerateTextResult`

Returns: `text`, `model`, `provider`, token counts, `latencyMs`, `estimatedCostUsd`

---

## Implemented adapters

### Mock adapter

**File:** `lib/tournament/providers/mock-adapter.ts`

- Always available (`hasGroqKey()` not required)
- Deterministic heuristic text from task type + agent persona
- Zero cost, ~instant latency
- Default for development and guard fallback

### Groq adapter

**File:** `lib/tournament/providers/groq-adapter.ts`

- OpenAI-compatible API at `GROQ_BASE_URL` (default `https://api.groq.com/openai/v1`)
- Default model: `GROQ_DEFAULT_MODEL` → `llama-3.1-8b-instant`
- Requires `GROQ_API_KEY` (checked via `hasGroqKey()` in `lib/env.ts`)
- Tracks usage via `usage-tracker.ts`

---

## Future adapters

### Anthropic adapter (designed)

- Task types: `final_judge`, `benchmark_report`, `marketplace_polish`, `enterprise_review`
- Models: `claude-sonnet-4-6`, `claude-opus-4-8`
- Requires `ANTHROPIC_API_KEY`

### OpenAI adapter (designed)

- Task types: `final_judge`, `benchmark_report`
- Models: `gpt-4o`
- Requires `OPENAI_API_KEY`

**Policy:** Add new providers by implementing `ProviderAdapter` — never call APIs directly from tournament loop code.

---

## ModelRouter

**File:** `lib/tournament/router/model-router.ts`

**Input:** `TaskType`, `TournamentRuntimeMode`, optional agent profile

**Output:** `RouteDecision`

```typescript
RouteDecision {
  taskType, provider, model, maxTokens, temperature, usesRealApi
}
```

### Routing matrix (simplified)

| TaskType | mock | groq_free | hybrid_quality |
|----------|------|-----------|----------------|
| challenge_generation | mock | groq | groq |
| competitor_run | mock | groq | groq |
| preliminary_judge | mock | groq | groq |
| final_judge | mock | mock | anthropic/openai if keys |
| benchmark_report | mock | mock | anthropic/openai |
| marketplace_polish | mock | mock | anthropic/openai |

---

## Runtime modes

**Type:** `TournamentRuntimeMode`

| Mode | Label | Behavior |
|------|-------|----------|
| `mock` | Mock | All tasks → MockAdapter (default) |
| `groq_free` | Groq Free | Real Groq for loop tasks; mock judge if no premium keys |
| `hybrid_quality` | Hybrid Quality | Groq loop + premium final judge when keys present |

**UI:** `RuntimeModeSelector` on `/tournament`  
**Env:** `TOURNAMENT_DEFAULT_RUNTIME_MODE` (optional; app default is `mock`)

### DB runtime_modes (forward-compatible)

Migration seeds: `free`, `cheap`, `quality`, `enterprise` with policy JSONB — map to app modes in future sync layer.

---

## Cost tracking

### Per-call

Every `generateText()` returns `estimatedCostUsd` from adapter `estimateCost()`.

### Per-round aggregation

`TournamentRoutingMeta`:

| Field | Content |
|-------|---------|
| `providerUsage[]` | Log of each call |
| `costSavedEstimateUsd` | vs all-premium baseline heuristic |
| `routingTimeline[]` | Step-by-step provider decisions |

### Persistence (planned)

`provider_usage_logs` table — one row per call batch with tokens, cost, `rate_limit_hit`

**UI:** `RoutingDashboard`, `ProviderStatusCards`

---

## Rate limit guard

**File:** `lib/tournament/guard/rate-limit-guard.ts`  
**Function:** `rateLimitGuard.assess(options)`

### Inputs

- `runtimeMode`
- `competitorCount` (default 5)
- `includeFinalJudge` (true in hybrid_quality)

### Outputs: `GuardAssessment`

| Field | Use |
|-------|-----|
| `canRun` | Proceed with live APIs? |
| `riskLevel` | low / medium / high |
| `recommendedAction` | See below |
| `apiCallCount`, token estimates | Display in dashboard |
| `message` | Human-readable explanation |

### Recommended actions

| Action | Effect |
|--------|--------|
| `proceed` | Normal execution |
| `reduce_competitors` | Cap at 3 agents |
| `skip_final_judge` | Preliminary judge only |
| `delay_loop` | Skip this cycle (future) |
| `switch_to_mock` | Full mock fallback |

### Fallback behavior

In `loop-service.ts`:

1. If guard blocks live mode → retry with `mock`
2. If Groq throws → catch, append history event, fallback to mock
3. Never crash tournament UI — degrade gracefully

### Logging

`rate_limit_events` table stores estimate + actions_taken JSONB

---

## Agent profiles (DB)

`tournament_agents` table maps each agent to:

- `primary_provider`, `primary_model`
- `fallback_provider`, `fallback_model`
- `cost_policy`, `latency_policy`, `quality_policy`

Example: `premium` → anthropic primary, groq fallback

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Enable Groq adapter |
| `GROQ_BASE_URL` | API base (optional) |
| `GROQ_DEFAULT_MODEL` | Default model id |
| `ANTHROPIC_API_KEY` | Premium judge (future wire-up) |
| `OPENAI_API_KEY` | GPT judge fallback |

**Checks:** `lib/env.ts` — `isPlaceholderEnvValue()` rejects template strings

---

## Testing modes

| Scenario | Setup |
|----------|-------|
| Zero keys | Default mock — full UI functional |
| Groq only | `GROQ_API_KEY` + mode `groq_free` |
| Full hybrid | Groq + Anthropic keys + `hybrid_quality` |

**Verify:** Provider cards show availability; routing timeline populates after round

---

## Related docs

- [Tech design](./03-tech-design.md)
- [Tournament engine](./06-tournament-engine.md)
- [TOURNAMENT-ENGINE-V2.md](./TOURNAMENT-ENGINE-V2.md)
