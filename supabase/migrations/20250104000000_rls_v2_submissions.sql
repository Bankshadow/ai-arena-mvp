-- AI ARENA: RLS v2 — tighten submissions (MVP12)
-- Admin approve/reject uses SUPABASE_SERVICE_ROLE_KEY via /api/admin/*

drop policy if exists "submissions_public_update" on public.submissions;

drop policy if exists "submissions_public_select" on public.submissions;
create policy "submissions_public_select"
  on public.submissions for select
  to anon, authenticated
  using (status = 'approved');
