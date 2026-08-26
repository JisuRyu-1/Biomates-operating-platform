-- Admin login whitelist. Anyone can sign in with Google (that's just identity
-- verification); this table is the actual authorization boundary — only
-- emails listed here are treated as admins by the app (see lib/auth-context.tsx).
--
-- Run this once in the Supabase SQL Editor (or via `supabase db push`) after
-- creating the project. Then seed your own email as the first admin using
-- the INSERT at the bottom — do that in the SQL Editor too, not by
-- committing a real email/name into this file.

create extension if not exists pgcrypto;

create table if not exists admin_whitelist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

alter table admin_whitelist enable row level security;

-- Any signed-in user can read the list — needed so a freshly-logged-in
-- Google account can check whether *their own* email is on it.
create policy "admin_whitelist_select_authenticated"
  on admin_whitelist for select
  to authenticated
  using (true);

-- Only existing admins can add or remove admins (bootstrapped by the manual
-- INSERT below, which runs as the SQL Editor's superuser role and bypasses RLS).
create policy "admin_whitelist_insert_by_admins"
  on admin_whitelist for insert
  to authenticated
  with check (exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email'));

create policy "admin_whitelist_delete_by_admins"
  on admin_whitelist for delete
  to authenticated
  using (exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email'));

-- Seed the first admin (uncomment and fill in your own email/name, then run
-- just this statement in the SQL Editor):
-- insert into admin_whitelist (email, name) values ('you@gmail.com', '이름');
