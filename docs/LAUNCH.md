# AI ARENA — Launch checklist

Updated: 2026-06-14 (Supabase MVP + Phase A–D)

## Environment (Vercel)

Import from `vercel.env.example` or set manually:

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Admin approve + account history |
| `ADMIN_USERNAME` | Yes | Protect `/admin` |
| `ADMIN_PASSWORD` | Yes | Strong password |
| `ANTHROPIC_API_KEY` | Optional | Live LLM; omit = mock mode |

Redeploy after changing env vars.

## Database (one-time per environment)

```bash
npm run supabase:push
```

Or run migrations via CI with `SUPABASE_DB_PASSWORD` + project ref.

## Smoke test

```bash
npm run smoke:prod
# or locally:
npm run dev
npm run smoke
npm run e2e
```

### Manual browser checks

1. **Submit** `/submit` → row in Supabase `submissions` (pending)
2. **Admin** `/admin` → Basic Auth → approve → leaderboard
3. **Arena** `/arena` → judge output → links to Submit / Battle / Enterprise
4. **Account** `/account` → email → see submission history
5. **Tournament** `/tournament` → complete round → `/marketplace` listings
6. **Workflows** `/workflows/[slug]` → clone prompt / download `.md`

## Security before public launch

- [x] Basic Auth on `/admin` (MVP11)
- [x] RLS v2 — no public UPDATE on submissions (MVP12)
- [ ] Rotate `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` if ever leaked
- [ ] Never commit `.env.local`

## Production URL

https://ai-arena-drab.vercel.app

Status log: [`HANDOFF.md`](../HANDOFF.md)
