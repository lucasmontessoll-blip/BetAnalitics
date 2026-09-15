begin;

create table if not exists public.user_product_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{"seguidos":[],"alertas":{},"responsavel":{}}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint user_product_preferences_object check (
    jsonb_typeof(preferences) = 'object' and pg_column_size(preferences) <= 32768
  )
);

alter table public.user_product_preferences enable row level security;
revoke all on public.user_product_preferences from public, anon;
grant select, insert, update, delete on public.user_product_preferences to authenticated;
grant all on public.user_product_preferences to service_role;

drop policy if exists r53_preferences_select_own on public.user_product_preferences;
create policy r53_preferences_select_own on public.user_product_preferences
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists r53_preferences_insert_own on public.user_product_preferences;
create policy r53_preferences_insert_own on public.user_product_preferences
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists r53_preferences_update_own on public.user_product_preferences;
create policy r53_preferences_update_own on public.user_product_preferences
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists r53_preferences_delete_own on public.user_product_preferences;
create policy r53_preferences_delete_own on public.user_product_preferences
for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists user_product_preferences_updated_idx
on public.user_product_preferences(updated_at desc);

comment on table public.user_product_preferences is
'R53-R56: preferencias, favoritos e controles de uso do proprio usuario; protegidos por RLS de propriedade.';

commit;
