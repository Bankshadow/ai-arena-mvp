#!/usr/bin/env node
/**
 * Sync .env.local Supabase (+ optional) vars to Vercel Production + Preview.
 * Uses Vercel CLI auth.json token or VERCEL_TOKEN env.
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const VERCEL_API = "https://api.vercel.com";

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GROQ_API_KEY",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
];

function loadEnvLocal() {
  const path = resolve(ROOT, ".env.local");
  if (!existsSync(path)) throw new Error(".env.local not found");
  const out = {};
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
    out[key] = val;
  }
  return out;
}

function getToken() {
  if (process.env.VERCEL_TOKEN?.trim()) return process.env.VERCEL_TOKEN.trim();
  const authPath = resolve(
    homedir(),
    "AppData/Roaming/xdg.data/com.vercel.cli/auth.json",
  );
  if (!existsSync(authPath)) throw new Error("Vercel auth.json not found — run npx vercel login");
  const auth = JSON.parse(readFileSync(authPath, "utf8"));
  if (!auth.token) throw new Error("No token in Vercel auth.json");
  return auth.token;
}

async function vercelFetch(path, token, init = {}) {
  const res = await fetch(`${VERCEL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return data;
}

async function findProject(token) {
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  const qs = teamId ? `?teamId=${teamId}` : "";
  const projects = await vercelFetch(`/v9/projects${qs}`, token);
  const names = ["ai-arena-mvp", "ai-arena-drab", "ai-arena"];
  for (const name of names) {
    const hit = projects.projects?.find(
      (p) => p.name === name || p.link?.repo === "Bankshadow/ai-arena-mvp",
    );
    if (hit) return hit;
  }
  const byRepo = projects.projects?.find(
    (p) => p.link?.repo?.includes("ai-arena"),
  );
  if (byRepo) return byRepo;
  throw new Error(
    `Vercel project not found. Projects: ${projects.projects?.map((p) => p.name).join(", ") ?? "none"}`,
  );
}

function isPlaceholder(val) {
  if (!val?.trim()) return true;
  const v = val.trim().toLowerCase();
  return v.includes("replace_me") || v.includes("your-") || v.endsWith("-...");
}

async function upsertEnv(projectId, token, key, value, teamId) {
  const teamQs = teamId ? `?teamId=${teamId}` : "";
  const existing = await vercelFetch(
    `/v9/projects/${projectId}/env${teamQs}`,
    token,
  );
  const hits = (existing.envs ?? []).filter((e) => e.key === key);
  for (const hit of hits) {
    await vercelFetch(
      `/v9/projects/${projectId}/env/${hit.id}${teamQs}`,
      token,
      { method: "DELETE" },
    );
  }

  const isPublic = key.startsWith("NEXT_PUBLIC_");
  await vercelFetch(`/v10/projects/${projectId}/env${teamQs}`, token, {
    method: "POST",
    body: JSON.stringify({
      key,
      value,
      type: isPublic ? "plain" : "encrypted",
      target: ["production", "preview"],
    }),
  });
}

async function triggerDeploy(project, token, teamId) {
  const teamQs = teamId ? `?teamId=${teamId}` : "";
  await vercelFetch(`/v13/deployments${teamQs}`, token, {
    method: "POST",
    body: JSON.stringify({
      name: project.name,
      project: project.id,
      target: "production",
      gitSource: {
        type: "github",
        ref: "main",
        repoId: project.link?.repoId,
      },
    }),
  });
}

async function main() {
  const token = getToken();
  const local = loadEnvLocal();
  const project = await findProject(token);
  const teamId = project.accountId?.startsWith("team_") ? project.accountId : undefined;

  console.log(`Vercel project: ${project.name} (${project.id})`);

  let synced = 0;
  for (const key of KEYS) {
    const val = local[key];
    if (!val || isPlaceholder(val)) continue;
    await upsertEnv(project.id, token, key, val, teamId);
    console.log(`  ✓ ${key}`);
    synced++;
  }

  if (synced === 0) {
    throw new Error("No env vars synced — check .env.local values");
  }

  try {
    await triggerDeploy(project, token, teamId);
    console.log("\n✓ Production redeploy triggered.");
  } catch (err) {
    console.log("\nEnv synced. Redeploy from Vercel dashboard if auto-deploy did not start.");
    console.log(String(err));
  }

  console.log(`\nDone — ${synced} variable(s) synced to Production + Preview.\n`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
