-- =========================================================
-- BANCO DE DADOS (Supabase) — tabela de contatos
-- ---------------------------------------------------------
-- Como usar:
--   1. Abra o painel do Supabase do seu projeto.
--   2. Vá em "SQL Editor".
--   3. Cole este conteúdo e clique em "Run".
-- =========================================================

-- Tabela que guarda as mensagens enviadas pelo formulário.
create table if not exists public.contatos (
  id         uuid        primary key default gen_random_uuid(),
  nome       text        not null,
  email      text        not null,
  mensagem   text        not null,
  criado_em  timestamptz not null default now()
);

-- Liga a segurança por linha (Row Level Security).
alter table public.contatos enable row level security;

-- Permite que qualquer visitante ENVIE (insira) uma mensagem,
-- mas NÃO permite ler, editar ou apagar pelo front-end.
-- Você lê as mensagens pelo painel do Supabase ("Table Editor").
drop policy if exists "visitante_pode_enviar_contato" on public.contatos;
create policy "visitante_pode_enviar_contato"
  on public.contatos
  for insert
  to anon
  with check (true);
