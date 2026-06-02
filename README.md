# AI ARENA

Compete to build the most efficient AI workflows.

**MVP loop:** Challenge → Submit → Admin Review → Score → Leaderboard

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the full script from [`supabase/schema.sql`](supabase/schema.sql).
3. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase values
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test the full flow

1. **Submit** — [http://localhost:3000/submit](http://localhost:3000/submit)  
   Fill the form and submit. Row appears in Supabase `submissions` with `status = pending`.

2. **Admin** — [http://localhost:3000/admin](http://localhost:3000/admin)  
   Open a pending submission, set **Quality score** (0–100), optional notes, click **Approve** or **Reject**.  
   Approve auto-fills `cost_score` and `final_score` using the MVP formulas.

3. **Leaderboard** — [http://localhost:3000/leaderboard](http://localhost:3000/leaderboard)  
   Only `approved` submissions appear, sorted by `final_score` (ties: lower cost wins). Top 3 are highlighted.

4. **Supabase Table Editor** — confirm rows and status changes.

### Scoring (MVP)

**Cost score** from `estimated_cost` (USD):

| Cost | Cost score |
|------|------------|
| ≤ $0.10 | 100 |
| ≤ $0.25 | 90 |
| ≤ $0.50 | 80 |
| ≤ $1.00 | 70 |
| > $1.00 | 0 |

**Final score:** `quality_score × 0.8 + cost_score × 0.2`

## Deploy to Vercel

1. Push the repo and import the project in Vercel.
2. Add environment variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. Run `supabase/schema.sql` on your production Supabase project if you have not already.
4. Smoke-test submit → admin approve → leaderboard on the production URL.

> **Security:** The admin panel has no authentication in MVP mode. RLS policies in `schema.sql` are permissive for development. Tighten policies and protect `/admin` before a public launch.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/challenge/executive-summary-battle` | Challenge #1 details |
| `/submit` | Submit solution (Supabase) |
| `/leaderboard` | Approved rankings |
| `/workflows` | Workflow library (demo / legacy) |
| `/admin` | Manual review (unprotected MVP) |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
```

Legacy Postgres/Drizzle scripts (`db:push`, `db:seed`, etc.) remain for optional use but are not required for the Supabase MVP path.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
