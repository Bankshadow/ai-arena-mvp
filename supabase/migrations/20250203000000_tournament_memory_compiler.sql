-- AI ARENA: Tournament Memory Compiler (learning layer)

create table if not exists public.tournament_events (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null,
  round integer not null default 0,
  phase text not null,
  message text not null,
  agent_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tournament_events_tournament_idx
  on public.tournament_events (tournament_id, round, created_at desc);

create table if not exists public.memory_logs (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null,
  round integer not null,
  log_date date not null,
  title text not null,
  summary text not null default '',
  event_count integer not null default 0,
  winner_agent_id text,
  winner_score numeric,
  challenge_title text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists memory_logs_date_idx
  on public.memory_logs (log_date desc);

create table if not exists public.memory_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  article_type text not null,
  title text not null,
  summary text not null default '',
  body text not null default '',
  confidence numeric not null default 0,
  tags jsonb not null default '[]'::jsonb,
  agent_ids jsonb not null default '[]'::jsonb,
  tournament_id text not null,
  round integer not null default 0,
  evidence_ids jsonb not null default '[]'::jsonb,
  source_compile_run_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memory_articles_type_idx
  on public.memory_articles (article_type, created_at desc);

create table if not exists public.memory_article_links (
  id uuid primary key default gen_random_uuid(),
  from_article_id uuid not null references public.memory_articles (id) on delete cascade,
  to_article_id uuid not null references public.memory_articles (id) on delete cascade,
  link_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_lessons (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  agent_name text not null,
  lesson_type text not null,
  title text not null,
  content text not null default '',
  confidence numeric not null default 0,
  tournament_id text not null,
  round integer not null default 0,
  article_id uuid references public.memory_articles (id) on delete set null,
  stale boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_lessons_agent_idx
  on public.agent_lessons (agent_id, lesson_type);

create table if not exists public.strategy_recommendations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  recommendation text not null,
  rationale text not null default '',
  priority text not null default 'medium',
  agent_id text,
  article_id uuid references public.memory_articles (id) on delete set null,
  tournament_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.constitution_update_proposals (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  agent_name text not null,
  constitution_id text not null,
  current_version text not null,
  proposed_version text not null,
  field_changes jsonb not null default '[]'::jsonb,
  status text not null default 'pending_review',
  confidence numeric not null default 0,
  article_id uuid references public.memory_articles (id) on delete set null,
  tournament_id text not null,
  round integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists constitution_proposals_status_idx
  on public.constitution_update_proposals (status, created_at desc);

create table if not exists public.knowledge_compile_runs (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null,
  round integer not null,
  status text not null default 'running',
  articles_created integer not null default 0,
  lessons_updated integer not null default 0,
  proposals_generated integer not null default 0,
  evidence_notes_created integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error text
);

create table if not exists public.memory_lint_reports (
  id uuid primary key default gen_random_uuid(),
  health_score numeric not null,
  issues jsonb not null default '[]'::jsonb,
  summary text not null default '',
  run_at timestamptz not null default now()
);

create table if not exists public.marketplace_evidence_notes (
  id uuid primary key default gen_random_uuid(),
  marketplace_candidate_id text not null,
  component_id text,
  tournament_id text not null,
  round integer not null,
  note text not null,
  evidence_article_ids jsonb not null default '[]'::jsonb,
  confidence numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.tournament_events enable row level security;
alter table public.memory_logs enable row level security;
alter table public.memory_articles enable row level security;
alter table public.memory_article_links enable row level security;
alter table public.agent_lessons enable row level security;
alter table public.strategy_recommendations enable row level security;
alter table public.constitution_update_proposals enable row level security;
alter table public.knowledge_compile_runs enable row level security;
alter table public.memory_lint_reports enable row level security;
alter table public.marketplace_evidence_notes enable row level security;

drop policy if exists "memory_articles_public_select" on public.memory_articles;
create policy "memory_articles_public_select"
  on public.memory_articles for select to anon, authenticated using (true);

drop policy if exists "agent_lessons_public_select" on public.agent_lessons;
create policy "agent_lessons_public_select"
  on public.agent_lessons for select to anon, authenticated using (true);

comment on table public.memory_articles is
  'Tournament Memory Compiler knowledge articles — mock-first in app until wired.';
