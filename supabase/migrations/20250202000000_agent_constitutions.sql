-- AI ARENA: Agent Constitution system (T-MVP3 — schema ready, mock-first app layer)

create table if not exists public.agent_constitutions (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  agent_name text not null,
  agent_type text not null,
  current_version text not null default 'v1.0',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_constitutions_agent_type_check check (
    agent_type in ('competitor', 'creator', 'judge', 'orchestrator')
  )
);

create index if not exists agent_constitutions_agent_id_idx
  on public.agent_constitutions (agent_id);

create table if not exists public.agent_constitution_versions (
  id uuid primary key default gen_random_uuid(),
  constitution_id uuid not null references public.agent_constitutions (id) on delete cascade,
  version text not null,
  role_definition text not null default '',
  primary_goal text not null default '',
  secondary_goal text not null default '',
  behavior_rules jsonb not null default '[]'::jsonb,
  tool_usage_policy text not null default '',
  model_provider_policy text not null default '',
  cost_policy text not null default '',
  token_policy text not null default '',
  memory_policy text not null default '',
  risk_policy text not null default '',
  refusal_or_skip_rules jsonb not null default '[]'::jsonb,
  output_format_contract text not null default '',
  self_review_protocol text not null default '',
  evaluation_preference text not null default '',
  marketplace_positioning text not null default '',
  constitution_score numeric not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (constitution_id, version)
);

create index if not exists agent_constitution_versions_constitution_idx
  on public.agent_constitution_versions (constitution_id, version);

create table if not exists public.prompt_diffs (
  id uuid primary key default gen_random_uuid(),
  constitution_id uuid not null references public.agent_constitutions (id) on delete cascade,
  from_version text not null,
  to_version text not null,
  changes jsonb not null default '[]'::jsonb,
  summary text not null default '',
  computed_at timestamptz not null default now()
);

create index if not exists prompt_diffs_constitution_idx
  on public.prompt_diffs (constitution_id, computed_at desc);

create table if not exists public.constitution_battles (
  id uuid primary key default gen_random_uuid(),
  battle_type text not null default 'system_prompt_battle',
  title text not null,
  agent_id text not null,
  agent_name text not null,
  challenge_title text not null,
  challenge_brief text not null default '',
  version_ids jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint constitution_battles_status_check check (
    status in ('pending', 'running', 'complete')
  ),
  constraint constitution_battles_type_check check (
    battle_type in ('system_prompt_battle')
  )
);

create index if not exists constitution_battles_agent_idx
  on public.constitution_battles (agent_id, created_at desc);

create table if not exists public.constitution_battle_results (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.constitution_battles (id) on delete cascade,
  constitution_id uuid references public.agent_constitutions (id) on delete set null,
  version_id uuid references public.agent_constitution_versions (id) on delete set null,
  version text not null,
  agent_name text not null,
  total_score numeric not null,
  quality_score numeric not null,
  efficiency_score numeric not null,
  constitution_score numeric not null,
  tokens_out integer not null default 0,
  cost_usd numeric not null default 0,
  rank integer not null,
  prompt_strategy_summary text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists constitution_battle_results_battle_idx
  on public.constitution_battle_results (battle_id, rank);

-- Extend tournament_rounds payload convention (no column change — document in payload JSON)
comment on table public.agent_constitutions is
  'Agent operating specifications — role, policies, output contract. App uses mock store until wired.';

alter table public.agent_constitutions enable row level security;
alter table public.agent_constitution_versions enable row level security;
alter table public.prompt_diffs enable row level security;
alter table public.constitution_battles enable row level security;
alter table public.constitution_battle_results enable row level security;

drop policy if exists "agent_constitutions_public_select" on public.agent_constitutions;
create policy "agent_constitutions_public_select"
  on public.agent_constitutions for select to anon, authenticated using (true);

drop policy if exists "agent_constitution_versions_public_select" on public.agent_constitution_versions;
create policy "agent_constitution_versions_public_select"
  on public.agent_constitution_versions for select to anon, authenticated using (true);

drop policy if exists "prompt_diffs_public_select" on public.prompt_diffs;
create policy "prompt_diffs_public_select"
  on public.prompt_diffs for select to anon, authenticated using (true);

drop policy if exists "constitution_battles_public_select" on public.constitution_battles;
create policy "constitution_battles_public_select"
  on public.constitution_battles for select to anon, authenticated using (true);

drop policy if exists "constitution_battle_results_public_select" on public.constitution_battle_results;
create policy "constitution_battle_results_public_select"
  on public.constitution_battle_results for select to anon, authenticated using (true);
