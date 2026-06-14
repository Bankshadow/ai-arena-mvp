# AI ARENA — Database setup

## Primary path: Supabase (MVP)

The live app uses **Supabase Postgres**, not Drizzle/Neon.

### Tables

| Table | Purpose |
|-------|---------|
| `submissions` | Human workflow submissions |
| `battles` | Token efficiency battle history |
| `tournament_rounds` | Tournament round snapshots |
| `marketplace_listings` | Tournament → marketplace seeds |

### Schema source of truth

```
supabase/migrations/*.sql
```

### Sync to remote

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_DB_PASSWORD=...        # Dashboard → Settings → Database
SUPABASE_SERVICE_ROLE_KEY=...   # Dashboard → Settings → API (server only)

npm run supabase:push
npm run supabase:status
```

See [`supabase/README.md`](../supabase/README.md).

### RLS summary

- **Public insert** on submissions, battles, tournament_rounds, marketplace_listings
- **Public select** on submissions: `approved` only (RLS v2)
- **Admin / account history** use `SUPABASE_SERVICE_ROLE_KEY` on server

Migration: `20250104000000_rls_v2_submissions.sql`

---

## Legacy path: Drizzle / Neon (optional)

Not used by the Supabase MVP UI. Kept for historical scripts.

| Table | Purpose |
|-------|---------|
| `challenges` | Challenge metadata |
| `submissions` | Legacy Postgres submissions |
| `scores` | AI Judge scores |
| `waitlist_signups` | Landing waitlist |

```bash
npm run db:push
npm run db:seed
```

See `.github/workflows/database.yml` for CI on `db/**` changes.

---

## TypeScript types

Update `lib/supabase/types.ts` when migrations add columns/tables.
