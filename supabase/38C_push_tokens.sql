create extension if not exists pgcrypto;

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null default 'android',
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  ultimo_registro_em timestamptz not null default now()
);

alter table public.push_tokens
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists token text,
  add column if not exists platform text default 'android',
  add column if not exists ativo boolean default true,
  add column if not exists criado_em timestamptz default now(),
  add column if not exists atualizado_em timestamptz default now(),
  add column if not exists ultimo_registro_em timestamptz default now();

alter table public.push_tokens
  alter column user_id set not null,
  alter column token set not null,
  alter column platform set not null,
  alter column ativo set not null,
  alter column criado_em set not null,
  alter column atualizado_em set not null,
  alter column ultimo_registro_em set not null;

create unique index if not exists push_tokens_token_uidx
  on public.push_tokens(token);

create index if not exists push_tokens_user_ativo_idx
  on public.push_tokens(user_id, ativo);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'push_tokens_platform_check'
      and conrelid = 'public.push_tokens'::regclass
  ) then
    alter table public.push_tokens
      add constraint push_tokens_platform_check
      check (platform in ('android', 'ios', 'web'));
  end if;
end $$;

alter table public.push_tokens enable row level security;

revoke all on table public.push_tokens from anon;
revoke all on table public.push_tokens from authenticated;
grant all on table public.push_tokens to service_role;
