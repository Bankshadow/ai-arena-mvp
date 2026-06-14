#!/usr/bin/env node
/**
 * Push supabase/migrations/* to remote.
 * Uses SUPABASE_DB_PASSWORD + project ref (no `supabase login` required).
 * Optional: npm run supabase:login + supabase:link for linked workflow.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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
      const hash = val.indexOf(" #");
      if (hash !== -1) val = val.slice(0, hash).trim();
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

function projectRefFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0] || null;
  } catch {
    return null;
  }
}

function buildDbUrl(ref, password) {
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

function run(cmd, label, env = process.env) {
  console.log(`\n→ ${label}\n`);
  execSync(cmd, { stdio: "inherit", shell: true, env });
}

loadEnv();

const projectRef =
  process.env.SUPABASE_PROJECT_REF?.trim() ||
  projectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");

if (!projectRef) {
  console.error(
    "Missing SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL in .env.local",
  );
  process.exit(1);
}

const password = process.env.SUPABASE_DB_PASSWORD?.trim();
const linked = existsSync(resolve(process.cwd(), "supabase", ".temp", "project-ref"));
const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

if (password) {
  const dbUrl = buildDbUrl(projectRef, password);
  run(
    `npx supabase db push --db-url "${dbUrl.replace(/"/g, '\\"')}"`,
    `supabase db push (project ${projectRef})`,
  );
} else if (linked) {
  run("npx supabase db push", "supabase db push (linked project)");
} else if (accessToken) {
  run(
    `npx supabase link --project-ref ${projectRef}`,
    `supabase link (project ${projectRef})`,
    { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken },
  );
  run("npx supabase db push", "supabase db push");
} else {
  console.error(`
Cannot push migrations. Add to .env.local:

  SUPABASE_DB_PASSWORD=...   # Dashboard → Settings → Database

Or run once:
  npm run supabase:login
  npm run supabase:link
`);
  process.exit(1);
}

console.log("\n✓ Migrations applied to remote Supabase.\n");
