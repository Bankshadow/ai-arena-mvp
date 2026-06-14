# Supabase database sync

Schema changes live in **`supabase/migrations/`** and sync to your remote project via the Supabase CLI — no manual SQL Editor copy/paste.

## One-time setup

1. Copy env (if not done):

   ```bash
   copy env.import.example .env.local
   ```

2. Fill in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SUPABASE_PROJECT_REF=YOUR_REF          # optional — parsed from URL if omitted
   SUPABASE_DB_PASSWORD=...               # Dashboard → Settings → Database
   ```

3. Log in and link:

   ```bash
   npm run supabase:login
   npm run supabase:link
   ```

   Or skip interactive link by setting `SUPABASE_DB_PASSWORD` and run `npm run supabase:push` (auto-links).

## Daily workflow

```bash
# 1. Create a new migration
npm run supabase:new -- add_my_column

# 2. Edit supabase/migrations/YYYYMMDDHHMMSS_add_my_column.sql

# 3. Push to remote Supabase
npm run supabase:push

# 4. Verify
npm run supabase:status
```

## Commands

| Script | What it does |
|--------|----------------|
| `npm run supabase:login` | Browser login for Supabase CLI |
| `npm run supabase:link` | Link repo to remote project |
| `npm run supabase:push` | Apply pending migrations to remote |
| `npm run supabase:status` | List local vs remote migration state |
| `npm run supabase:new -- name` | Scaffold new migration file |
| `npm run supabase:diff` | Generate migration from remote diff (advanced) |

## Migration history

| File | Contents |
|------|----------|
| `20250101000000_submissions_and_battles.sql` | Core MVP tables |
| `20250102000000_tournament_rounds.sql` | Tournament persistence |
| `20250103000000_marketplace_listings.sql` | Marketplace |
| `20250104000000_rls_v2_submissions.sql` | Tighter RLS (MVP12) |

## Legacy files

`schema.sql`, `rls-v2.sql`, etc. at repo root of `supabase/` are **reference only**. Use migrations + `supabase:push`.

## CI (optional)

Set `SUPABASE_ACCESS_TOKEN` + `SUPABASE_DB_PASSWORD` + `SUPABASE_PROJECT_REF` in GitHub Actions, then:

```bash
npx supabase link --project-ref $SUPABASE_PROJECT_REF --password $SUPABASE_DB_PASSWORD
npx supabase db push
```
