#!/usr/bin/env node
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
    return new URL(url).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

loadEnv();

const projectRef =
  process.env.SUPABASE_PROJECT_REF?.trim() ||
  projectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");

if (!projectRef) {
  console.error("Set SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

const password = process.env.SUPABASE_DB_PASSWORD?.trim();
const pwdFlag = password
  ? `--password "${password.replace(/"/g, '\\"')}"`
  : "";

execSync(`npx supabase link --project-ref ${projectRef} ${pwdFlag}`, {
  stdio: "inherit",
  shell: true,
});

console.log("\n✓ Linked to Supabase project:", projectRef, "\n");
