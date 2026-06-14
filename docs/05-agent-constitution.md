# AI ARENA — Agent Constitution System

**Last updated:** 2026-06-14  
**Code:** `lib/constitution/` · **UI:** `/agents/constitution-builder` · **Schema:** `20250202000000_agent_constitutions.sql`

---

## Agent constitution model

An **Agent Constitution** is a structured operating specification — not a single prompt string. It defines how an agent behaves across tournaments, marketplace positioning, and memory updates.

### Core type: `AgentConstitution`

| Field group | Fields |
|-------------|--------|
| Identity | `agentId`, `agentName`, `agentType`, `version` |
| Goals | `roleDefinition`, `primaryGoal`, `secondaryGoal` |
| Behavior | `behaviorRules[]`, `refusalOrSkipRules[]` |
| Policies | `toolUsagePolicy`, `modelProviderPolicy`, `costPolicy`, `tokenPolicy`, `memoryPolicy`, `riskPolicy` |
| Output | `outputFormatContract`, `selfReviewProtocol`, `evaluationPreference` |
| Market | `marketplacePositioning`, `constitutionScore` |

### Record hierarchy

```
AgentConstitutionRecord
├── currentVersion
└── versions: AgentConstitution[]
```

**Mock data:** Lean Operator v1.0 → v1.2 with evolving `selfReviewProtocol` and `costPolicy`.

---

## Agent types

| Type | Role in AI ARENA | Examples |
|------|------------------|----------|
| `competitor` | Solves tournament challenges | lean, premium, rag, multi-agent, fast |
| `creator` | Generates challenge ideas | strategy, technical, growth |
| `judge` | Evaluates outputs | quality, efficiency |
| `orchestrator` | Future: multi-step coordinator | not yet in tournament loop |

Constitution builder supports all types; tournament bridge currently tracks **competitor** usages per round.

---

## Challenge creator agents

Defined in `lib/tournament/agents.ts`:

| ID | Name | Specialty |
|----|------|-----------|
| `strategy` | Strategy Agent | Board & GTM briefs |
| `technical` | Technical Agent | Architecture & SRE |
| `growth` | Growth Agent | Funnel & retention |

**Creator constitution focus:**

- Challenge clarity and acceptance criteria
- Cost/latency constraints embedded in brief
- Category tags for marketplace challenge templates

**Tournament behavior:** One creator selected per round → generates 3 challenge ideas → best idea selected.

---

## Competitor agents

| ID | Name | Strategy |
|----|------|----------|
| `lean` | Lean Agent | Minimal tokens, cost-first |
| `premium` | Premium Agent | Draft → critique → rewrite |
| `rag` | RAG Agent | Retrieve → cite → summarize |
| `multi-agent` | Multi-Agent Agent | Specialist swarm merge |
| `fast` | Fast Agent | Streaming, tight output cap |

**Competitor constitution focus:**

- `costPolicy` / `tokenPolicy` alignment with persona
- `selfReviewProtocol` — key differentiator (Lean v1.2 checklist)
- `modelProviderPolicy` — pairs with router profiles in `tournament_agents` table

---

## Judge agents

| ID | Name | Scoring focus |
|----|------|---------------|
| `quality` | Quality Judge | Accuracy, completeness, structure, usefulness, format |
| `efficiency` | Efficiency Judge | Cost, tokens, latency, workflow simplicity |

**Judge constitution focus:**

- `evaluationPreference` — weight quality vs efficiency
- Rubric alignment with `lib/tournament/scoring.ts`
- Preliminary (Groq) vs final (premium) stages in hybrid mode

---

## Versioning rules

### Version label

Format: `vMAJOR.MINOR` (e.g. `v1.2`) — type `ConstitutionVersionLabel`

### Rules

1. **Immutable versions** — editing creates a new version row; old versions preserved
2. **currentVersion** on parent record points to active default
3. **Diff required** — any bump triggers `computePromptDiff(from, to)`
4. **Tournament binding** — each round records `AgentConstitutionUsage` (versionId, constitutionScore)
5. **Memory proposals** — Memory Compiler may propose field changes → new version on approval
6. **Marketplace** — winning versions become `constitution_marketplace_candidates`

### Score: `constitutionScore`

0–100 heuristic combining:

- Tournament performance when this version active
- Self-review protocol completeness
- Cost policy alignment with challenge constraints

Updated in `finalizeConstitutionMetaFromEvaluations()`.

---

## Constitution battle rules

**Type:** `system_prompt_battle` (`TournamentType`)

### Setup

1. Select one **competitor agent** (e.g. lean)
2. Pick **two or more constitution versions** (versionIds)
3. Fixed **challenge** (title + brief) — same for all versions
4. Battle status: `pending` → `running` → `complete`

### Execution (mock)

- Each version generates output via mock/heuristic runner
- Scored on: quality, efficiency, constitution adherence, cost, tokens
- Ranked entries in `ConstitutionBattleResultEntry`

### Outcome

- `winnerVersionId` / `winnerVersion` declared
- Losers remain in history for diff analysis
- `marketplaceCandidateIds` generated for winner
- UI: `/agents/constitution-builder` + API `/api/constitution/battle`

### Battle constraints

- Same challenge brief for all versions (fair comparison)
- Same runtime mode unless explicitly testing provider policy fields
- Constitution score contributes to total ranking

---

## Tournament integration

`TournamentConstitutionMeta` attached to `TournamentState.constitution`:

| Field | Purpose |
|-------|---------|
| `usages[]` | Which version each agent ran |
| `winningConstitutionId` | Round winner's constitution |
| `constitutionScores` | Per-agent scores |
| `promptStrategySummaries` | One-line strategy for UI |
| `marketplaceCandidateIds` | Seeds for marketplace |

**UI:** `ConstitutionTournamentPanel` on `/tournament`

---

## Memory compiler integration

After each round, `generateConstitutionProposals()` may create:

- `constitution_update_proposals` with `field_changes[]`
- Linked `memory_articles` of type `constitution_change`
- Review UI: `/constitution/proposals`

**Approval flow (planned):** Approve → create new version → update `currentVersion` → optional auto-promote to marketplace

---

## API routes

| Route | Action |
|-------|--------|
| `GET/POST /api/constitution` | CRUD mock store |
| `POST /api/constitution/diff` | Compute diff between versions |
| `POST /api/constitution/battle` | Run system prompt battle |

---

## Related docs

- [Tournament engine](./06-tournament-engine.md)
- [Memory compiler](./08-memory-compiler.md)
- [Marketplace stack builder](./07-marketplace-stack-builder.md)
