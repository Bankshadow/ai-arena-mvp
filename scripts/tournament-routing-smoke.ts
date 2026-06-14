#!/usr/bin/env npx tsx
/**
 * Tournament routing smoke — no dev server required.
 * Run: npm run smoke:router
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { hasAnthropicKey, hasOpenAiKey } from "../lib/env";
import { rateLimitGuard } from "../lib/tournament/guard/rate-limit-guard";
import { modelRouter } from "../lib/tournament/router/model-router";
import { normalizeTaskType } from "../lib/tournament/router/task-routes";
import {
  resolveEffectiveRuntimeMode,
  runtimeModeResolutionNote,
} from "../lib/tournament/routing/resolve-mode";
import {
  DEFAULT_RUNTIME_MODE,
  type TaskType,
  type TournamentRuntimeMode,
} from "../lib/tournament/routing/types";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

let failed = 0;

function ok(name: string) {
  console.log(`OK ${name}`);
}

function bad(name: string, detail: string) {
  console.log(`FAIL ${name} — ${detail}`);
  failed++;
}

// Default mode is mock
if (DEFAULT_RUNTIME_MODE !== "mock") {
  bad("DEFAULT_RUNTIME_MODE", `expected mock, got ${DEFAULT_RUNTIME_MODE}`);
} else {
  ok("DEFAULT_RUNTIME_MODE is mock");
}

const effective = resolveEffectiveRuntimeMode({ requested: "groq_free" });
if (process.env.GROQ_API_KEY?.trim()) {
  ok(`resolveEffectiveRuntimeMode groq_free → ${effective}`);
} else {
  if (effective !== "mock") bad("resolveEffectiveRuntimeMode", "groq_free without key should be mock");
  else ok("resolveEffectiveRuntimeMode downgrades groq_free → mock (no key)");
}

const note = runtimeModeResolutionNote("groq_free", "mock");
if (!process.env.GROQ_API_KEY?.trim() && !note) {
  bad("runtimeModeResolutionNote", "expected downgrade note");
} else {
  ok("runtimeModeResolutionNote");
}

const taskTypes: TaskType[] = [
  "challenge_generation",
  "competitor_run",
  "preliminary_judge",
  "final_judge",
  "benchmark_report",
  "marketplace_polish",
  "marketplace_summary",
];

for (const task of taskTypes) {
  const decision = modelRouter.route(task, "mock");
  if (decision.provider !== "mock" || decision.usesRealApi) {
    bad(`route ${task}`, `expected mock provider, got ${decision.provider}`);
  } else {
    ok(`route ${task} → mock`);
  }
}

if (normalizeTaskType("marketplace_polish") !== "marketplace_summary") {
  bad("normalizeTaskType", "marketplace_polish should map to marketplace_summary");
} else {
  ok("normalizeTaskType marketplace_polish → marketplace_summary");
}

const guard = rateLimitGuard.assess({ runtimeMode: "mock", competitorCount: 5 });
if (!guard.canRun || guard.estimatedCostUsd !== 0) {
  bad("rateLimitGuard mock", JSON.stringify(guard));
} else {
  ok("rateLimitGuard mock assessment");
}

const modes: TournamentRuntimeMode[] = ["mock", "groq_free", "hybrid_quality"];
for (const mode of modes) {
  const g = rateLimitGuard.assess({ runtimeMode: mode, competitorCount: 5 });
  if (typeof g.estimatedCostUsd !== "number") {
    bad(`guard estimatedCostUsd ${mode}`, "missing field");
  } else {
    ok(`guard estimatedCostUsd ${mode} = ${g.estimatedCostUsd}`);
  }
}

const hybridFinal = modelRouter.route("final_judge", "hybrid_quality");
if (process.env.ANTHROPIC_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim()) {
  if (hybridFinal.provider === "mock" || !hybridFinal.usesRealApi) {
    bad("hybrid final_judge", "expected premium provider when key set");
  } else {
    ok(`hybrid final_judge → ${hybridFinal.provider}/${hybridFinal.model}`);
  }
} else {
  if (hybridFinal.usesRealApi) {
    bad("hybrid final_judge", "should be mock without premium keys");
  } else {
    ok("hybrid final_judge → mock (no premium keys)");
  }
}

if (hasAnthropicKey() || hasOpenAiKey()) {
  const resolved = resolveEffectiveRuntimeMode({ requested: "hybrid_quality" });
  if (resolved !== "hybrid_quality") {
    bad("resolve hybrid without groq", `got ${resolved}`);
  } else {
    ok("resolve hybrid_quality with premium key only");
  }
}

console.log(failed === 0 ? "\nAll routing smoke checks passed." : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
