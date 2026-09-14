begin;

create policy "r51_no_direct_event_access"
on public.analytics_events for all to anon, authenticated
using (false) with check (false);

create policy "r51_no_direct_cost_access"
on public.analytics_campaign_costs for all to anon, authenticated
using (false) with check (false);

create index if not exists analytics_campaign_costs_created_by_idx
on public.analytics_campaign_costs (created_by)
where created_by is not null;

commit;
