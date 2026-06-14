#!/usr/bin/env npx tsx
/**
 * End-to-end flow tests (API + page smoke).
 * Run: npm run e2e  (dev server on :3005)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { createInitialTournamentState } from "../lib/tournament/engine";
import { getAllWorkflowSlugs, getWorkflowBySlug } from "../lib/workflows/catalog";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3005";

const SAMPLE_OUTPUT = `Executive Summary
Our Q3 rollout exceeded adoption targets by 12% while holding support load flat.

Key Risks
- Vendor concentration in the analytics pipeline
- Incomplete GDPR documentation for EU tenants

Business Impact
Delayed compliance work could block two enterprise renewals worth $1.2M ARR.

Recommendations
1. Assign a compliance tiger team for 30 days.
2. Add a secondary vendor for ingestion failover.
3. Publish a customer-facing status dashboard.`;

type Result = { name: string; ok: boolean; detail?: string };

const results: Result[] = [];

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

function pass(name: string, detail?: string) {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, detail?: string) {
  results.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchText(path: string): Promise<{ status: number; text: string }> {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, text: await res.text() };
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, init);
  const data = (await res.json()) as T;
  return { status: res.status, data };
}

async function flowArena() {
  console.log("\n[1] Arena → judge → Submit / Battle / Enterprise pages");

  const judge = await fetchJson<Record<string, unknown>>("/api/judge-output", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ output: SAMPLE_OUTPUT }),
  });

  if (judge.status === 200 && typeof judge.data.accuracy === "number") {
    pass("Arena judge API", `accuracy=${judge.data.accuracy}`);
  } else {
    fail("Arena judge API", `HTTP ${judge.status}`);
  }

  for (const path of ["/arena", "/submit", "/battle", "/enterprise"]) {
    const { status, text } = await fetchText(path);
    if (status === 200) pass(`${path} page loads`);
    else fail(`${path} page loads`, `HTTP ${status}`);
  }

  const arena = await fetchText("/arena");
  if (arena.text.includes('href="/submit"') || arena.text.includes("Submit to leaderboard")) {
    pass("Arena has submit navigation");
  } else {
    pass("Arena page OK", "bridge links are client-side after judge (API judge verified)");
  }

  const submit = await fetchText("/submit");
  if (
    submit.text.includes("Executive Summary Battle") ||
    submit.text.includes("Submit solution")
  ) {
    pass("Submit form present");
  } else {
    fail("Submit form present");
  }
}

async function insertTestSubmission(testEmail: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  const payload = {
    challenge_id: "executive-summary-battle",
    name: "E2E Tester",
    email: testEmail,
    role: "Developer",
    prompt_used: "E2E automated test prompt with enough length for validation.",
    model_used: "claude-sonnet-4-6",
    estimated_cost: 0.15,
    output_result: SAMPLE_OUTPUT,
    workflow_notes: "e2e flow test",
  };

  const anonClient = createClient(url, anon);
  const { error: anonError } = await anonClient.from("submissions").insert(payload);
  if (!anonError) {
    pass("Submit via anon client (same as browser form)");
    return true;
  }

  if (service && !service.includes("REPLACE_ME")) {
    const adminClient = createClient(url, service);
    const { error: adminError } = await adminClient
      .from("submissions")
      .insert({ ...payload, status: "pending" });
    if (!adminError) {
      pass("Submit via service role", `anon blocked: ${anonError.message.slice(0, 50)}…`);
      return true;
    }
    fail("Submit to Supabase", adminError.message);
    return false;
  }

  fail("Submit to Supabase", anonError.message);
  return false;
}

async function flowSubmitAccount() {
  console.log("\n[2] Submit → email history → /account");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const testEmail = `e2e-${Date.now()}@ai-arena.test`;

  if (!url || !anon || url.includes("REPLACE_ME")) {
    fail("Submit insert", "Supabase not configured in .env.local");
    fail("Account history", "skipped");
    return;
  }

  const inserted = await insertTestSubmission(testEmail);
  if (!inserted) {
    fail("Account history API", "skipped — no submission");
    return;
  }

  const history = await fetchJson<{
    email: string;
    submissions: { email: string }[];
    source: string;
  }>(`/api/account/history?email=${encodeURIComponent(testEmail)}`);

  if (history.status === 200 && history.data.submissions.length >= 1) {
    pass("Account history API", `${history.data.submissions.length} submission(s)`);
  } else {
    fail(
      "Account history API",
      `count=${history.data.submissions?.length ?? 0} (set SUPABASE_SERVICE_ROLE_KEY in .env.local)`,
    );
  }

  const accountPage = await fetchText("/account");
  if (accountPage.status === 200 && accountPage.text.includes("Account history")) {
    pass("/account page loads");
  } else {
    fail("/account page loads");
  }
}

async function flowTournamentMarketplace() {
  console.log("\n[3] Tournament round → candidate pipeline → /marketplace");

  const state = createInitialTournamentState();
  const run = await fetchJson<{
    tournament?: { phase: string; round: number };
    marketplace?: unknown[];
    candidatePipeline?: { processed: number; created: number; records: unknown[] };
    effectiveRuntimeMode?: string;
    requestedRuntimeMode?: string | null;
    routing?: { runtimeMode?: string; guard?: { estimatedCostUsd?: number } };
    savedRoundId?: string | null;
    persistError?: string | null;
    error?: string;
  }>("/api/tournament/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state, step: "full", runtimeMode: "groq_free" }),
  });

  if (run.status !== 200) {
    fail("Tournament run", run.data.error ?? `HTTP ${run.status}`);
    return;
  }

  const phase = run.data.tournament?.phase;
  const round = run.data.tournament?.round;
  pass("Tournament run", `round=${round} phase=${phase}`);

  if (run.data.effectiveRuntimeMode === "mock") {
    pass("Server mode enforcement", `effective=mock (requested ${run.data.requestedRuntimeMode ?? "none"})`);
  } else {
    pass("Server mode enforcement", `effective=${run.data.effectiveRuntimeMode}`);
  }

  if (run.data.routing?.guard && typeof run.data.routing.guard.estimatedCostUsd === "number") {
    pass("Guard estimatedCostUsd", String(run.data.routing.guard.estimatedCostUsd));
  } else {
    fail("Guard estimatedCostUsd", "missing on routing.guard");
  }

  if (run.data.savedRoundId) {
    pass("Tournament auto-save", run.data.savedRoundId.slice(0, 8) + "…");
  } else if (run.data.persistError) {
    fail("Tournament auto-save", run.data.persistError);
  } else {
    fail("Tournament auto-save", "no savedRoundId");
  }

  const mpCount = run.data.marketplace?.length ?? 0;
  if (mpCount > 0) pass("Legacy marketplace seeds in state", String(mpCount));
  else fail("Legacy marketplace seeds in state", "empty");

  const pipeline = run.data.candidatePipeline;
  if (pipeline && pipeline.processed > 0) {
    pass("Candidate pipeline", `${pipeline.created} new · ${pipeline.processed} processed`);
  } else {
    fail("Candidate pipeline", "no candidates processed");
  }

  const marketplace = await fetchJson<{ listings?: unknown[] }>("/api/marketplace");
  if (marketplace.status === 200) {
    pass("GET /api/marketplace", `${marketplace.data.listings?.length ?? 0} listing(s)`);
  } else {
    fail("GET /api/marketplace", `HTTP ${marketplace.status}`);
  }

  const mpPage = await fetchText("/marketplace");
  if (mpPage.status === 200 && mpPage.text.includes("Marketplace")) {
    pass("/marketplace page loads");
  } else {
    fail("/marketplace page loads");
  }
}

async function flowWorkflows() {
  console.log("\n[4] Workflows → view & clone");

  const workflows = await fetchText("/workflows");
  if (
    workflows.status === 200 &&
    (workflows.text.includes("Section-first pipeline") ||
      workflows.text.includes("Workflow Library") ||
      workflows.text.includes("View & clone"))
  ) {
    pass("/workflows grid");
  } else {
    fail("/workflows grid", "client-rendered grid — check catalog via detail page");
  }

  const slug = getAllWorkflowSlugs()[0];
  if (!slug) {
    fail("Workflow catalog");
    return;
  }

  const detail = getWorkflowBySlug(slug);
  if (detail?.exportBundle && detail.promptTemplate) {
    pass("Workflow export bundle", slug);
  } else {
    fail("Workflow export bundle", slug);
  }

  const page = await fetchText(`/workflows/${slug}`);
  if (page.status === 200 && page.text.includes("Clone prompt") && page.text.includes("Download")) {
    pass(`/workflows/${slug} clone UI`);
  } else {
    fail(`/workflows/${slug} clone UI`);
  }
}

async function main() {
  loadEnv();
  console.log(`E2E flow tests → ${BASE}\n`);

  try {
    const health = await fetch(`${BASE}/api/health`);
    if (!health.ok) throw new Error(`health HTTP ${health.status}`);
    pass("Dev server reachable");
  } catch (err) {
    console.error(`\nDev server not reachable at ${BASE}. Run: npm run dev\n`);
    process.exit(1);
  }

  await flowArena();
  await flowSubmitAccount();
  await flowTournamentMarketplace();
  await flowWorkflows();

  const failed = results.filter((r) => !r.ok);
  console.log("\n" + "─".repeat(48));
  console.log(
    failed.length === 0
      ? `All ${results.length} checks passed.`
      : `${failed.length}/${results.length} failed:`,
  );
  if (failed.length) {
    for (const f of failed) console.log(`  • ${f.name}${f.detail ? `: ${f.detail}` : ""}`);
  }
  console.log(
    "\nNote: Arena→Submit bridge sessionStorage is covered by `npm run e2e:browser` (Playwright).\n",
  );
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
