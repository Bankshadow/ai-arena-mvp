-- DEPRECATED — applied via migration 20250102000000_tournament_rounds.sql
-- Use: npm run supabase:push

create table if not exists public.tournament_rounds (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null,
  round integer not null,
  mode text not null default 'mock',
  phase text not null,
  winner_agent_id text,
  winner_score numeric,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint tournament_rounds_mode_check check (mode in ('live', 'mock'))
);

create index if not exists tournament_rounds_tournament_idx
  on public.tournament_rounds (tournament_id, round desc);

create index if not exists tournament_rounds_created_at_idx
  on public.tournament_rounds (created_at desc);

alter table public.tournament_rounds enable row level security;

drop policy if exists "tournament_rounds_public_insert" on public.tournament_rounds;
create policy "tournament_rounds_public_insert"
  on public.tournament_rounds for insert
  to anon, authenticated
  with check (true);

drop policy if exists "tournament_rounds_public_select" on public.tournament_rounds;
create policy "tournament_rounds_public_select"
  on public.tournament_rounds for select
  to anon, authenticated
  using (true);

-- Verify (optional): should return 1 row
-- select count(*) from information_schema.tables where table_name = 'tournament_rounds';
