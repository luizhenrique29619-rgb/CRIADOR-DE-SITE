/* =========================================================
   CAMADA DE DADOS — CV CRM (Construtor de Vendas)
   ---------------------------------------------------------
   A parte de vendas e clientes vem do CV CRM. Mas um site
   estático NÃO pode chamar a API do CV direto do navegador
   (isso exporia o token e esbarra em CORS).

   Por isso o front fala com uma "PONTE" no back-end — uma
   função (Supabase Edge Function ou Vercel Function) que
   guarda o token do CV com segurança, busca os dados lá e
   devolve prontos. Veja como criar essa ponte em:
       integracoes/cvcrm/README.md

   >> Enquanto as URLs abaixo estiverem vazias, o sistema usa
      o Supabase (se configurado) ou os dados de exemplo. <<
   ========================================================= */

const CVCRM = {
  // URL da SUA função-ponte para cada recurso (não a URL do CV CRM).
  pontes: {
    vendas:   '',   // ex.: https://SEU-PROJETO.supabase.co/functions/v1/cv-vendas
    clientes: '',   // ex.: https://SEU-PROJETO.supabase.co/functions/v1/cv-clientes
  },
  // Chave pública para chamar a sua ponte, se ela exigir (ex.: anon key do
  // Supabase). NUNCA coloque aqui o token do CV CRM — ele fica só na ponte.
  chave: '',
};

/* Busca um recurso ('vendas' | 'clientes') na ponte do CV CRM.
   Retorna um array de dados, ou null se a ponte não estiver configurada
   ou falhar (aí o sistema cai para Supabase/exemplo). */
async function cvBuscar(recurso) {
  const url = (CVCRM.pontes && CVCRM.pontes[recurso]) || '';
  if (!url) return null;
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (CVCRM.chave) {
      headers['Authorization'] = 'Bearer ' + CVCRM.chave;
      headers['apikey'] = CVCRM.chave;
    }
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const json = await r.json();
    // aceita tanto um array direto quanto { dados: [...] } ou { data: [...] }
    return Array.isArray(json) ? json : (json.dados || json.data || null);
  } catch (e) {
    console.warn('CV CRM: falha ao buscar "' + recurso + '":', e);
    return null;
  }
}

window.CVCRM = CVCRM;
window.cvBuscar = cvBuscar;
