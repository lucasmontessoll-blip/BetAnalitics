-- R48: executar ANTES do backend, em janela controlada. Nenhum dado apagado aqui.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

do $$
begin
  if exists (select 1 from public.usuarios p left join auth.users u on u.id=p.user_id
             where p.user_id is null or u.id is null) then
    raise exception 'R48 bloqueado: reconciliar perfis sem UUID Auth antes do deploy';
  end if;
end $$;

revoke truncate, references, trigger on public.usuarios, public.pagamentos,
  public.jogos_ao_vivo, public.historico_apostas, public.analises_ia from anon, authenticated;
revoke insert, update, delete on public.jogos_ao_vivo from anon, authenticated;
revoke all on public.historico_apostas from anon, authenticated;
-- Escritas de analises passam pelo backend com verificacao PRO e UUID.
revoke insert, update, delete on public.analises_ia from anon, authenticated;

create or replace function public.bet_session_active_r48(p_user_id uuid, p_session_id uuid)
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return exists (
    select 1 from auth.sessions s join auth.users u on u.id=s.user_id
    where s.id=p_session_id and s.user_id=p_user_id
      and (s.not_after is null or s.not_after > now())
      and (u.banned_until is null or u.banned_until <= now())
  );
end $$;
revoke all on function public.bet_session_active_r48(uuid,uuid) from public, anon, authenticated;
grant execute on function public.bet_session_active_r48(uuid,uuid) to service_role;

-- Atomiza a limpeza de dados da aplicacao. Auth permanece gerenciado pela API oficial.
create or replace function public.bet_delete_app_data_r48(p_user_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id is null then raise exception 'missing user'; end if;
  perform 1 from public.usuarios where user_id=p_user_id for update;
  if exists(select 1 from public.usuarios where user_id=p_user_id and is_admin is true) then
    raise exception 'admin protected' using errcode='42501';
  end if;
  delete from public.analises_ia where user_id=p_user_id;
  delete from public.push_tokens where user_id=p_user_id;
  delete from public.cliques_afiliados where user_id=p_user_id;
  delete from public.conversoes_afiliados where user_id=p_user_id;
  delete from public.usuarios where user_id=p_user_id;
  return true;
end $$;
revoke all on function public.bet_delete_app_data_r48(uuid) from public, anon, authenticated;
grant execute on function public.bet_delete_app_data_r48(uuid) to service_role;

do $$
begin
  if exists(select 1 from information_schema.role_table_grants
     where table_schema='public' and table_name in
       ('usuarios','pagamentos','jogos_ao_vivo','historico_apostas','analises_ia')
     and grantee in ('anon','authenticated') and privilege_type in ('TRUNCATE','TRIGGER','REFERENCES')) then
    raise exception 'R48: privilegios perigosos permanecem';
  end if;
  if has_function_privilege('anon','public.bet_session_active_r48(uuid,uuid)','execute')
     or has_function_privilege('authenticated','public.bet_session_active_r48(uuid,uuid)','execute')
     or has_function_privilege('anon','public.bet_delete_app_data_r48(uuid)','execute')
     or has_function_privilege('authenticated','public.bet_delete_app_data_r48(uuid)','execute') then
    raise exception 'R48: RPC privilegiada exposta';
  end if;
end $$;
notify pgrst, 'reload schema';
commit;
