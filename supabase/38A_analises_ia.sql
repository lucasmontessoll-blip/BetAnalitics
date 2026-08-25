create extension if not exists pgcrypto;

create table if not exists public.analises_ia (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  jogo_id text,
  fixture_id bigint,
  jogo text,
  casa text,
  fora text,
  liga text,
  mercado text,
  confianca numeric(6,2),
  odd numeric(10,4),
  prob_casa numeric(6,2),
  prob_empate numeric(6,2),
  prob_fora numeric(6,2),
  fonte_confianca text,
  fonte_odds text,
  status text not null default 'pendente',
  resultado_casa integer,
  resultado_fora integer,
  partida_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.analises_ia
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.analises_ia
  add column if not exists jogo_id text;
alter table public.analises_ia
  add column if not exists fixture_id bigint;
alter table public.analises_ia
  add column if not exists jogo text;
alter table public.analises_ia
  add column if not exists casa text;
alter table public.analises_ia
  add column if not exists fora text;
alter table public.analises_ia
  add column if not exists liga text;
alter table public.analises_ia
  add column if not exists mercado text;
alter table public.analises_ia
  add column if not exists confianca numeric(6,2);
alter table public.analises_ia
  add column if not exists odd numeric(10,4);
alter table public.analises_ia
  add column if not exists prob_casa numeric(6,2);
alter table public.analises_ia
  add column if not exists prob_empate numeric(6,2);
alter table public.analises_ia
  add column if not exists prob_fora numeric(6,2);
alter table public.analises_ia
  add column if not exists fonte_confianca text;
alter table public.analises_ia
  add column if not exists fonte_odds text;
alter table public.analises_ia
  add column if not exists status text not null default 'pendente';
alter table public.analises_ia
  add column if not exists resultado_casa integer;
alter table public.analises_ia
  add column if not exists resultado_fora integer;
alter table public.analises_ia
  add column if not exists partida_em timestamptz;
alter table public.analises_ia
  add column if not exists criado_em timestamptz not null default now();
alter table public.analises_ia
  add column if not exists atualizado_em timestamptz not null default now();

create unique index if not exists analises_ia_user_jogo_uidx
  on public.analises_ia (user_id, jogo_id)
  where user_id is not null and jogo_id is not null;

create index if not exists analises_ia_user_criado_idx
  on public.analises_ia (user_id, criado_em desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'analises_ia_status_check'
      and conrelid = 'public.analises_ia'::regclass
  ) then
    alter table public.analises_ia
      add constraint analises_ia_status_check
      check (status in ('pendente', 'green', 'red'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'analises_ia_confianca_check'
      and conrelid = 'public.analises_ia'::regclass
  ) then
    alter table public.analises_ia
      add constraint analises_ia_confianca_check
      check (
        confianca is null
        or (confianca >= 0 and confianca <= 100)
      );
  end if;
end $$;

alter table public.analises_ia enable row level security;

drop policy if exists "analises_ia_select_proprio" on public.analises_ia;
drop policy if exists "analises_ia_insert_proprio" on public.analises_ia;
drop policy if exists "analises_ia_update_proprio" on public.analises_ia;
drop policy if exists "analises_ia_delete_proprio" on public.analises_ia;

create policy "analises_ia_select_proprio"
on public.analises_ia
for select
to authenticated
using (auth.uid() = user_id);

create policy "analises_ia_insert_proprio"
on public.analises_ia
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "analises_ia_update_proprio"
on public.analises_ia
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "analises_ia_delete_proprio"
on public.analises_ia
for delete
to authenticated
using (auth.uid() = user_id);

revoke all on public.analises_ia from anon;

grant select, insert, update, delete
on public.analises_ia
to authenticated;
