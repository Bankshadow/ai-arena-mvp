-- AI ARENA — Tournament Engine V2: multi-provider routing schema
-- Run: npm run supabase:push
-- Design: docs/TOURNAMENT-ENGINE-V2.md

-- ─── Model providers ───────────────────────────────────────────────────────

create table if not exists public.model_providers (
  id text primary key,
  display_name text not null,
  base_url text,
  enabled boolean not null default true,
  priority integer not null default 100,
  openai_compatible boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.model_providers (id, display_name, base_url, openai_compatible, priority) values
  ('mock', 'Mock (no API)', null, false, 0),
  ('groq', 'Groq', 'https://api.groq.com/openai/v1', true, 10),
  ('anthropic', 'Anthropic', null, false, 20),
  ('openai', 'OpenAI', 'https://api.openai.com/v1', true, 30)
on conflict (id) do nothing;

-- ─── Model configs (limits + pricing) ──────────────────────────────────────

create table if not exists public.model_configs (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references public.model_providers (id),
  model_id text not null,
  display_name text not null,
  max_rpm integer,
  max_rpd integer,
  max_tpd bigint,
  input_price_per_m numeric not null default 0,
  output_price_per_m numeric not null default 0,
  default_max_tokens integer not null default 1024,
  default_temperature numeric not null default 0.5,
  task_types text[] not null default '{}',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (provider_id, model_id)
);

insert into public.model_configs (provider_id, model_id, display_name, max_rpm, max_rpd, input_price_per_m, output_price_per_m, default_max_tokens, task_types) values
  ('groq', 'llama-3.1-8b-instant', 'Llama 3.1 8B Instant', 30, 14400, 0.05, 0.08, 1024, array['challenge_generation','competitor_execution','preliminary_judging']),
  ('groq', 'llama-3.3-70b-versatile', 'Llama 3.3 70B', 30, 14400, 0.59, 0.79, 2048, array['challenge_generation','competitor_execution']),
  ('anthropic', 'claude-sonnet-4-6', 'Claude Sonnet 4.6', null, null, 3.0, 15.0, 4096, array['final_judging','marketplace_polish','benchmark_report']),
  ('anthropic', 'claude-opus-4-8', 'Claude Opus 4.8', null, null, 5.0, 25.0, 4096, array['final_judging','enterprise_review']),
  ('openai', 'gpt-4o', 'GPT-4o', null, null, 2.5, 10.0, 4096, array['final_judging','benchmark_report'])
on conflict (provider_id, model_id) do nothing;

-- ─── Runtime modes ─────────────────────────────────────────────────────────

create table if not exists public.runtime_modes (
  id text primary key,
  display_name text not null,
  description text,
  policy jsonb not null,
  sort_order integer not null default 0,
  enabled boolean not null default true
);

insert into public.runtime_modes (id, display_name, description, policy, sort_order) values
  ('free', 'Free Mode', 'Groq-first, free-tier friendly, no premium judge',
   '{"allowFinalJudge":false,"allowPremiumProviders":false,"maxCompetitors":3,"auditLog":false}'::jsonb, 1),
  ('cheap', 'Cheap Mode', 'Groq-first with limited paid fallback',
   '{"allowFinalJudge":true,"allowPremiumProviders":"limited","maxCompetitors":5,"auditLog":false}'::jsonb, 2),
  ('quality', 'Quality Mode', 'Groq agent runs, Claude/GPT final judge',
   '{"allowFinalJudge":true,"allowPremiumProviders":true,"maxCompetitors":5,"auditLog":false}'::jsonb, 3),
  ('enterprise', 'Enterprise Mode', 'Multi-provider, audit logs, human review',
   '{"allowFinalJudge":true,"allowPremiumProviders":true,"maxCompetitors":5,"auditLog":true}'::jsonb, 4)
on conflict (id) do nothing;

-- ─── Tournament agent profiles ───────────────────────────────────────────

create table if not exists public.tournament_agents (
  id text primary key,
  name text not null,
  role text not null check (role in ('creator', 'competitor', 'judge')),
  primary_provider text not null references public.model_providers (id),
  primary_model text not null,
  fallback_provider text references public.model_providers (id),
  fallback_model text,
  max_tokens integer not null default 1024,
  temperature numeric not null default 0.5,
  cost_policy text not null default 'balanced' check (cost_policy in ('minimize', 'balanced', 'quality_first')),
  latency_policy text not null default 'balanced' check (latency_policy in ('minimize', 'balanced')),
  quality_policy text not null default 'balanced' check (quality_policy in ('minimize', 'balanced', 'maximize')),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.tournament_agents (id, name, role, primary_provider, primary_model, fallback_provider, fallback_model, max_tokens, temperature, cost_policy, latency_policy, quality_policy) values
  ('lean', 'Lean Agent', 'competitor', 'groq', 'llama-3.1-8b-instant', 'groq', 'llama-3.1-8b-instant', 900, 0.2, 'minimize', 'minimize', 'minimize'),
  ('fast', 'Fast Agent', 'competitor', 'groq', 'llama-3.1-8b-instant', 'groq', 'llama-3.1-8b-instant', 800, 0.3, 'minimize', 'minimize', 'balanced'),
  ('rag', 'RAG Agent', 'competitor', 'groq', 'llama-3.3-70b-versatile', 'anthropic', 'claude-haiku-4-5', 1500, 0.4, 'balanced', 'balanced', 'balanced'),
  ('multi-agent', 'Multi-Agent', 'competitor', 'groq', 'llama-3.3-70b-versatile', 'anthropic', 'claude-sonnet-4-6', 2200, 0.5, 'balanced', 'balanced', 'maximize'),
  ('premium', 'Premium Agent', 'competitor', 'anthropic', 'claude-sonnet-4-6', 'groq', 'llama-3.3-70b-versatile', 2500, 0.6, 'quality_first', 'balanced', 'maximize'),
  ('strategy', 'Strategy Creator', 'creator', 'groq', 'llama-3.3-70b-versatile', 'groq', 'llama-3.1-8b-instant', 2048, 0.7, 'balanced', 'balanced', 'balanced'),
  ('technical', 'Technical Creator', 'creator', 'groq', 'llama-3.3-70b-versatile', 'groq', 'llama-3.1-8b-instant', 2048, 0.7, 'balanced', 'balanced', 'balanced'),
  ('growth', 'Growth Creator', 'creator', 'groq', 'llama-3.3-70b-versatile', 'groq', 'llama-3.1-8b-instant', 2048, 0.7, 'balanced', 'balanced', 'balanced')
on conflict (id) do nothing;

-- ─── Agent runs (per tournament round) ───────────────────────────────────

create table if not exists public.tournament_agent_runs (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null,
  round integer not null,
  agent_id text not null references public.tournament_agents (id),
  task_type text not null,
  provider_id text not null references public.model_providers (id),
  model_id text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric not null default 0,
  latency_ms integer not null default 0,
  success boolean not null default true,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tournament_agent_runs_tournament_idx
  on public.tournament_agent_runs (tournament_id, round desc);

create index if not exists tournament_agent_runs_provider_idx
  on public.tournament_agent_runs (provider_id, created_at desc);

-- ─── Evaluations (judge provider tracking) ─────────────────────────────────

create table if not exists public.tournament_evaluations (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null,
  round integer not null,
  agent_id text not null,
  agent_run_id uuid references public.tournament_agent_runs (id),
  judge_stage text not null check (judge_stage in ('preliminary', 'final')),
  judge_provider text not null references public.model_providers (id),
  judge_model text not null,
  total_score numeric not null,
  scores jsonb not null default '{}'::jsonb,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  latency_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tournament_evaluations_tournament_idx
  on public.tournament_evaluations (tournament_id, round desc);

-- ─── Provider usage logs ───────────────────────────────────────────────────

create table if not exists public.provider_usage_logs (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references public.model_providers (id),
  model_id text not null,
  task_type text not null,
  tournament_id text,
  round integer,
  agent_id text,
  requests integer not null default 1,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric not null default 0,
  latency_ms integer not null default 0,
  error_rate numeric not null default 0,
  rate_limit_hit boolean not null default false,
  runtime_mode text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists provider_usage_logs_created_at_idx
  on public.provider_usage_logs (created_at desc);

create index if not exists provider_usage_logs_provider_day_idx
  on public.provider_usage_logs (provider_id, created_at desc);

-- ─── Rate limit events ─────────────────────────────────────────────────────

create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  tournament_id text,
  runtime_mode text,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'blocked')),
  estimate jsonb not null,
  actions_taken jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_created_at_idx
  on public.rate_limit_events (created_at desc);

-- ─── Extend tournament_rounds ──────────────────────────────────────────────

alter table public.tournament_rounds
  add column if not exists runtime_mode text default 'free',
  add column if not exists routing_timeline jsonb default '[]'::jsonb,
  add column if not exists guard_snapshot jsonb default '{}'::jsonb,
  add column if not exists usage_summary jsonb default '{}'::jsonb;

-- ─── RLS (read public, write service role / tournament API) ────────────────

alter table public.model_providers enable row level security;
alter table public.model_configs enable row level security;
alter table public.runtime_modes enable row level security;
alter table public.tournament_agents enable row level security;
alter table public.tournament_agent_runs enable row level security;
alter table public.tournament_evaluations enable row level security;
alter table public.provider_usage_logs enable row level security;
alter table public.rate_limit_events enable row level security;

drop policy if exists "model_providers_public_select" on public.model_providers;
create policy "model_providers_public_select" on public.model_providers for select to anon, authenticated using (true);

drop policy if exists "model_configs_public_select" on public.model_configs;
create policy "model_configs_public_select" on public.model_configs for select to anon, authenticated using (enabled = true);

drop policy if exists "runtime_modes_public_select" on public.runtime_modes;
create policy "runtime_modes_public_select" on public.runtime_modes for select to anon, authenticated using (enabled = true);

drop policy if exists "tournament_agents_public_select" on public.tournament_agents;
create policy "tournament_agents_public_select" on public.tournament_agents for select to anon, authenticated using (true);

drop policy if exists "tournament_agent_runs_public_select" on public.tournament_agent_runs;
create policy "tournament_agent_runs_public_select" on public.tournament_agent_runs for select to anon, authenticated using (true);

drop policy if exists "tournament_evaluations_public_select" on public.tournament_evaluations;
create policy "tournament_evaluations_public_select" on public.tournament_evaluations for select to anon, authenticated using (true);

drop policy if exists "provider_usage_logs_public_insert" on public.provider_usage_logs;
create policy "provider_usage_logs_public_insert" on public.provider_usage_logs for insert to anon, authenticated with check (true);

drop policy if exists "provider_usage_logs_public_select" on public.provider_usage_logs;
create policy "provider_usage_logs_public_select" on public.provider_usage_logs for select to anon, authenticated using (true);

drop policy if exists "rate_limit_events_public_insert" on public.rate_limit_events;
create policy "rate_limit_events_public_insert" on public.rate_limit_events for insert to anon, authenticated with check (true);

drop policy if exists "rate_limit_events_public_select" on public.rate_limit_events;
create policy "rate_limit_events_public_select" on public.rate_limit_events for select to anon, authenticated using (true);
