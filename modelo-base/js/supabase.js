/* =========================================================
   CONFIGURAÇÃO DO SUPABASE (Back End)
   ---------------------------------------------------------
   Pegue estes dados no painel do Supabase:
   Project Settings  →  API

   - A "anon key" (chave anônima) é PÚBLICA e pode ficar aqui
     no front-end. Ela é protegida pelas regras de segurança
     (Row Level Security) do banco.
   - NUNCA coloque aqui a "service_role key": ela é secreta e
     dá acesso total ao banco.

   Enquanto estes campos estiverem vazios, o site funciona
   normalmente e o formulário só mostra o aviso de sucesso
   (sem gravar no banco).
   ========================================================= */

const SUPABASE_URL = '';       // ex.: https://xxxxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = '';  // ex.: eyJhbGciOiJIUzI1NiIsInR5cCI6...

// Cria o cliente só se as credenciais foram preenchidas e a
// biblioteca do Supabase foi carregada no index.html.
let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
