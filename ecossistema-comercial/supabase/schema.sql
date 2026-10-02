-- =========================================================
-- ECOSSISTEMA COMERCIAL (RECORD) — Banco de dados (Supabase)
-- ---------------------------------------------------------
-- Como usar:
--   1. Painel do Supabase  →  SQL Editor
--   2. Cole este arquivo inteiro e clique em "Run".
--   3. Depois, em Project Settings → API, copie a URL e a
--      "anon key" e cole em js/supabase.js.
--
-- SEGURANÇA (importante):
--   As tabelas abaixo têm Row Level Security (RLS) LIGADO e só
--   liberam acesso para usuários AUTENTICADOS (equipe logada).
--   Crie os logins da equipe em Authentication → Users.
--   > Para um TESTE rápido sem login, veja o bloco comentado
--     no final (libera acesso anônimo — NÃO use com dados reais).
-- =========================================================

-- ========== TABELAS ==========

create table if not exists public.clientes (
  id          bigint generated always as identity primary key,
  nome        text not null,
  segmento    text,
  contato     text,
  telefone    text,
  email       text,
  status      text default 'Lead',   -- Lead | Negociação | Ativo | Inativo
  responsavel text,
  valor_mes   numeric default 0,
  criado_em   timestamptz not null default now()
);

create table if not exists public.oportunidades (
  id            bigint generated always as identity primary key,
  cliente       text not null,
  valor         numeric default 0,
  estagio       text default 'Prospecção', -- Prospecção | Qualificação | Proposta | Negociação | Fechado | Perdido
  vendedor      text,
  probabilidade int default 0,
  fechamento    date,
  criado_em     timestamptz not null default now()
);

create table if not exists public.propostas (
  id        bigint generated always as identity primary key,
  numero    text,
  cliente   text not null,
  valor     numeric default 0,
  status    text default 'Rascunho', -- Rascunho | Enviada | Em negociação | Aprovada | Recusada
  vendedor  text,
  data      date default now(),
  validade  date,
  criado_em timestamptz not null default now()
);

create table if not exists public.produtos (
  id        bigint generated always as identity primary key,
  nome      text not null,
  tipo      text,          -- Apartamento | Cobertura | Casa | Lote | Sala comercial
  faixa     text,          -- faixa de programação
  preco     numeric default 0,
  descricao text,
  ativo     boolean default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.vendedores (
  id        bigint generated always as identity primary key,
  nome      text not null,
  cargo     text,
  meta      numeric default 0,
  realizado numeric default 0,
  negocios  int default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.compromissos (
  id          bigint generated always as identity primary key,
  titulo      text not null,
  tipo        text,   -- Reunião | Apresentação | Fechamento | Prospecção | Follow-up | Interno
  data        date,
  hora        text,
  responsavel text,
  criado_em   timestamptz not null default now()
);

create table if not exists public.indicadores (
  id       bigint generated always as identity primary key,
  nome     text not null,
  valor    text,
  variacao text,   -- alta | baixa | estavel
  obs      text,
  criado_em timestamptz not null default now()
);

create table if not exists public.vendas_mensais (
  id    bigint generated always as identity primary key,
  mes   text not null,
  valor numeric default 0
);

-- ========== SEGURANÇA (RLS) ==========
-- Liga a proteção em todas as tabelas.
alter table public.clientes       enable row level security;
alter table public.oportunidades  enable row level security;
alter table public.propostas      enable row level security;
alter table public.produtos       enable row level security;
alter table public.vendedores     enable row level security;
alter table public.compromissos   enable row level security;
alter table public.indicadores    enable row level security;
alter table public.vendas_mensais enable row level security;

-- Acesso total para usuários AUTENTICADOS (equipe logada).
-- Um comando por tabela, cobrindo select/insert/update/delete.
do $$
declare t text;
begin
  foreach t in array array[
    'clientes','oportunidades','propostas','produtos',
    'vendedores','compromissos','indicadores','vendas_mensais'
  ] loop
    execute format('drop policy if exists "equipe_total" on public.%I;', t);
    execute format(
      'create policy "equipe_total" on public.%I
         for all to authenticated
         using (true) with check (true);', t);
  end loop;
end $$;

-- =========================================================
-- TESTE RÁPIDO SEM LOGIN (opcional, INSEGURO)
-- Descomente o bloco abaixo apenas para validar o sistema com
-- dados reais sem configurar logins. Qualquer pessoa com a
-- anon key poderá ler/escrever. NÃO use com dados verdadeiros.
-- =========================================================
-- do $$
-- declare t text;
-- begin
--   foreach t in array array[
--     'clientes','oportunidades','propostas','produtos',
--     'vendedores','compromissos','indicadores','vendas_mensais'
--   ] loop
--     execute format('drop policy if exists "anon_teste" on public.%I;', t);
--     execute format(
--       'create policy "anon_teste" on public.%I
--          for all to anon using (true) with check (true);', t);
--   end loop;
-- end $$;
