-- DEPRECATED — applied via migration 20250104000000_rls_v2_submissions.sql
-- Use: npm run supabase:push

-- ─── Submissions: no public updates ────────────────────────────────────────

drop policy if exists "submissions_public_update" on public.submissions;

drop policy if exists "submissions_public_select" on public.submissions;
create policy "submissions_public_select"
  on public.submissions for select
  to anon, authenticated
  using (status = 'approved');

-- Public can still insert (submit form). Admin approve/reject uses service role.
