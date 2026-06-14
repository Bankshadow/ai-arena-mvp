-- Tournament → marketplace candidate pipeline (review before publish)

create table if not exists public.marketplace_candidates (
  id uuid primary key default gen_random_uuid(),
  dedup_key text not null unique,
  component_type text not null,
  challenge_category text not null,
  winning_agent text not null,
  strategy_hash text not null,
  title text not null,
  description text not null default '',
  tournament_id text not null,
  source_round integer not null,
  agent_id text,
  agent_name text,
  challenge_title text,
  total_score numeric not null,
  marketplace_score numeric not null default 0,
  status text not null default 'detected',
  tested_runs integer not null default 1,
  avg_score numeric not null,
  avg_cost numeric not null default 0,
  avg_tokens numeric not null default 0,
  avg_latency numeric not null default 0,
  evidence jsonb not null default '[]'::jsonb,
  judge_notes jsonb not null default '[]'::jsonb,
  proof jsonb not null default '{}'::jsonb,
  arena_score jsonb not null default '{}'::jsonb,
  component_id text,
  payload jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_candidates_status_check check (
    status in ('detected', 'draft', 'review_needed', 'approved', 'published', 'archived')
  )
);

create index if not exists marketplace_candidates_status_idx
  on public.marketplace_candidates (status, last_seen_at desc);

create index if not exists marketplace_candidates_dedup_idx
  on public.marketplace_candidates (dedup_key);

alter table public.marketplace_candidates enable row level security;

drop policy if exists "marketplace_candidates_public_select" on public.marketplace_candidates;
create policy "marketplace_candidates_public_select"
  on public.marketplace_candidates for select
  to anon, authenticated
  using (status = 'published');

comment on table public.marketplace_candidates is
  'Tournament-detected reusable assets — review workflow before catalog publish.';
