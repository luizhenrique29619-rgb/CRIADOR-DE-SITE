/* =========================================================
   ECOSSISTEMA COMERCIAL — RECORD
   Funções compartilhadas por todas as telas:
   - monta a sidebar (menu lateral) com o módulo ativo
   - alterna tema claro/escuro (guardado no navegador)
   - carrega dados do Supabase (ou usa dados de exemplo)
   - formatadores de moeda, data e porcentagem
   ========================================================= */

/* ---- Lista de módulos do ecossistema (ordem do menu) ---- */
const MODULOS = [
  { id: 'inicio',       nome: 'Portal',               icone: '🏠', href: 'index.html',             grupo: null },
  { id: 'dashboard',    nome: 'Dashboard',            icone: '📊', href: 'modulos/dashboard.html',    grupo: 'Operação' },
  { id: 'crm',          nome: 'Clientes & Leads',     icone: '👥', href: 'modulos/crm.html',          grupo: 'Operação' },
  { id: 'funil',        nome: 'Funil de Vendas',      icone: '🫧', href: 'modulos/funil.html',        grupo: 'Operação' },
  { id: 'propostas',    nome: 'Propostas',            icone: '📄', href: 'modulos/propostas.html',    grupo: 'Operação' },
  { id: 'catalogo',     nome: 'Catálogo de Imóveis',  icone: '🏢', href: 'modulos/catalogo.html',     grupo: 'Apoio & Inteligência' },
  { id: 'inteligencia', nome: 'Inteligência',         icone: '🧭', href: 'modulos/inteligencia.html', grupo: 'Apoio & Inteligência' },
  { id: 'equipe',       nome: 'Equipe & Metas',       icone: '🏆', href: 'modulos/equipe.html',       grupo: 'Apoio & Inteligência' },
  { id: 'agenda',       nome: 'Agenda',               icone: '📅', href: 'modulos/agenda.html',       grupo: 'Apoio & Inteligência' },
];

/* Descobre o prefixo de caminho: páginas em /modulos/ sobem um nível */
function prefixo() {
  return location.pathname.includes('/modulos/') ? '../' : '';
}

/* ---- Monta a estrutura (sidebar + topo) ----
   Uso na página:
   montarLayout({ ativo: 'dashboard', titulo: 'Dashboard Comercial', sub: '...' });
*/
function montarLayout({ ativo, titulo, sub }) {
  const pre = prefixo();

  // agrupa itens pelo campo "grupo"
  let navHTML = '';
  let grupoAtual = '__none__';
  MODULOS.forEach((m) => {
    if (m.grupo !== grupoAtual && m.grupo !== null) {
      navHTML += `<div class="sidebar__grupo">${m.grupo}</div>`;
      grupoAtual = m.grupo;
    }
    const classe = m.id === ativo ? 'nav-item nav-item--ativo' : 'nav-item';
    navHTML += `
      <a class="${classe}" href="${pre}${m.href}">
        <span class="nav-item__icone">${m.icone}</span>
        <span>${m.nome}</span>
      </a>`;
  });

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <a class="sidebar__marca" href="${pre}index.html">
        <div class="sidebar__logo">R</div>
        <div>
          <div class="sidebar__titulo">RECORD</div>
          <div class="sidebar__sub">Comercial</div>
        </div>
      </a>
      <nav class="sidebar__nav">${navHTML}</nav>
      <div class="sidebar__rodape">Ecossistema Comercial · v1.0</div>
    `;
  }

  const topo = document.getElementById('topo');
  if (topo) {
    topo.innerHTML = `
      <button class="topo__menu" id="btnMenu" aria-label="Abrir menu">☰</button>
      <div class="topo__titulo">
        <h1>${titulo || ''}</h1>
        ${sub ? `<p>${sub}</p>` : ''}
      </div>
      <div class="topo__dir">
        <button class="tema-botao" id="btnTema" aria-label="Alternar tema" title="Tema claro/escuro">🌙</button>
        <div class="usuario">
          <div class="usuario__avatar">RC</div>
          <span class="usuario__nome">Equipe Record</span>
        </div>
      </div>
    `;
  }

  ligarInteracoes();
  aplicarTemaSalvo();
}

/* ---- Menu no celular + tema ---- */
function ligarInteracoes() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const btnMenu = document.getElementById('btnMenu');
  const btnTema = document.getElementById('btnTema');

  if (btnMenu && sidebar && overlay) {
    const abrir  = () => { sidebar.classList.add('sidebar--aberta'); overlay.classList.add('overlay--ativo'); };
    const fechar = () => { sidebar.classList.remove('sidebar--aberta'); overlay.classList.remove('overlay--ativo'); };
    btnMenu.addEventListener('click', abrir);
    overlay.addEventListener('click', fechar);
  }

  if (btnTema) btnTema.addEventListener('click', alternarTema);
}

function aplicarTemaSalvo() {
  let tema = 'claro';
  try { tema = localStorage.getItem('tema') || 'claro'; } catch (e) {}
  document.documentElement.setAttribute('data-theme', tema === 'escuro' ? 'dark' : 'light');
  atualizarIconeTema(tema);
}

function alternarTema() {
  const atual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'escuro' : 'claro';
  const novo = atual === 'escuro' ? 'claro' : 'escuro';
  document.documentElement.setAttribute('data-theme', novo === 'escuro' ? 'dark' : 'light');
  try { localStorage.setItem('tema', novo); } catch (e) {}
  atualizarIconeTema(novo);
}

function atualizarIconeTema(tema) {
  const btn = document.getElementById('btnTema');
  if (btn) btn.textContent = tema === 'escuro' ? '☀️' : '🌙';
}

/* ---- Carregar dados: tenta CV CRM, depois Supabase, senão exemplos ----
   Retorna { dados, fonte } onde fonte é 'cvcrm' | 'supabase' | 'exemplo'.
   cvRecurso (opcional): nome do recurso na ponte do CV CRM ('vendas' | 'clientes').
*/
async function carregarDados(tabela, exemplos, cvRecurso) {
  // 1) CV CRM (via função-ponte), quando aplicável e configurado
  if (cvRecurso && window.cvBuscar) {
    const cv = await window.cvBuscar(cvRecurso);
    if (Array.isArray(cv) && cv.length) {
      return { dados: cv, fonte: 'cvcrm' };
    }
  }
  // 2) Supabase
  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient.from(tabela).select('*');
      if (!error && Array.isArray(data) && data.length) {
        return { dados: data, fonte: 'supabase' };
      }
    } catch (e) {
      console.warn('Falha ao ler do Supabase, usando dados de exemplo:', e);
    }
  }
  // 3) Dados de exemplo
  return { dados: exemplos || [], fonte: 'exemplo' };
}

/* Mostra o aviso "dados de exemplo" só quando NENHUMA fonte real está ligada */
function avisoFonte(fonte, containerId) {
  if (fonte !== 'exemplo') return;
  const alvo = document.getElementById(containerId);
  if (!alvo) return;
  alvo.insertAdjacentHTML('afterbegin',
    `<div class="aviso-fonte">⚠️ Exibindo <strong>&nbsp;dados de exemplo</strong>. Ligue o CV CRM (<code>js/cvcrm.js</code>) ou o Supabase (<code>js/supabase.js</code>) para ver os dados reais.</div>`);
}

/* ---- Formatadores ---- */
const moeda = (v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const moedaCurta = (v) => {
  v = Number(v) || 0;
  if (v >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
  if (v >= 1e3) return 'R$ ' + (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil';
  return moeda(v);
};
const pct = (v) => (Number(v) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + '%';
const dataBR = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString('pt-BR');
};
const iniciais = (nome) => (nome || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

/* Escapa texto para evitar quebra de HTML ao inserir conteúdo */
const esc = (t) => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
