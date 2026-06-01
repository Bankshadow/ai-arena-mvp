import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description").notNull(),
  rules: jsonb("rules").$type<string[]>().notNull().default([]),
  costLimitUsd: numeric("cost_limit_usd", { precision: 6, scale: 2 }).notNull().default("1.00"),
  qualityWeight: numeric("quality_weight", { precision: 3, scale: 2 }).notNull().default("0.80"),
  costWeight: numeric("cost_weight", { precision: 3, scale: 2 }).notNull().default("0.20"),
  deadlineAt: timestamp("deadline_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("beta"), // beta | open | closed
  inputFileUrl: text("input_file_url"),
  maxAttempts: integer("max_attempts").notNull().default(3),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeId: uuid("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    email: text("email").notNull(),
    promptUsed: text("prompt_used").notNull(),
    modelUsed: text("model_used").notNull(),
    estimatedCostUsd: numeric("estimated_cost_usd", { precision: 8, scale: 4 }).notNull(),
    output: text("output").notNull(),
    status: text("status").notNull().default("pending"), // pending | scoring | scored | rejected
    attemptNumber: integer("attempt_number").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("submissions_challenge_email_attempt_idx").on(
      table.challengeId,
      table.email,
      table.attemptNumber
    ),
    index("submissions_challenge_email_idx").on(table.challengeId, table.email),
    index("submissions_challenge_status_idx").on(table.challengeId, table.status),
  ]
);

export const scores = pgTable("scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .unique()
    .references(() => submissions.id, { onDelete: "cascade" }),
  qualityScore: integer("quality_score").notNull(),
  costEfficiencyScore: integer("cost_efficiency_score").notNull(),
  finalScore: numeric("final_score", { precision: 5, scale: 2 }).notNull(),
  judgeModel: text("judge_model"),
  judgeRaw: jsonb("judge_raw"),
  scoredAt: timestamp("scored_at", { withTimezone: true }).notNull().defaultNow(),
});

export const waitlistSignups = pgTable(
  "waitlist_signups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role"),
    interestType: text("interest_type"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("waitlist_signups_email_idx").on(table.email)]
);

export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type Score = typeof scores.$inferSelect;
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
