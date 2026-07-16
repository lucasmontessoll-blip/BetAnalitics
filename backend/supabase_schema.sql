create extension if not exists pgcrypto;

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  cpf text,
  senha_hash text not null,
  is_vip boolean not null default false,
  is_admin boolean not null default false,
  vip_expira_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pagamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  mp_payment_id text unique,
  status text not null default 'pending',
  valor numeric(10,2) not null default 0,
  metodo text not null default 'pix',
  plano text not null default 'mensal',
  qr_code text,
  qr_code_base64 text,
  ticket_url text,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists favoritos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tipo text not null default 'jogo',
  item_id text not null,
  titulo text,
  dados jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(usuario_id, tipo, item_id)
);

create table if not exists historico_assertividade (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  jogo_id text,
  jogo text,
  mercado text,
  confianca_ia numeric(5,2) default 0,
  resultado text default 'pendente',
  odd numeric(10,2) default 0,
  stake numeric(10,2) default 0,
  lucro numeric(10,2) default 0,
  dados jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists alertas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  mensagem text,
  lido boolean not null default false,
  dados jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists logs_ia (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id) on delete set null,
  pergunta text,
  resposta text,
  dados jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_usuarios_updated_at on usuarios;
create trigger trg_usuarios_updated_at
before update on usuarios
for each row execute procedure set_updated_at();

drop trigger if exists trg_pagamentos_updated_at on pagamentos;
create trigger trg_pagamentos_updated_at
before update on pagamentos
for each row execute procedure set_updated_at();

create index if not exists idx_usuarios_email on usuarios(email);
create index if not exists idx_pagamentos_usuario on pagamentos(usuario_id);
create index if not exists idx_pagamentos_mp on pagamentos(mp_payment_id);
create index if not exists idx_favoritos_usuario on favoritos(usuario_id);
create index if not exists idx_historico_usuario on historico_assertividade(usuario_id);
create index if not exists idx_alertas_usuario on alertas(usuario_id);
