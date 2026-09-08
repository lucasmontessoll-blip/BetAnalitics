set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table public.cliques_afiliados
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.conversoes_afiliados
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists cliques_afiliados_user_id_idx
  on public.cliques_afiliados(user_id);

create index if not exists conversoes_afiliados_user_id_idx
  on public.conversoes_afiliados(user_id);

drop policy if exists "Inserir cliques publicos" on public.cliques_afiliados;
drop policy if exists "Ler cliques publicos" on public.cliques_afiliados;
drop policy if exists "Inserir conversoes publicas" on public.conversoes_afiliados;
drop policy if exists "Ler conversoes publicas" on public.conversoes_afiliados;

revoke all privileges on table public.cliques_afiliados from anon, authenticated;
revoke all privileges on table public.conversoes_afiliados from anon, authenticated;
grant select, insert, update, delete on table public.cliques_afiliados to service_role;
grant select, insert, update, delete on table public.conversoes_afiliados to service_role;

revoke execute on function public.bet_handle_new_user() from public, anon, authenticated;
grant execute on function public.bet_handle_new_user() to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

create or replace function public.aplicar_vip_pagamento_unico(
  p_payment_id text,
  p_email text,
  p_dias integer default 30
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id text;
begin
  if coalesce(trim(p_payment_id), '') = '' then
    raise exception 'payment_id obrigatorio';
  end if;

  if coalesce(trim(p_email), '') = '' then
    raise exception 'email obrigatorio';
  end if;

  if coalesce(p_dias, 0) <= 0 then
    raise exception 'dias do plano invalido';
  end if;

  update public.pagamentos
     set vip_aplicado = true,
         vip_aplicado_em = now(),
         atualizado_em = now()
   where payment_id = p_payment_id
     and coalesce(vip_aplicado, false) = false
  returning payment_id into v_payment_id;

  if v_payment_id is null then
    return false;
  end if;

  update public.usuarios
     set is_vip = true,
         plano = 'PRO',
         vip_expira = greatest(coalesce(vip_expira, now()), now())
           + make_interval(days => p_dias),
         atualizado_em = now()
   where lower(email) = lower(trim(p_email));

  if not found then
    raise exception 'usuario nao encontrado para o pagamento';
  end if;

  return true;
end;
$$;

revoke execute on function public.aplicar_vip_pagamento_unico(text, text, integer)
  from public, anon, authenticated;
grant execute on function public.aplicar_vip_pagamento_unico(text, text, integer)
  to service_role;

drop policy if exists "usuario le proprio perfil" on public.usuarios;
create policy "usuario le proprio perfil"
  on public.usuarios for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "usuario le proprio pagamento" on public.pagamentos;
create policy "usuario le proprio pagamento"
  on public.pagamentos for select to authenticated
  using (lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', '')));

drop policy if exists "analises_ia_select_proprio" on public.analises_ia;
create policy "analises_ia_select_proprio"
  on public.analises_ia for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "analises_ia_insert_proprio" on public.analises_ia;
create policy "analises_ia_insert_proprio"
  on public.analises_ia for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "analises_ia_update_proprio" on public.analises_ia;
create policy "analises_ia_update_proprio"
  on public.analises_ia for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "analises_ia_delete_proprio" on public.analises_ia;
create policy "analises_ia_delete_proprio"
  on public.analises_ia for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "push_tokens_select_proprio" on public.push_tokens;
create policy "push_tokens_select_proprio"
  on public.push_tokens for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "push_tokens_delete_proprio" on public.push_tokens;
create policy "push_tokens_delete_proprio"
  on public.push_tokens for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Public read jogos" on public.jogos_ao_vivo;
drop index if exists public.pagamentos_payment_id_unique;

notify pgrst, 'reload schema';
