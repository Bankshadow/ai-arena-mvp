"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db/index";
import { waitlistSignups } from "@/db/schema";

const waitlistSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.string().trim().min(1),
  interestType: z.string().trim().min(1),
});

export type JoinWaitlistResult =
  | { success: true; alreadyRegistered?: boolean }
  | { success: false; error: string };

export async function joinWaitlist(raw: z.infer<typeof waitlistSchema>): Promise<JoinWaitlistResult> {
  const parsed = waitlistSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Please check your waitlist entries." };
  }

  const { name, email, role, interestType } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  let db;
  try {
    db = getDb();
  } catch {
    return {
      success: false,
      error: "Waitlist is unavailable — database is not configured.",
    };
  }

  const existing = await db
    .select({ id: waitlistSignups.id })
    .from(waitlistSignups)
    .where(eq(waitlistSignups.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    return { success: true, alreadyRegistered: true };
  }

  await db.insert(waitlistSignups).values({
    name,
    email: normalizedEmail,
    role,
    interestType,
  });

  return { success: true };
}
