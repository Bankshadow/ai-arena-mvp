import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const template = resolve(root, "env.import.example");
const target = resolve(root, ".env.local");

if (existsSync(target)) {
  console.log(".env.local already exists — skipped (edit it manually if needed).");
} else if (!existsSync(template)) {
  console.error("env.import.example not found.");
  process.exit(1);
} else {
  copyFileSync(template, target);
  console.log("Created .env.local from env.import.example");
  console.log("Next: edit .env.local and replace REPLACE_ME values, then run npm run dev");
}
