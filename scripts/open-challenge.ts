import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { challenges } from "../db/schema";

const SLUG = "executive-summary-battle";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const db = drizzle(neon(url));

  const result = await db
    .update(challenges)
    .set({ status: "open" })
    .where(eq(challenges.slug, SLUG))
    .returning({ slug: challenges.slug, status: challenges.status });

  if (result.length === 0) {
    console.error(`Challenge not found: ${SLUG}. Run npm run db:seed first.`);
    process.exit(1);
  }

  console.log(`Challenge "${result[0].slug}" is now ${result[0].status}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
