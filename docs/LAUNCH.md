# AI ARENA — Challenge #1 launch checklist

## Environment (Vercel)

- [ ] `DATABASE_URL` — Vercel Postgres
- [ ] `OPENAI_API_KEY` — AI Judge scoring

## Database

```bash
npm run db:push
npm run db:seed
npm run challenge:open
```

## Smoke test

1. Landing `/` — waitlist saves to `waitlist_signups`
2. Cohort bar shows real waitlist count (cap 50)
3. `/challenge/executive-summary-battle` — status **Open now**, real submission counts
4. `/submit` — entry persists + auto-scores (if OpenAI key set)
5. `/leaderboard` — ranked entry appears
6. Hero CTA switches to **Submit entry** when challenge is `open`

## PDF input

Place file at `public/challenges/executive-summary-battle.pdf`

## Manual scoring backlog

```bash
npm run judge:pending
```
