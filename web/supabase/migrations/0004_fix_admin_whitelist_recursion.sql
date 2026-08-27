-- Fixes "infinite recursion detected in policy for relation admin_whitelist"
-- (Postgres 42P17). 0002's SELECT policy (and 0001's INSERT/DELETE policies,
-- and 0003's events/registrations policies) all check admin membership with
-- a subquery like `exists (select 1 from admin_whitelist w where ...)`.
-- Once admin_whitelist's own SELECT policy also contains that subquery,
-- evaluating it requires re-evaluating the SELECT policy, forever.
--
-- Standard fix: a SECURITY DEFINER helper function, which runs with the
-- function owner's privileges and so bypasses RLS on its internal query,
-- breaking the recursion. All admin-membership checks now go through this
-- function instead of a raw self-referencing subquery.
--
-- Run this once in the Supabase SQL Editor.

create or replace function is_admin() returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email');
$$;

-- admin_whitelist
drop policy if exists "admin_whitelist_select_self_or_admin" on admin_whitelist;
create policy "admin_whitelist_select_self_or_admin"
  on admin_whitelist for select
  to authenticated
  using (email = auth.jwt() ->> 'email' or is_admin());

drop policy if exists "admin_whitelist_insert_by_admins" on admin_whitelist;
create policy "admin_whitelist_insert_by_admins"
  on admin_whitelist for insert
  to authenticated
  with check (is_admin());

drop policy if exists "admin_whitelist_delete_by_admins" on admin_whitelist;
create policy "admin_whitelist_delete_by_admins"
  on admin_whitelist for delete
  to authenticated
  using (is_admin());

-- events
drop policy if exists "events_select_published_or_admin" on events;
create policy "events_select_published_or_admin"
  on events for select
  to anon, authenticated
  using (published = true or is_admin());

drop policy if exists "events_write_by_admin" on events;
create policy "events_write_by_admin"
  on events for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- registrations
drop policy if exists "registrations_select_by_admin" on registrations;
create policy "registrations_select_by_admin"
  on registrations for select
  to authenticated
  using (is_admin());

drop policy if exists "registrations_update_by_admin" on registrations;
create policy "registrations_update_by_admin"
  on registrations for update
  to authenticated
  using (is_admin())
  with check (is_admin());
