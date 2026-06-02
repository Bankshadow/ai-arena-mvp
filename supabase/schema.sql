-- AI ARENA — Challenge #1 submissions (run in Supabase SQL Editor)

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
