import { eq } from "drizzle-orm";

import { getDb } from "@/db/index";
import { challenges } from "@/db/schema";

export async function getChallengeBySlug(slug: string) {
  const db = getDb();
  const rows = await db.select().from(challenges).where(eq(challenges.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export function parseCostLimit(costLimitUsd: string): number {
  return parseFloat(costLimitUsd);
}
