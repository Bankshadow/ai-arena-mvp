#!/usr/bin/env node
/** Smoke test — run after deploy or locally: node scripts/smoke-test.mjs [baseUrl] */

const base = process.argv[2] ?? "http://localhost:3005";

const checks = [
  { name: "health", path: "/api/health", expectOk: true },
  { name: "tournament-status", path: "/api/tournament/status" },
  { name: "leaderboard-page", path: "/leaderboard", html: true },
  { name: "tournament-page", path: "/tournament", html: true },
  { name: "arena-page", path: "/arena", html: true },
];

let failed = 0;

for (const check of checks) {
  const url = `${base}${check.path}`;
  try {
    const res = await fetch(url);
    const ok = check.expectOk ? res.ok : res.status < 500;
    if (!ok) {
      console.log(`FAIL ${check.name} — HTTP ${res.status} ${url}`);
      failed++;
      continue;
    }
    if (check.path === "/api/health") {
      const data = await res.json();
      console.log(
        `${data.ok ? "OK" : "WARN"} ${check.name} — supabase=${data.env?.supabaseConfigured} table=${data.env?.supabaseTableReady}`,
      );
      if (!data.ok) failed++;
    } else {
      console.log(`OK ${check.name} — ${res.status}`);
    }
  } catch (err) {
    console.log(`FAIL ${check.name} — ${err instanceof Error ? err.message : err}`);
    failed++;
  }
}

console.log(failed === 0 ? "\nAll smoke checks passed." : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
