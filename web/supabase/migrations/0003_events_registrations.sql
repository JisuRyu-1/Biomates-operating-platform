-- Moves Events/Registrations off browser-only localStorage and into a real,
-- shared Postgres table. Until now, admin_whitelist was the only real table
-- in this project -- events and participant registrations only ever lived
-- in each visitor's own browser, meaning real public registrations were
-- never actually received by anyone on the Biomates team.
--
-- Run this once in the Supabase SQL Editor against your existing project.

create table if not exists events (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  status text not null,
  date text not null,
  time text not null,
  venue text not null,
  map_url text,
  capacity integer not null default 0,
  fee integer not null default 0,
  registration_start text not null,
  registration_end text not null,
  audience text not null default '',
  program jsonb not null default '[]',
  speakers jsonb not null default '[]',
  prep jsonb not null default '[]',
  refund_policy text not null default '',
  contact text not null default '',
  bank_info jsonb,
  resources jsonb not null default '[]',
  published boolean not null default true,
  survey_form_url text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references events (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  organization text not null default '',
  purpose text not null default '',
  marketing_opt_in boolean not null default false,
  registration_status text not null,
  payment_status text not null,
  registered_at timestamptz not null default now(),
  checkin_at timestamptz,
  depositor_name text not null default '',
  note text not null default '',
  sms_log jsonb not null default '[]',
  email_log jsonb not null default '[]'
);

-- Belt-and-suspenders duplicate protection at the DB layer, on top of the
-- application-level check in /api/register. Case-insensitive on email.
create unique index if not exists registrations_active_email_per_event
  on registrations (event_id, lower(email))
  where registration_status <> 'CANCELLED';

-- Public, PII-free aggregate for capacity displays on the participant-facing
-- pages (EventCard, event detail) -- exposes counts only, never names/emails.
create or replace view registration_counts as
  select event_id, count(*) filter (where registration_status <> 'CANCELLED') as active_count
  from registrations
  group by event_id;

grant select on registration_counts to anon, authenticated;

alter table events enable row level security;
alter table registrations enable row level security;

-- Anyone can see published events; admins can see everything (including
-- unpublished ones, needed for the Admin ・ Events list).
create policy "events_select_published_or_admin"
  on events for select
  to anon, authenticated
  using (
    published = true
    or exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email')
  );

create policy "events_write_by_admin"
  on events for all
  to authenticated
  using (exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email'));

-- Registrations contain PII (name/email/phone). Only admins may read or
-- update them directly. There is deliberately NO insert policy for
-- anon/authenticated -- public registration only happens through
-- POST /api/register, which uses the service-role key server-side and
-- enforces the duplicate check + initial status logic in application code.
create policy "registrations_select_by_admin"
  on registrations for select
  to authenticated
  using (exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email'));

create policy "registrations_update_by_admin"
  on registrations for update
  to authenticated
  using (exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from admin_whitelist w where w.email = auth.jwt() ->> 'email'));
