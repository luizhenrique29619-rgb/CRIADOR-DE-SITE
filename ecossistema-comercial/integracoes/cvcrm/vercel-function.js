// =========================================================
// PONTE CV CRM — Vercel Serverless Function (Node.js)
// ---------------------------------------------------------
// Onde colocar: /api/cv-dados.js  (na raiz do projeto publicado na Vercel)
//
// Variáveis de ambiente (Vercel → Project → Settings → Environment Variables):
//   CVCRM_URL   = https://SUACONTA.cvcrm.com.br
//   CVCRM_EMAIL = voce@empresa.com
//   CVCRM_TOKEN = xxxxxxxx
//
// Chamada do front (js/cvcrm.js):
//   pontes.vendas   = https://SEU-SITE.vercel.app/api/cv-dados?recurso=vendas
//   pontes.clientes = https://SEU-SITE.vercel.app/api/cv-dados?recurso=clientes
// =========================================================

const { CVCRM_URL = '', CVCRM_EMAIL = '', CVCRM_TOKEN = '' } = process.env;

// AJUSTE: domínio do seu site (CORS). Use "*" só para testar.
const ORIGEM = '*';

// AJUSTE: endpoints reais da sua conta no CV CRM (veja ajuda.cvcrm.com.br).
const ENDPOINTS = {
  vendas:   '/api/v1/cvdw/vendas',
  clientes: '/api/v1/cvdw/leads',
};

async function buscarCV(caminho) {
  const r = await fetch(CVCRM_URL + caminho, {
    headers: { email: CVCRM_EMAIL, token: CVCRM_TOKEN, accept: 'application/json' },
  });
  if (!r.ok) throw new Error(`CV CRM respondeu ${r.status}`);
  const json = await r.json();
  return Array.isArray(json) ? json : (json.dados || json.data || []);
}

function agregarVendas(linhas) {
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const acc = {};
  for (const l of linhas) {
    // AJUSTE: nomes dos campos conforme a resposta do CV.
    const data = new Date(l.data_venda || l.data || l.data_contrato);
    const valor = Number(l.valor_contrato || l.valor || 0);
    if (isNaN(data.getTime())) continue;
    const chave = meses[data.getMonth()];
    acc[chave] = (acc[chave] || 0) + valor;
  }
  return meses.filter((m) => acc[m] !== undefined).map((m) => ({ mes: m, valor: acc[m] }));
}

function mapearClientes(linhas) {
  return linhas.map((l) => ({
    // AJUSTE: nomes dos campos conforme a resposta do CV.
    nome: l.nome || l.razao_social || '—',
    segmento: l.segmento || l.origem || '',
    contato: l.contato || l.responsavel || '',
    telefone: l.telefone || l.celular || '',
    status: l.situacao || l.status || 'Lead',
    responsavel: l.corretor || l.responsavel || '',
    valor_mes: Number(l.valor_mes || 0),
  }));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGEM);
  res.setHeader('Access-Control-Allow-Headers', 'authorization, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (!CVCRM_URL || !CVCRM_EMAIL || !CVCRM_TOKEN) {
      throw new Error('Configure CVCRM_URL, CVCRM_EMAIL e CVCRM_TOKEN nas variáveis de ambiente.');
    }
    const recurso = (req.query.recurso) || 'vendas';
    const endpoint = ENDPOINTS[recurso];
    if (!endpoint) throw new Error(`Recurso desconhecido: ${recurso}`);

    const linhas = await buscarCV(endpoint);
    const dados = recurso === 'vendas' ? agregarVendas(linhas) : mapearClientes(linhas);

    res.status(200).json({ dados });
  } catch (e) {
    res.status(500).json({ erro: String(e) });
  }
};
