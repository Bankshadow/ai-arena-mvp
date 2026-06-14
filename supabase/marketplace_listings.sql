-- DEPRECATED — applied via migration 20250103000000_marketplace_listings.sql
-- Use: npm run supabase:push

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
