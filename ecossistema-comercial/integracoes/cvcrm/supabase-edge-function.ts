// =========================================================
// PONTE CV CRM — Supabase Edge Function (Deno)
// ---------------------------------------------------------
// Deploy:
//   supabase functions new cv-dados
//   (cole este conteúdo em supabase/functions/cv-dados/index.ts)
//   supabase secrets set CVCRM_URL=https://SUACONTA.cvcrm.com.br \
//                        CVCRM_EMAIL=voce@empresa.com \
//                        CVCRM_TOKEN=xxxxxxxx
//   supabase functions deploy cv-dados
//
// Chamada do front (js/cvcrm.js):
//   pontes.vendas   = https://SEU-PROJETO.supabase.co/functions/v1/cv-dados?recurso=vendas
//   pontes.clientes = https://SEU-PROJETO.supabase.co/functions/v1/cv-dados?recurso=clientes
// =========================================================

const CVCRM_URL   = Deno.env.get("CVCRM_URL")   ?? "";
const CVCRM_EMAIL = Deno.env.get("CVCRM_EMAIL") ?? "";
const CVCRM_TOKEN = Deno.env.get("CVCRM_TOKEN") ?? "";

// AJUSTE: domínio do seu site (CORS). Use "*" só para testar.
const ORIGEM = "*";

const cors = {
  "Access-Control-Allow-Origin": ORIGEM,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// AJUSTE: endpoints reais da sua conta no CV CRM (veja ajuda.cvcrm.com.br).
// O CV expõe a API de dados (CVDW) com cabeçalhos "email" e "token".
const ENDPOINTS: Record<string, string> = {
  vendas:   "/api/v1/cvdw/vendas",
  clientes: "/api/v1/cvdw/leads",
};

async function buscarCV(caminho: string) {
  const r = await fetch(CVCRM_URL + caminho, {
    headers: { email: CVCRM_EMAIL, token: CVCRM_TOKEN, accept: "application/json" },
  });
  if (!r.ok) throw new Error(`CV CRM respondeu ${r.status}`);
  const json = await r.json();
  // CV costuma devolver { dados: [...] } — ajuste se for diferente.
  return Array.isArray(json) ? json : (json.dados ?? json.data ?? []);
}

// Agrega vendas por mês -> [{ mes, valor }]
function agregarVendas(linhas: any[]) {
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const acc: Record<string, number> = {};
  for (const l of linhas) {
    // AJUSTE: nomes dos campos conforme a resposta do CV.
    const data = new Date(l.data_venda ?? l.data ?? l.data_contrato);
    const valor = Number(l.valor_contrato ?? l.valor ?? 0);
    if (isNaN(data.getTime())) continue;
    const chave = meses[data.getMonth()];
    acc[chave] = (acc[chave] ?? 0) + valor;
  }
  return meses.filter((m) => acc[m] !== undefined).map((m) => ({ mes: m, valor: acc[m] }));
}

// Mapeia leads/clientes -> formato do nosso CRM
function mapearClientes(linhas: any[]) {
  return linhas.map((l) => ({
    // AJUSTE: nomes dos campos conforme a resposta do CV.
    nome: l.nome ?? l.razao_social ?? "—",
    segmento: l.segmento ?? l.origem ?? "",
    contato: l.contato ?? l.responsavel ?? "",
    telefone: l.telefone ?? l.celular ?? "",
    status: l.situacao ?? l.status ?? "Lead",
    responsavel: l.corretor ?? l.responsavel ?? "",
    valor_mes: Number(l.valor_mes ?? 0),
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    if (!CVCRM_URL || !CVCRM_EMAIL || !CVCRM_TOKEN) {
      throw new Error("Configure CVCRM_URL, CVCRM_EMAIL e CVCRM_TOKEN nos secrets.");
    }
    const recurso = new URL(req.url).searchParams.get("recurso") ?? "vendas";
    const endpoint = ENDPOINTS[recurso];
    if (!endpoint) throw new Error(`Recurso desconhecido: ${recurso}`);

    const linhas = await buscarCV(endpoint);
    const dados = recurso === "vendas" ? agregarVendas(linhas) : mapearClientes(linhas);

    return new Response(JSON.stringify({ dados }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ erro: String(e) }), {
      status: 500,
      headers: { ...cors, "content-type": "application/json" },
    });
  }
});
