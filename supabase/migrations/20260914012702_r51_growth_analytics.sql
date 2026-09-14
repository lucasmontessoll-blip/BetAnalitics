begin;

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  user_id uuid null references auth.users(id) on delete set null,
  anonymous_id uuid not null,
  session_id uuid not null,
  event_name text not null check (event_name in (
    'page_view','cta_click','signup_started','feature_free_used',
    'feature_pro_used','subscription_cancelled'
  )),
  platform text not null default 'web' check (platform in ('web','android')),
  utm_source text null check (char_length(utm_source) <= 80),
  utm_medium text null check (char_length(utm_medium) <= 80),
  utm_campaign text null check (char_length(utm_campaign) <= 100),
  utm_content text null check (char_length(utm_content) <= 100),
  utm_term text null check (char_length(utm_term) <= 100),
  properties jsonb not null default '{}'::jsonb check (
    jsonb_typeof(properties) = 'object' and pg_column_size(properties) <= 4096
  )
);

create table if not exists public.analytics_campaign_costs (
  id bigint generated always as identity primary key,
  cost_date date not null,
  source text not null check (char_length(source) between 1 and 80),
  campaign text not null check (char_length(campaign) between 1 and 100),
  amount numeric(12,2) not null check (amount >= 0 and amount <= 10000000),
  notes text null check (char_length(notes) <= 240),
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
alter table public.analytics_campaign_costs enable row level security;
revoke all on public.analytics_events from public, anon, authenticated;
revoke all on public.analytics_campaign_costs from public, anon, authenticated;
grant select, insert on public.analytics_events to service_role;
grant select, insert, update, delete on public.analytics_campaign_costs to service_role;
grant usage, select on sequence public.analytics_events_id_seq to service_role;
grant usage, select on sequence public.analytics_campaign_costs_id_seq to service_role;

create index if not exists analytics_events_occurred_at_idx on public.analytics_events (occurred_at desc);
create index if not exists analytics_events_name_time_idx on public.analytics_events (event_name, occurred_at desc);
create index if not exists analytics_events_user_time_idx on public.analytics_events (user_id, occurred_at desc) where user_id is not null;
create index if not exists analytics_events_campaign_time_idx on public.analytics_events (utm_campaign, occurred_at desc) where utm_campaign is not null;
create index if not exists analytics_campaign_costs_date_idx on public.analytics_campaign_costs (cost_date desc);

create or replace function public.bet_admin_growth_dashboard_r51(
  p_from timestamptz,
  p_to timestamptz
) returns jsonb
language sql
stable
security invoker
set search_path = ''
as $function$
  with
  bounds as (
    select p_from as start_at, p_to as end_at
    where p_from is not null and p_to is not null and p_from <= p_to
      and p_to - p_from <= interval '366 days'
  ),
  days as (
    select generate_series(date_trunc('day', start_at), date_trunc('day', end_at), interval '1 day') as day
    from bounds
  ),
  events as (
    select e.* from public.analytics_events e, bounds b
    where e.occurred_at >= b.start_at and e.occurred_at <= b.end_at
  ),
  users_period as (
    select u.* from public.usuarios u, bounds b
    where u.criado_em >= b.start_at and u.criado_em <= b.end_at
  ),
  payments_period as (
    select p.* from public.pagamentos p, bounds b
    where p.criado_em >= b.start_at and p.criado_em <= b.end_at
  ),
  approved as (
    select p.* from payments_period p where lower(p.status) in ('approved','processed')
  ),
  first_approved as (
    select lower(email) as email, min(criado_em) as first_at
    from public.pagamentos
    where email is not null and lower(status) in ('approved','processed')
    group by lower(email)
  ),
  metrics as (
    select jsonb_build_object(
      'views', (select count(*) from events where event_name = 'page_view'),
      'unique_visitors', (select count(distinct anonymous_id) from events where event_name = 'page_view'),
      'clicks', (select count(*) from events where event_name = 'cta_click'),
      'registrations', (select count(*) from users_period),
      'free_users', (select count(distinct e.user_id) from events e join public.usuarios u on u.user_id=e.user_id where e.event_name='feature_free_used' and not (u.is_vip and u.vip_expira > now())),
      'subscription_starts', (select count(*) from payments_period),
      'new_subscribers', (select count(*) from approved a join first_approved f on lower(a.email)=f.email and a.criado_em=f.first_at),
      'renewals', (select count(*) from approved a join first_approved f on lower(a.email)=f.email where a.criado_em > f.first_at),
      'cancellations', (select count(*) from events where event_name='subscription_cancelled') +
        (select count(*) from payments_period where lower(status) in ('cancelled','canceled','refunded','charged_back')),
      'approved_payments', (select count(*) from approved),
      'revenue', coalesce((select sum(valor) from approved), 0),
      'campaign_cost', coalesce((select sum(c.amount) from public.analytics_campaign_costs c, bounds b where c.cost_date between b.start_at::date and b.end_at::date), 0)
    ) as value
  ),
  timeline as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'date', to_char(d.day, 'YYYY-MM-DD'),
      'views', (select count(*) from events e where e.event_name='page_view' and e.occurred_at >= d.day and e.occurred_at < d.day + interval '1 day'),
      'clicks', (select count(*) from events e where e.event_name='cta_click' and e.occurred_at >= d.day and e.occurred_at < d.day + interval '1 day'),
      'registrations', (select count(*) from users_period u where u.criado_em >= d.day and u.criado_em < d.day + interval '1 day'),
      'subscriptions', (select count(*) from approved p where p.criado_em >= d.day and p.criado_em < d.day + interval '1 day'),
      'revenue', coalesce((select sum(valor) from approved p where p.criado_em >= d.day and p.criado_em < d.day + interval '1 day'), 0)
    ) order by d.day), '[]'::jsonb) value from days d
  ),
  sources as (
    select coalesce(jsonb_agg(row_data order by total desc), '[]'::jsonb) value from (
      select jsonb_build_object('name', coalesce(utm_source,'direto'), 'views', count(*)) row_data, count(*) total
      from events where event_name='page_view' group by coalesce(utm_source,'direto') limit 10
    ) ranked
  ),
  recent as (
    select coalesce(jsonb_agg(row_data order by occurred_at desc), '[]'::jsonb) value from (
      select occurred_at, jsonb_build_object(
        'id', id, 'occurred_at', occurred_at, 'event_name', event_name,
        'platform', platform, 'source', coalesce(utm_source,'direto'),
        'campaign', coalesce(utm_campaign,'sem campanha')
      ) row_data from events order by occurred_at desc limit 50
    ) last_events
  ),
  costs as (
    select coalesce(jsonb_agg(to_jsonb(c) order by c.cost_date desc, c.id desc), '[]'::jsonb) value
    from (select id,cost_date,source,campaign,amount,notes,created_at from public.analytics_campaign_costs, bounds b where cost_date between b.start_at::date and b.end_at::date limit 100) c
  )
  select jsonb_build_object(
    'metrics', metrics.value || jsonb_build_object(
      'cac', case when (metrics.value->>'new_subscribers')::numeric > 0 then round((metrics.value->>'campaign_cost')::numeric / (metrics.value->>'new_subscribers')::numeric, 2) else null end,
      'click_rate', case when (metrics.value->>'views')::numeric > 0 then round(100 * (metrics.value->>'clicks')::numeric / (metrics.value->>'views')::numeric, 2) else 0 end,
      'registration_rate', case when (metrics.value->>'clicks')::numeric > 0 then round(100 * (metrics.value->>'registrations')::numeric / (metrics.value->>'clicks')::numeric, 2) else 0 end,
      'paid_rate', case when (metrics.value->>'registrations')::numeric > 0 then round(100 * (metrics.value->>'new_subscribers')::numeric / (metrics.value->>'registrations')::numeric, 2) else 0 end
    ),
    'timeline', timeline.value, 'sources', sources.value,
    'recent_events', recent.value, 'costs', costs.value
  ) from metrics, timeline, sources, recent, costs;
$function$;

revoke all on function public.bet_admin_growth_dashboard_r51(timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.bet_admin_growth_dashboard_r51(timestamptz,timestamptz) to service_role;

comment on table public.analytics_events is 'R51: metricas de produto sem email, IP, token ou texto livre.';
comment on function public.bet_admin_growth_dashboard_r51(timestamptz,timestamptz) is 'R51: agregado administrativo executavel somente pelo backend service_role.';

commit;
