set local lock_timeout = '5s';
set local statement_timeout = '30s';

alter table public.cliques_afiliados
  alter column user_id set default auth.uid();

grant insert on table public.cliques_afiliados to authenticated;

drop policy if exists "cliques_afiliados_insert_proprio"
  on public.cliques_afiliados;

create policy "cliques_afiliados_insert_proprio"
  on public.cliques_afiliados
  for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
  );

notify pgrst, 'reload schema';
