#!/usr/bin/env node
/** Create a new timestamped migration file. Usage: npm run supabase:new -- add_feature_name */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const name = process.argv.slice(2).join("_").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
if (!name) {
  console.error("Usage: npm run supabase:new -- describe_change");
  process.exit(1);
}

const now = new Date();
const stamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
  String(now.getHours()).padStart(2, "0"),
  String(now.getMinutes()).padStart(2, "0"),
  String(now.getSeconds()).padStart(2, "0"),
].join("");

const dir = resolve(process.cwd(), "supabase", "migrations");
mkdirSync(dir, { recursive: true });
const file = resolve(dir, `${stamp}_${name}.sql`);

writeFileSync(
  file,
  `-- ${name.replace(/_/g, " ")}\n\n-- TODO: write SQL here\n`,
  "utf8",
);

console.log(`Created ${file}`);
