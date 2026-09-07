-- Aly Advisory Lab — production foundation
create extension if not exists pgcrypto;

create table if not exists public.advisory_cases (
  id uuid primary key default gen_random_uuid(),
  case_id text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new',
  name text not null,
  email text not null,
  role text not null,
  country text,
  company text,
  company_size text,
  industry text,
  topic text not null,
  problem text not null,
  impact jsonb not null default '[]'::jsonb,
  outcome text not null,
  urgency text,
  evidence text,
  ai_summary text,
  ai_category text,
  ai_root_causes jsonb not null default '[]'::jsonb,
  ai_missing_evidence jsonb not null default '[]'::jsonb,
  ai_questions jsonb not null default '[]'::jsonb,
  ai_diagnostic text,
  aly_diagnosis text,
  aly_recommendation text,
  aly_action_plan text,
  aly_kpis text,
  client_response text,
  response_sent_at timestamptz,
  closed_at timestamptz
);

create index if not exists advisory_cases_status_idx on public.advisory_cases(status);
create index if not exists advisory_cases_topic_idx on public.advisory_cases(topic);
create index if not exists advisory_cases_created_idx on public.advisory_cases(created_at desc);

alter table public.advisory_cases enable row level security;

-- Public clients must never be allowed to read or update cases.
revoke all on table public.advisory_cases from anon, authenticated;
-- The server-side service key is used by /api/advisory-submit.
grant all on table public.advisory_cases to service_role;

-- Admin users are authenticated through Supabase Auth. Add user metadata:
-- { "role": "advisory_admin" }
create policy "advisory admins can read cases"
on public.advisory_cases for select
to authenticated
using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'advisory_admin');

create policy "advisory admins can update cases"
on public.advisory_cases for update
to authenticated
using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'advisory_admin')
with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'advisory_admin');

create or replace function public.set_advisory_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists advisory_cases_updated_at on public.advisory_cases;
create trigger advisory_cases_updated_at before update on public.advisory_cases for each row execute function public.set_advisory_updated_at();
