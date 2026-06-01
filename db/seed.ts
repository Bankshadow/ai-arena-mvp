import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { EXECUTIVE_SUMMARY_BATTLE } from "../lib/data/challenges";
import { challenges } from "./schema";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required. Copy .env.example to .env.local and set your Postgres URL.");
    process.exit(1);
  }

  const db = drizzle(neon(url));

  const existing = await db
    .select({ id: challenges.id })
    .from(challenges)
    .where(eq(challenges.slug, EXECUTIVE_SUMMARY_BATTLE.slug))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Challenge "${EXECUTIVE_SUMMARY_BATTLE.slug}" already seeded — skipping.`);
    return;
  }

  await db.insert(challenges).values({
    slug: EXECUTIVE_SUMMARY_BATTLE.slug,
    name: EXECUTIVE_SUMMARY_BATTLE.name,
    tagline: EXECUTIVE_SUMMARY_BATTLE.tagline,
    description: EXECUTIVE_SUMMARY_BATTLE.description,
    rules: EXECUTIVE_SUMMARY_BATTLE.rules,
    costLimitUsd: "1.00",
    qualityWeight: "0.80",
    costWeight: "0.20",
    deadlineAt: new Date(EXECUTIVE_SUMMARY_BATTLE.deadline),
    status: EXECUTIVE_SUMMARY_BATTLE.status,
    inputFileUrl: "/challenges/executive-summary-battle.pdf",
    maxAttempts: EXECUTIVE_SUMMARY_BATTLE.attempts,
  });

  console.log(`Seeded challenge: ${EXECUTIVE_SUMMARY_BATTLE.name}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
