# AI ARENA

Compete to build the most efficient AI workflows.

**Live:** [ai-arena-drab.vercel.app](https://ai-arena-drab.vercel.app)  
**MVP loop:** Challenge → Arena / Battle / Tournament → Submit → Admin → Leaderboard → Marketplace

## Quick start

```bash
npm install
cp env.import.example .env.local   # fill Supabase + optional keys
npm run dev                        # http://localhost:3005
```

## Supabase setup

**Recommended — CLI migrations (no manual SQL Editor):**

```bash
# .env.local: NEXT_PUBLIC_SUPABASE_*, SUPABASE_DB_PASSWORD
npm run supabase:push
```

See [`supabase/README.md`](supabase/README.md) and [`.cursor/rules/supabase-migrations.mdc`](.cursor/rules/supabase-migrations.mdc).

**Legacy:** run [`supabase/schema.sql`](supabase/schema.sql) in SQL Editor (reference only).

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Admin API + account history (*server only) |
| `SUPABASE_DB_PASSWORD` | For migrations | `npm run supabase:push` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | For `/admin` | HTTP Basic Auth |
| `ANTHROPIC_API_KEY` | Optional | Live LLM; omit = mock mode |

## Test

```bash
npm run build
npm run smoke          # local
npm run smoke:prod     # production
npm run e2e            # 19 flow checks (dev server must be running)
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/challenge/executive-summary-battle` | Challenge #1 |
| `/arena` | Human vs AI (AI Judge) |
| `/battle` | 5-agent token battle |
| `/tournament` | Autonomous tournament |
| `/submit` | Submit solution |
| `/leaderboard` | Unified rankings |
| `/workflows`, `/workflows/[slug]` | Workflow library + clone |
| `/marketplace` | Tournament workflow listings |
| `/account` | Submission / battle / tournament history by email |
| `/enterprise` | Private team benchmark |
| `/admin` | Review panel (Basic Auth) |

Full map: [`HANDOFF.md`](HANDOFF.md)

## Scripts

```bash
npm run dev              # :3005
npm run build
npm run lint
npm run smoke / smoke:prod
npm run e2e
npm run supabase:push    # sync DB migrations
npm run supabase:new -- name
```

Legacy Drizzle scripts (`db:push`, `db:seed`) remain optional.

## Deploy (Vercel)

1. Import repo; set env from `vercel.env.example`
2. `npm run supabase:push` against production DB (or CI)
3. Redeploy; run `npm run smoke:prod`

## Handoff

**[`HANDOFF.md`](HANDOFF.md)** — full MVP status, architecture, env, next steps for Claude/Cursor.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
