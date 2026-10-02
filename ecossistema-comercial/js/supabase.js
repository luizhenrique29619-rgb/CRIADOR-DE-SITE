/* =========================================================
   CONFIGURAÇÃO DO SUPABASE (Back End) — Ecossistema Comercial
   ---------------------------------------------------------
   Painel do Supabase → Project Settings → API

   - A "anon key" é PÚBLICA e pode ficar aqui. É protegida pelas
     regras de segurança (Row Level Security) do banco.
   - NUNCA coloque aqui a "service_role key" (ela é secreta).

   Enquanto estes campos estiverem vazios, o sistema roda com
   DADOS DE EXEMPLO (ótimo pra ver tudo funcionando). Assim que
   você preencher, ele passa a ler os dados reais das tabelas.
   Rode o SQL em supabase/schema.sql para criar as tabelas.
   ========================================================= */

const SUPABASE_URL = '';       // ex.: https://xxxxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = '';  // ex.: eyJhbGciOiJIUzI1NiIsInR5cCI6...

// Expõe o cliente em window.supabaseClient (usado pelo sistema.js).
window.supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
