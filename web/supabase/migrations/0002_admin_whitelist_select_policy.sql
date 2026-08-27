-- Fixes an over-broad SELECT policy on admin_whitelist.
--
-- The original policy used `using (true)`, which let ANY authenticated
-- user (not just admins) read the entire table via the public anon key +
-- their own session -- e.g. `supabase.from('admin_whitelist').select('*')`
-- from the browser console -- exposing every admin's name and email to
-- anyone who completes Google sign-in, whitelisted or not.
--
-- This replaces it with: a signed-in user may always check whether their
-- OWN email is on the list (needed at login time), and an already-whitelisted
-- admin may additionally see the full list (needed by the Team page's
-- listAdmins()). A non-admin can no longer see other admins' rows.
--
-- Run this once in the Supabase SQL Editor against your existing project.

drop policy if exists "admin_whitelist_select_authenticated" on admin_whitelist;

create policy "admin_whitelist_select_self_or_admin"
  on admin_whitelist for select
  to authenticated
  using (
    email = auth.jwt() ->> 'email'
    or exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email')
  );
