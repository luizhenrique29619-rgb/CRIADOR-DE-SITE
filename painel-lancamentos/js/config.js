/* =========================================================
   CONFIGURAÇÃO DO SUPABASE — Painel de Lançamentos (Record)
   ---------------------------------------------------------
   A "anon key" é PÚBLICA e pode ficar aqui. Quem protege os
   dados são as regras de segurança (RLS) do banco: um
   Visualizador não consegue editar nada, nem alterando isto.
   NUNCA coloque aqui a "service_role key" (ela é secreta).
   ========================================================= */

const SUPABASE_URL = 'https://gunajbwgkixssftkvqtj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bmFqYndna2l4c3NmdGt2cXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2OTUxMjMsImV4cCI6MjEwNjI3MTEyM30.qmyVcyRTUW6AvLQYhlvOO0PB4HRzU1q0tXo7P0Z-oYQ';

// Cria o cliente e expõe em window.sb (usado pelas demais telas).
window.sb = (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
