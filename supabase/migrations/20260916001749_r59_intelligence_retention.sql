begin;
create table if not exists public.product_feedback (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (char_length(feature) between 1 and 60), rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 500), platform text not null check (platform in ('web','android')),
  created_at timestamptz not null default now()
);
alter table public.product_feedback enable row level security;
revoke all on public.product_feedback from public, anon, authenticated;
grant select on public.product_feedback to authenticated;
grant all on public.product_feedback to service_role;
create policy r59_feedback_select_own on public.product_feedback for select to authenticated using ((select auth.uid()) = user_id);
create index if not exists product_feedback_user_created_idx on public.product_feedback(user_id, created_at desc);

create or replace function public.bet_admin_retention_r59() returns jsonb language sql stable security invoker set search_path = public as $$
  with activity as (
    select user_id, occurred_at::date d from analytics_events where user_id is not null and occurred_at >= now() - interval '30 days' group by 1,2
  ), summary as (
    select count(distinct user_id) filter (where d >= current_date) dau,
           count(distinct user_id) filter (where d >= current_date - 6) wau,
           count(distinct user_id) mau from activity
  ) select jsonb_build_object('dau',dau,'wau',wau,'mau',mau,'stickiness',case when mau=0 then 0 else round(100.0*dau/mau,2) end,
    'feedback_average',(select round(avg(rating),2) from product_feedback),'feedback_total',(select count(*) from product_feedback)) from summary;
$$;
revoke all on function public.bet_admin_retention_r59() from public, anon, authenticated;
grant execute on function public.bet_admin_retention_r59() to service_role;
commit;
