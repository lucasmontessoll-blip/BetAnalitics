begin;

create table if not exists public.data_quality_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('match','team','player','league','app')),
  entity_id text,
  category text not null check (category in ('incorrect','outdated','missing','bug','other')),
  description text not null check (char_length(description) between 5 and 500),
  app_version text,
  platform text not null check (platform in ('web','android')),
  status text not null default 'open' check (status in ('open','reviewing','resolved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.data_quality_reports enable row level security;
revoke all on public.data_quality_reports from public, anon, authenticated;
grant select on public.data_quality_reports to authenticated;
grant all on public.data_quality_reports to service_role;

drop policy if exists r58_reports_select_own on public.data_quality_reports;
create policy r58_reports_select_own on public.data_quality_reports
for select to authenticated using ((select auth.uid()) = user_id);

create index if not exists data_quality_reports_status_created_idx
on public.data_quality_reports(status, created_at desc);
create index if not exists data_quality_reports_user_idx
on public.data_quality_reports(user_id, created_at desc);

comment on table public.data_quality_reports is
'R58: relatos autenticados de qualidade, inseridos somente pelo backend e visiveis ao proprio usuario.';

commit;
