# AI ARENA — Database setup

## Stack

- **Postgres** (Vercel Postgres / Neon)
- **Drizzle ORM** (`db/schema.ts`)
- **Neon serverless driver** (`@neondatabase/serverless`)

## Tables

| Table | Purpose |
|-------|---------|
| `challenges` | Challenge metadata, deadlines, scoring weights |
| `submissions` | User entries (name + email identity, no auth) |
| `scores` | AI Judge / computed scores per submission |
| `waitlist_signups` | Landing page beta waitlist |

## Local setup

1. Create a Postgres database (Vercel Storage → Postgres, or Neon).
2. Copy env file:

   ```bash
   cp .env.example .env.local
   ```

3. Set `DATABASE_URL` in `.env.local`.
4. Push schema:

   ```bash
   npm run db:push
   ```

5. Seed Challenge #1:

   ```bash
   npm run db:seed
   ```

6. (Optional) Open challenge for submissions:

   ```bash
   npm run challenge:open
   ```

## Vercel production

1. Add **Postgres** integration in Vercel project → auto-injects `DATABASE_URL`.
2. Run migrations from CI or locally against production URL:

   ```bash
   npm run db:push
   npm run db:seed
   ```

3. When ready to launch:

   ```bash
   npm run challenge:open
   ```

## Submissions

`/submit` persists entries via Server Action `submitChallengeEntry`:

- Challenge must be `open` (`npm run challenge:open`)
- Before deadline
- Max 3 attempts per email (normalized lowercase)
- Cost must be ≤ challenge `cost_limit_usd`

## AI Judge

After each submission, the server runs the AI Judge when `OPENAI_API_KEY` is set:

- **Quality score** (0–100): GPT evaluates the output against the challenge rubric
- **Cost efficiency** (0–100): `100 × (1 - cost / cost_limit)`
- **Final score**: `quality × 0.8 + cost_efficiency × 0.2` (weights from DB)

Score rows go to `scores`; submission `status` becomes `scored`.

Batch-score pending entries:

```bash
npm run judge:pending
```

## Waitlist

Landing page waitlist form calls `joinWaitlist` → `waitlist_signups` table.

## Leaderboard

`/leaderboard` loads live rankings from Postgres:

- Best **final score** per email for the active challenge
- Tie-break: lower cost wins
- Podium + table hide when empty (CTA to submit)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate SQL migrations from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema directly (fastest for MVP) |
| `npm run db:seed` | Seed Executive Summary Battle #1 |
| `npm run db:studio` | Drizzle Studio UI |
| `npm run challenge:open` | Set challenge status to `open` |

## Challenge input file

Place the PDF at:

`public/challenges/executive-summary-battle.pdf`

The seeded row points to `/challenges/executive-summary-battle.pdf`.
