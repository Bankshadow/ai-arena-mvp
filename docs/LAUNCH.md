# AI ARENA — Challenge #1 launch checklist

## Environment (Vercel)

In **Project → Settings → Environment Variables** (Production + Preview):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | From Vercel Postgres / Neon integration |
| `OPENAI_API_KEY` | For auto-scoring | AI Judge on submit + `npm run judge:pending` |
| `JUDGE_MODEL` | No | Default `gpt-4o-mini` |

After adding variables, **redeploy** so serverless functions pick them up.

### One-time production database

From your machine (with production `DATABASE_URL` in env, or Vercel CLI):

```bash
npm run db:push
npm run db:seed
npm run challenge:open
```

Or use Vercel’s SQL console / Neon dashboard to confirm tables exist, then run the same scripts locally against the production connection string.

## Local development

```bash
cp .env.example .env.local
# Set DATABASE_URL and optionally OPENAI_API_KEY

npm run db:push
npm run db:seed
npm run challenge:open
npm run dev
```

## Smoke test

1. **Landing** `/` — waitlist saves to `waitlist_signups`; cohort bar uses DB count when connected
2. **Challenge** `/challenge/executive-summary-battle` — live status badge, submission/player/scored stats when DB connected
3. **Submit** `/submit` — persists to Postgres when challenge is `open`; shows judge scores if `OPENAI_API_KEY` set; falls back to localStorage without DB
4. **Leaderboard** `/leaderboard` — live ranked entries from scored submissions (+ local demo rows)
5. **Workflows** `/workflows` — top 3 workflows from DB when scored entries exist; else demo cards
6. Hero CTA on landing → **Submit entry** when challenge status is `open`

## PDF input

Place file at `public/challenges/executive-summary-battle.pdf` (linked from challenge page when present).

## Manual scoring backlog

If submissions stay `pending` (no OpenAI key at submit time):

```bash
npm run judge:pending
```

## Challenge input PDF

```bash
npm run challenge:pdf     # placeholder for local dev (public/challenges/...)
# Replace with the real 20-page PDF before production — see public/challenges/README.md
```

## Open / close challenge

```bash
npm run challenge:open    # status → open (accept submissions)
npm run challenge:close   # status → closed (block new submissions)
```

## GitHub Actions (schema deploy)

Workflow `.github/workflows/database.yml` runs `npm run db:push` when `db/**` changes on `main`.

1. GitHub repo → **Settings → Secrets → Actions**
2. Add `DATABASE_URL` (same value as Vercel Postgres)
3. Push to `main` or run workflow **Database** manually

Optional: trigger **workflow_dispatch** to also run `db:seed` after schema push.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Submit says “database is not configured” | Set `DATABASE_URL` on Vercel and redeploy |
| Submit says “not open yet” | `npm run challenge:open` against that database |
| Leaderboard empty with DB | Need scored submissions; set `OPENAI_API_KEY` or run `judge:pending` |
| Workflows show demo cards | No scored submissions yet — complete smoke test step 4 |
