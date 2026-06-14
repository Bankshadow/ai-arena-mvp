-- AI ARENA — DEPRECATED snapshot (use supabase/migrations/ + npm run supabase:push)
-- See supabase/README.md

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null default 'executive-summary-battle',
  name text not null,
  email text not null,
  role text,
  prompt_used text not null,
  model_used text not null,
  estimated_cost numeric not null,
  output_result text not null,
  workflow_notes text,
  quality_score numeric,
  cost_score numeric,
  final_score numeric,
  status text not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint submissions_status_check check (
    status in ('pending', 'approved', 'rejected')
  )
);

create index if not exists submissions_challenge_status_idx
  on public.submissions (challenge_id, status);

create index if not exists submissions_leaderboard_idx
  on public.submissions (challenge_id, status, final_score desc);

alter table public.submissions enable row level security;

-- MVP: anon key — public insert + read/update for unprotected admin panel.
-- Tighten policies before production launch.

drop policy if exists "submissions_public_insert" on public.submissions;
create policy "submissions_public_insert"
  on public.submissions for insert
  to anon, authenticated
  with check (true);

drop policy if exists "submissions_public_select" on public.submissions;
create policy "submissions_public_select"
  on public.submissions for select
  to anon, authenticated
  using (true);

drop policy if exists "submissions_public_update" on public.submissions;
create policy "submissions_public_update"
  on public.submissions for update
  to anon, authenticated
  using (true)
  with check (true);

-- MVP9: AI battle history (generate challenge → 5-agent token battle)

create table if not exists public.battles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text not null,
  difficulty text not null,
  pass_threshold numeric not null,
  mode text not null default 'demo',
  winner_agent_id text,
  winner_tokens integer,
  passed_count integer not null default 0,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint battles_mode_check check (mode in ('live', 'demo'))
);

create index if not exists battles_created_at_idx
  on public.battles (created_at desc);

alter table public.battles enable row level security;

drop policy if exists "battles_public_insert" on public.battles;
create policy "battles_public_insert"
  on public.battles for insert
  to anon, authenticated
  with check (true);

drop policy if exists "battles_public_select" on public.battles;
create policy "battles_public_select"
  on public.battles for select
  to anon, authenticated
  using (true);

-- Tournament round snapshots (autonomous loop history)

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

-- Marketplace listings (MVP19)
create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  agent_id text not null,
  agent_name text not null,
  challenge_title text not null,
  total_score numeric not null,
  marketplace_score numeric not null,
  suggested_price_usd numeric not null,
  status text not null default 'seed',
  workflow_steps jsonb not null default '[]'::jsonb,
  prompt_template text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint marketplace_listings_status_check check (status in ('seed', 'review', 'listed'))
);

create index if not exists marketplace_listings_status_idx
  on public.marketplace_listings (status, marketplace_score desc);

create index if not exists marketplace_listings_created_at_idx
  on public.marketplace_listings (created_at desc);

alter table public.marketplace_listings enable row level security;

drop policy if exists "marketplace_public_select" on public.marketplace_listings;
create policy "marketplace_public_select"
  on public.marketplace_listings for select
  to anon, authenticated
  using (status in ('listed', 'review', 'seed'));

drop policy if exists "marketplace_public_insert" on public.marketplace_listings;
create policy "marketplace_public_insert"
  on public.marketplace_listings for insert
  to anon, authenticated
  with check (true);
