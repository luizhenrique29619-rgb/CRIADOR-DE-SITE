/* =========================================================
   PAINEL DE LANÇAMENTOS · app.js
   Sessão, painel (KPIs), checklist editável e telas de admin.
   Segurança real: quem pode editar é decidido pelo banco (RLS).
   A interface só esconde o que o perfil não pode fazer.
   ========================================================= */
(function(){
"use strict";
const sb = window.sb;

/* ---------- Metadados ---------- */
const FASES = [
  {num:1, nome:'FUTURO LANÇAMENTO', curto:'Futuro',  janela:'D-10 a D-5'},
  {num:2, nome:'BREVE LANÇAMENTO',  curto:'Breve',   janela:'D-4 a D-3'},
  {num:3, nome:'PRÉ-LANÇAMENTO',    curto:'Pré',     janela:'D-2 a D-1'},
  {num:4, nome:'LANÇAMENTO',        curto:'Lançamento', janela:'D0 a D+1'},
  {num:5, nome:'MANUTENÇÃO',        curto:'Manutenção', janela:'D+1 em diante'},
];
const STATUS = ['PRONTO PARA INICIAR','EM ANDAMENTO','CONCLUÍDO','PENDENTE','ATRASADO','NÃO SE APLICA'];
const ST_CLASS = {'PRONTO PARA INICIAR':'st-pronto','EM ANDAMENTO':'st-andamento','CONCLUÍDO':'st-concluido','PENDENTE':'st-pendente','ATRASADO':'st-atrasado','NÃO SE APLICA':'st-na'};

/* ---------- Estado ---------- */
const state = { user:null, papel:'leitor', emps:[], emp:null, acoes:[], fase:1, channel:null };

/* ---------- Utils ---------- */
const $ = s => document.querySelector(s);
const esc = s => (s==null?'':String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hoje = () => { const d=new Date(); d.setHours(0,0,0,0); return d; };
function parseDate(s){ if(!s) return null; const d=new Date(s+'T00:00:00'); return isNaN(d)?null:d; }
function fmtDate(s){ const d=parseDate(s); return d? d.toLocaleDateString('pt-BR') : '—'; }
function podeEditar(){ return state.papel==='admin' || state.papel==='editor'; }
function ehAdmin(){ return state.papel==='admin'; }
let toastT;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2200); }

/* Alerta derivado de status + prazo (real tem prioridade sobre o sugerido) */
function alerta(a){
  if(a.status==='CONCLUÍDO') return {cls:'al-ok', txt:'Concluído'};
  if(a.status==='NÃO SE APLICA') return {cls:'al-none', txt:'N/A'};
  const d = parseDate(a.prazo_real || a.prazo_sugerido);
  if(!d) return {cls:'al-none', txt:'—'};
  const dias = Math.round((d - hoje())/86400000);
  if(dias < 0)  return {cls:'al-late', txt:'Vencida há '+Math.abs(dias)+'d'};
  if(dias <= 3) return {cls:'al-warn', txt:'Vence em '+dias+'d'};
  return {cls:'al-ok', txt:'No prazo'};
}
function estaAtrasada(a){
  if(a.status==='CONCLUÍDO'||a.status==='NÃO SE APLICA') return false;
  if(a.status==='ATRASADO') return true;
  const d = parseDate(a.prazo_real || a.prazo_sugerido);
  return d ? d < hoje() : false;
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
async function init(){
  if(!sb){ alert('Configuração do Supabase ausente (js/config.js).'); return; }
  const { data:{session} } = await sb.auth.getSession();
  if(!session){ location.replace('index.html'); return; }
  state.user = session.user;

  // Perfil (papel)
  const { data:prof } = await sb.from('profiles').select('nome,papel,email,is_master').eq('id', state.user.id).single();
  state.papel = (prof && prof.papel) || 'leitor';
  state.isMaster = !!(prof && prof.is_master);
  const nome = (prof && prof.nome) || state.user.email.split('@')[0];
  $('#uNome').textContent = nome;
  $('#uAvatar').textContent = (nome[0]||'?').toUpperCase();
  $('#uRole').textContent = {admin:'Administrador',editor:'Editor',leitor:'Visualizador'}[state.papel];
  if(ehAdmin()) document.querySelectorAll('.admin-only').forEach(e=>e.classList.remove('hidden'));
  if(!podeEditar()) $('#roView').style.display='inline-block';

  wireEvents();
  await carregarEmpreendimentos();
}

async function carregarEmpreendimentos(){
  const { data, error } = await sb.from('empreendimentos').select('*').order('criado_em',{ascending:false});
  if(error){ console.error(error); }
  state.emps = data || [];
  const sel = $('#empSelect');
  if(!state.emps.length){
    sel.innerHTML = '<option>Nenhum lançamento ainda</option>';
    $('#viewLoading').textContent = ehAdmin()
      ? 'Nenhum lançamento cadastrado. Clique em “+ Novo lançamento” para começar.'
      : 'Nenhum lançamento cadastrado ainda. Peça a um administrador para criar o primeiro.';
    return;
  }
  sel.innerHTML = state.emps.map(e=>`<option value="${e.id}">${esc(e.nome)}${e.praca?' · '+esc(e.praca):''}</option>`).join('');
  const salvo = localStorage.getItem('emp_atual');
  const alvo = state.emps.find(e=>e.id===salvo) || state.emps[0];
  sel.value = alvo.id;
  await selecionarEmp(alvo.id);
}

async function selecionarEmp(id){
  state.emp = state.emps.find(e=>e.id===id);
  localStorage.setItem('emp_atual', id);
  await carregarAcoes();
  assinarRealtime(id);
}

async function carregarAcoes(){
  const { data, error } = await sb.from('acoes').select('*')
    .eq('empreendimento_id', state.emp.id).order('fase_num').order('ordem');
  if(error){ console.error(error); toast('Erro ao carregar ações'); return; }
  state.acoes = data || [];
  $('#viewLoading').classList.add('hidden');
  renderAtual();
  mostrarVista();           // revela a aba ativa (Painel por padrão)
}

/* Mostra a seção da aba ativa e esconde a outra */
function mostrarVista(){
  const v = document.querySelector('.tab.active').dataset.view;
  $('#viewPainel').classList.toggle('hidden', v!=='painel');
  $('#viewChecklist').classList.toggle('hidden', v!=='checklist');
}

/* Tempo real: mudou uma ação deste lançamento → recarrega e re-renderiza */
function assinarRealtime(empId){
  if(state.channel){ sb.removeChannel(state.channel); state.channel=null; }
  state.channel = sb.channel('acoes-'+empId)
    .on('postgres_changes', {event:'*', schema:'public', table:'acoes', filter:'empreendimento_id=eq.'+empId},
      (payload)=>{
        const row = payload.new || payload.old; if(!row) return;
        const i = state.acoes.findIndex(a=>a.id===row.id);
        if(payload.eventType==='DELETE'){ if(i>=0) state.acoes.splice(i,1); }
        else if(i>=0){ state.acoes[i]=payload.new; } else { state.acoes.push(payload.new); }
        // Re-renderiza o painel sempre; a tabela só se ninguém estiver digitando nela.
        renderPainel();
        if(!document.activeElement || !$('#acoesBody').contains(document.activeElement)) renderChecklist();
      }).subscribe();
}

/* =========================================================
   RENDER
   ========================================================= */
function vistaAtual(){ return document.querySelector('.tab.active').dataset.view; }
function renderAtual(){ renderPainel(); renderChecklist(); }

function agregados(){
  const total=state.acoes.length;
  let concl=0, andam=0, atras=0, na=0;
  state.acoes.forEach(a=>{
    if(a.status==='CONCLUÍDO') concl++;
    else if(a.status==='EM ANDAMENTO') andam++;
    else if(a.status==='NÃO SE APLICA') na++;
    if(estaAtrasada(a)) atras++;
  });
  const efet = Math.max(1, total - na);
  return {total, concl, andam, atras, na, pct: Math.round(concl/efet*100)};
}

function renderPainel(){
  if(!state.emp) return;
  const g = agregados();
  $('#kpis').innerHTML = `
    <div class="kpi accent"><div class="lbl">% Geral concluído</div><div class="val">${g.pct}%</div><div class="sub">D0: ${fmtDate(state.emp.data_d0)}</div></div>
    <div class="kpi"><div class="lbl">Total de ações</div><div class="val">${g.total}</div><div class="sub">${state.emp.consultoria||''}</div></div>
    <div class="kpi"><div class="lbl">Concluídas</div><div class="val ok">${g.concl}</div></div>
    <div class="kpi"><div class="lbl">Em andamento</div><div class="val run">${g.andam}</div></div>
    <div class="kpi"><div class="lbl">Atrasadas / vencidas</div><div class="val late">${g.atras}</div></div>`;

  const efet = Math.max(1, g.total - g.na);
  const pOk=g.concl/efet*100, pRun=g.andam/efet*100, pLate=g.atras/efet*100;
  $('#progBar').innerHTML =
    `<span class="s-ok" style="width:${pOk}%"></span><span class="s-run" style="width:${pRun}%"></span><span class="s-late" style="width:${pLate}%"></span>`;
  $('#progHint').textContent = `${g.concl} de ${g.total} ações concluídas · ${g.andam} em andamento · ${g.atras} atrasadas`;

  // Por fase
  $('#fasesBody').innerHTML = FASES.map(f=>{
    const itens = state.acoes.filter(a=>a.fase_num===f.num);
    const t=itens.length, c=itens.filter(a=>a.status==='CONCLUÍDO').length,
          an=itens.filter(a=>a.status==='EM ANDAMENTO').length, at=itens.filter(estaAtrasada).length,
          na=itens.filter(a=>a.status==='NÃO SE APLICA').length;
    const pct=t?Math.round(c/Math.max(1,t-na)*100):0;
    return `<tr><td class="code">${f.num}</td><td><b>${esc(f.nome)}</b></td><td class="setor-tag">${f.janela}</td>
      <td class="num">${t}</td><td class="num">${c}</td><td class="num">${an}</td><td class="num">${at}</td>
      <td><b>${pct}%</b><div class="mini-bar"><span style="width:${pct}%"></span></div></td></tr>`;
  }).join('');

  // Por setor
  const setores={};
  state.acoes.forEach(a=>{ const s=a.setor||'—'; (setores[s]=setores[s]||[]).push(a); });
  $('#setoresBody').innerHTML = Object.keys(setores).sort().map(s=>{
    const itens=setores[s], t=itens.length, c=itens.filter(a=>a.status==='CONCLUÍDO').length,
          at=itens.filter(estaAtrasada).length, na=itens.filter(a=>a.status==='NÃO SE APLICA').length;
    const pct=Math.round(c/Math.max(1,t-na)*100);
    return `<tr><td>${esc(s)}</td><td class="num">${t}</td><td class="num">${c}</td><td class="num">${at}</td>
      <td><b>${pct}%</b><div class="mini-bar"><span style="width:${pct}%"></span></div></td></tr>`;
  }).join('');
}

function renderChecklist(){
  if(!state.emp) return;
  // Abas de fase
  $('#faseTabs').innerHTML = FASES.map(f=>{
    const n=state.acoes.filter(a=>a.fase_num===f.num).length;
    return `<button class="subtab ${f.num===state.fase?'active':''}" data-fase="${f.num}">${esc(f.curto)} <b>${n}</b></button>`;
  }).join('');

  // Preenche filtros (setor/responsável) uma vez por carga
  const setSel=$('#fSetor'), respSel=$('#fResp');
  if(setSel.options.length<=1){
    const setores=[...new Set(state.acoes.map(a=>a.setor).filter(Boolean))].sort();
    setSel.innerHTML='<option value="">Todos os setores</option>'+setores.map(s=>`<option>${esc(s)}</option>`).join('');
    const resps=[...new Set(state.acoes.map(a=>a.responsavel).filter(Boolean))].sort();
    respSel.innerHTML='<option value="">Todos os responsáveis</option>'+resps.map(s=>`<option>${esc(s)}</option>`).join('');
    $('#fStatus').innerHTML='<option value="">Todos os status</option>'+STATUS.map(s=>`<option>${esc(s)}</option>`).join('');
  }

  const q=$('#busca').value.trim().toLowerCase();
  const fs=setSel.value, fr=respSel.value, fst=$('#fStatus').value;
  const editavel=podeEditar();

  const linhas = state.acoes.filter(a=>a.fase_num===state.fase).filter(a=>{
    if(fs && a.setor!==fs) return false;
    if(fr && a.responsavel!==fr) return false;
    if(fst && a.status!==fst) return false;
    if(q){ const blob=(a.codigo+' '+a.tarefa+' '+(a.responsavel||'')+' '+(a.setor||'')+' '+(a.frente||'')).toLowerCase(); if(!blob.includes(q)) return false; }
    return true;
  });

  $('#acoesEmpty').classList.toggle('hidden', linhas.length>0);
  $('#acoesBody').innerHTML = linhas.map(a=>{
    const al=alerta(a);
    const statusCtl = editavel
      ? `<select class="status ${ST_CLASS[a.status]}" data-id="${a.id}" data-f="status">${STATUS.map(s=>`<option ${s===a.status?'selected':''}>${s}</option>`).join('')}</select>`
      : `<span class="status ${ST_CLASS[a.status]}">${esc(a.status)}</span>`;
    const prazoCtl = editavel
      ? `<input type="date" class="inp-date" data-id="${a.id}" data-f="prazo_real" value="${a.prazo_real||''}" title="Prazo real">`
      : (a.prazo_real?fmtDate(a.prazo_real):'—');
    const obsCtl = editavel
      ? `<input class="inp-obs" data-id="${a.id}" data-f="observacao" value="${esc(a.observacao||'')}" placeholder="—">`
      : esc(a.observacao||'—');
    return `<tr data-row="${a.id}">
      <td class="code">${esc(a.codigo)}</td>
      <td class="tarefa"><b>${esc(a.tarefa)}</b><small>${esc(a.criterio_pronto||'')}</small></td>
      <td><span>${esc(a.setor||'')}</span><br><span class="setor-tag">${esc(a.frente||'')}</span></td>
      <td>${esc(a.responsavel||'—')}${a.apoio?'<br><span class="setor-tag">apoio: '+esc(a.apoio)+'</span>':''}</td>
      <td class="editcell"><span class="setor-tag">sug.: ${fmtDate(a.prazo_sugerido)}</span><br>${prazoCtl}</td>
      <td class="editcell">${statusCtl}</td>
      <td><span class="badge ${al.cls}">${al.txt}</span></td>
      <td class="editcell">${obsCtl}</td>
      <td class="rowacts">${editavel?`<button class="rowbtn" data-edit="${a.id}" title="Editar tarefa" aria-label="Editar tarefa">✎</button>`:''}${ehAdmin()?`<button class="rowbtn danger" data-del="${a.id}" title="Excluir tarefa" aria-label="Excluir tarefa">✕</button>`:''}</td>
    </tr>`;
  }).join('');
}

/* =========================================================
   EDIÇÃO (salva no banco; RLS garante a permissão)
   ========================================================= */
async function salvarCampo(id, campo, valor){
  const patch={}; patch[campo]= (valor===''?null:valor);
  const a = state.acoes.find(x=>x.id===id);
  const anterior = a ? a[campo] : null;
  if(a){ a[campo]=patch[campo]; if(campo==='status') renderPainel(); }  // otimista
  const { error } = await sb.from('acoes').update(patch).eq('id', id);
  if(error){
    if(a){ a[campo]=anterior; }
    toast(/row-level|permission|policy/i.test(error.message) ? 'Seu perfil não permite editar.' : 'Erro ao salvar.');
    renderChecklist();
  } else {
    toast('Salvo ✓');
    if(campo==='status'){ renderPainel(); renderChecklist(); }
  }
}

/* =========================================================
   MODAIS
   ========================================================= */
function fecharModal(){ $('#modalRoot').innerHTML=''; }
function abrirModal(html){ $('#modalRoot').innerHTML = `<div class="overlay" id="ov">${html}</div>`;
  $('#ov').addEventListener('click', e=>{ if(e.target.id==='ov') fecharModal(); }); }

function modalNovo(){
  const hoje=new Date().toISOString().slice(0,10);
  abrirModal(`<div class="modal"><h3>Novo lançamento</h3>
    <p class="hint">As 259 ações-modelo serão criadas automaticamente, com os prazos calculados pela data do lançamento (D0).</p>
    <div class="field"><label>Nome do empreendimento</label><input id="mNome" placeholder="Ex.: Residencial Orla Nobre"></div>
    <div class="field"><label>Praça / cidade</label><input id="mPraca" placeholder="Ex.: Maceió / AL"></div>
    <div class="field"><label>Consultoria</label><input id="mCons" value="VMV Group"></div>
    <div class="field"><label>Data-alvo do lançamento (D0)</label><input id="mD0" type="date" value="${hoje}"></div>
    <div class="msg" id="mMsg"></div>
    <div class="modal-actions"><button class="btn btn-ghost" id="mCancel">Cancelar</button>
      <button class="btn btn-primary" id="mOk">Criar lançamento</button></div></div>`);
  $('#mCancel').onclick=fecharModal;
  $('#mOk').onclick=async function(){
    const nome=$('#mNome').value.trim(); const d0=$('#mD0').value;
    if(!nome||!d0){ $('#mMsg').className='msg err'; $('#mMsg').textContent='Informe nome e data do lançamento.'; return; }
    this.disabled=true; this.textContent='Criando…';
    const { data, error } = await sb.rpc('criar_empreendimento',
      { p_nome:nome, p_praca:$('#mPraca').value.trim(), p_consultoria:$('#mCons').value.trim(), p_data_d0:d0 });
    if(error){ $('#mMsg').className='msg err'; $('#mMsg').textContent=error.message; this.disabled=false; this.textContent='Criar lançamento'; return; }
    fecharModal(); toast('Lançamento criado ✓');
    await carregarEmpreendimentos(); $('#empSelect').value=data; await selecionarEmp(data);
  };
}

async function modalEquipe(){
  abrirModal(`<div class="modal lg"><h3>Equipe e perfis</h3>
    <p class="hint">Defina o que cada pessoa pode fazer. <b>Administrador</b>: gerencia tudo. <b>Editor</b>: edita o checklist. <b>Visualizador</b>: só acompanha.</p>
    <div id="eqBody" class="loading">Carregando…</div>
    <div class="modal-actions"><button class="btn btn-ghost" id="eqClose">Fechar</button></div></div>`);
  $('#eqClose').onclick=fecharModal;
  const { data, error } = await sb.from('profiles').select('*').order('papel').order('nome');
  if(error){ $('#eqBody').innerHTML='<p class="msg err">'+esc(error.message)+'</p>'; return; }
  $('#eqBody').innerHTML = `<div class="tablecard" style="margin:0"><table class="std"><thead><tr>
    <th>Nome</th><th>E-mail</th><th>Perfil</th><th>Ativo</th></tr></thead><tbody>${
    data.map(p=>{
      const souEu = p.id===state.user.id;
      const masterProtegido = p.is_master && !state.isMaster;
      const dis = (souEu || masterProtegido) ? 'disabled' : '';
      const tit = souEu ? ' title="Você não pode mudar o próprio perfil"'
                : (masterProtegido ? ' title="Conta master protegida"' : '');
      const masterTag = p.is_master ? ' <span class="badge al-none" title="Conta master">master</span>' : '';
      return `<tr>
      <td><b>${esc(p.nome||'—')}</b>${masterTag}</td><td class="setor-tag">${esc(p.email||'')}</td>
      <td><select class="status" data-pid="${p.id}" data-pf="papel" ${dis}${tit}>
        ${['leitor','editor','admin'].map(r=>`<option value="${r}" ${p.papel===r?'selected':''}>${({leitor:'Visualizador',editor:'Editor',admin:'Administrador'})[r]}</option>`).join('')}</select></td>
      <td><select class="status" data-pid="${p.id}" data-pf="ativo" ${dis}>
        <option value="true" ${p.ativo?'selected':''}>Sim</option><option value="false" ${!p.ativo?'selected':''}>Não</option></select></td>
    </tr>`;}).join('')}</tbody></table></div>`;
  $('#eqBody').querySelectorAll('select[data-pid]').forEach(sel=>{
    sel.onchange=async function(){
      const pid=this.dataset.pid, pf=this.dataset.pf;
      let val = pf==='ativo' ? (this.value==='true') : this.value;
      const { error } = await sb.from('profiles').update({[pf]:val}).eq('id',pid);
      toast(error ? 'Erro ao salvar' : 'Perfil atualizado ✓');
    };
  });
}

function modalShare(){
  if(!state.emp){ return; }
  const e=state.emp;
  const link = new URL('apresentacao.html', location.href).href + '?token=' + e.share_slug;
  abrirModal(`<div class="modal"><h3>Compartilhar apresentação</h3>
    <p class="hint">Gere um link <b>somente leitura</b> do painel de <b>${esc(e.nome)}</b> para apresentar a quem não faz parte do time. Ninguém consegue editar por esse link.</p>
    <div class="field"><label>Modo apresentação</label>
      <select id="shToggle" class="status" style="width:100%;padding:10px">
        <option value="true" ${e.compartilhado?'selected':''}>Ativado — link funciona</option>
        <option value="false" ${!e.compartilhado?'selected':''}>Desativado — link bloqueado</option>
      </select></div>
    <div class="field" id="shLinkWrap" style="${e.compartilhado?'':'display:none'}">
      <label>Link de apresentação</label>
      <div class="link-share"><input id="shLink" readonly value="${esc(link)}">
        <button class="btn btn-sm" id="shCopy">Copiar</button></div>
    </div>
    <div class="modal-actions"><button class="btn btn-ghost" id="shClose">Fechar</button></div></div>`);
  $('#shClose').onclick=fecharModal;
  $('#shCopy').onclick=()=>{ $('#shLink').select(); navigator.clipboard.writeText(link).then(()=>toast('Link copiado ✓')); };
  $('#shToggle').onchange=async function(){
    const val=this.value==='true';
    const { error } = await sb.from('empreendimentos').update({compartilhado:val}).eq('id',e.id);
    if(error){ toast('Erro: '+error.message); return; }
    e.compartilhado=val; $('#shLinkWrap').style.display=val?'block':'none'; toast('Atualizado ✓');
  };
}

/* ---------- Criar / editar / excluir TAREFA ---------- */
const PREFIXO_FASE = {1:'FL',2:'BL',3:'PL',4:'LC',5:'MN'};
function datalistOpcoes(campo){
  return [...new Set(state.acoes.map(a=>a[campo]).filter(Boolean))].sort()
    .map(v=>`<option value="${esc(v)}"></option>`).join('');
}
function modalTarefa(acao){
  const novo = !acao; const a = acao || {};
  const faseAtual = a.fase_num || state.fase;
  const faseSel = FASES.map(f=>`<option value="${f.num}" ${faseAtual===f.num?'selected':''}>${esc(f.nome)}</option>`).join('');
  const statusSel = STATUS.map(s=>`<option ${(a.status||'PRONTO PARA INICIAR')===s?'selected':''}>${s}</option>`).join('');
  abrirModal(`<div class="modal lg"><h3>${novo?'Nova tarefa':'Editar tarefa'}</h3>
    <p class="hint">${novo?'Cria uma nova ação neste lançamento.':'Altere os dados da ação. Quem editou e quando fica registrado.'}</p>
    <div class="form-grid">
      <div class="field wide"><label>Tarefa</label><input id="tTarefa" value="${esc(a.tarefa||'')}" placeholder="Descreva a ação"></div>
      <div class="field wide"><label>Critério de pronto</label><input id="tCrit" value="${esc(a.criterio_pronto||'')}" placeholder="Quando consideramos concluída"></div>
      <div class="field"><label>Fase</label><select id="tFase">${faseSel}</select></div>
      <div class="field"><label>Frente</label><input id="tFrente" list="dlFrente" value="${esc(a.frente||'')}" placeholder="Ex.: Mídia"><datalist id="dlFrente">${datalistOpcoes('frente')}</datalist></div>
      <div class="field"><label>Setor</label><input id="tSetor" list="dlSetor" value="${esc(a.setor||'')}" placeholder="Ex.: DIGITAL E PERFORMANCE"><datalist id="dlSetor">${datalistOpcoes('setor')}</datalist></div>
      <div class="field"><label>Responsável</label><input id="tResp" list="dlResp" value="${esc(a.responsavel||'')}" placeholder="Ex.: Marketing"><datalist id="dlResp">${datalistOpcoes('responsavel')}</datalist></div>
      <div class="field"><label>Apoio</label><input id="tApoio" list="dlApoio" value="${esc(a.apoio||'')}" placeholder="(opcional)"><datalist id="dlApoio">${datalistOpcoes('apoio')}</datalist></div>
      <div class="field"><label>Prazo sugerido</label><input id="tPrazo" type="date" value="${a.prazo_sugerido||''}"></div>
      <div class="field"><label>Status</label><select id="tStatus">${statusSel}</select></div>
    </div>
    <div class="msg" id="tMsg"></div>
    <div class="modal-actions"><button class="btn btn-ghost" id="tCancel">Cancelar</button>
      <button class="btn btn-primary" id="tOk">${novo?'Criar tarefa':'Salvar alterações'}</button></div></div>`);
  $('#tCancel').onclick = fecharModal;
  $('#tOk').onclick = async function(){
    const tarefa = $('#tTarefa').value.trim();
    if(!tarefa){ $('#tMsg').className='msg err'; $('#tMsg').textContent='Informe a tarefa.'; return; }
    const faseNum = +$('#tFase').value;
    const campos = {
      tarefa,
      criterio_pronto: $('#tCrit').value.trim() || null,
      fase: FASES.find(f=>f.num===faseNum).nome,
      fase_num: faseNum,
      frente: $('#tFrente').value.trim() || null,
      setor: $('#tSetor').value.trim() || null,
      responsavel: $('#tResp').value.trim() || null,
      apoio: $('#tApoio').value.trim() || null,
      prazo_sugerido: $('#tPrazo').value || null,
      status: $('#tStatus').value
    };
    this.disabled = true; this.textContent = 'Salvando…';
    let error;
    if(novo){
      const naFase = state.acoes.filter(x=>x.fase_num===faseNum);
      const maxNum = naFase.reduce((m,x)=>{ const n=parseInt(String(x.codigo||'').split('-')[1],10); return isNaN(n)?m:Math.max(m,n); },0);
      campos.empreendimento_id = state.emp.id;
      campos.codigo = (PREFIXO_FASE[faseNum]||'EX') + '-' + String(maxNum+1).padStart(2,'0');
      campos.ordem = naFase.reduce((m,x)=>Math.max(m,x.ordem||0),0) + 1;
      const res = await sb.from('acoes').insert(campos).select().single();
      error = res.error; if(!error && res.data) state.acoes.push(res.data);
    } else {
      const res = await sb.from('acoes').update(campos).eq('id', acao.id).select().single();
      error = res.error; if(!error && res.data){ const i=state.acoes.findIndex(x=>x.id===acao.id); if(i>=0) state.acoes[i]=res.data; }
    }
    if(error){
      $('#tMsg').className='msg err';
      $('#tMsg').textContent = /row-level|policy|permission/i.test(error.message) ? 'Seu perfil não permite esta ação.' : error.message;
      this.disabled=false; this.textContent = novo?'Criar tarefa':'Salvar alterações'; return;
    }
    fecharModal(); toast(novo?'Tarefa criada ✓':'Tarefa atualizada ✓'); state.fase = faseNum; renderAtual();
  };
}
async function excluirTarefa(id){
  const a = state.acoes.find(x=>x.id===id); if(!a) return;
  if(!confirm('Excluir a tarefa "'+a.codigo+' · '+a.tarefa+'"?\n\nEsta ação não pode ser desfeita.')) return;
  const { error } = await sb.from('acoes').delete().eq('id', id);
  if(error){ toast(/row-level|policy|permission/i.test(error.message)?'Apenas administradores podem excluir.':'Erro ao excluir.'); return; }
  const i = state.acoes.findIndex(x=>x.id===id); if(i>=0) state.acoes.splice(i,1);
  toast('Tarefa excluída'); renderAtual();
}

/* =========================================================
   EVENTOS
   ========================================================= */
function wireEvents(){
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    $('#viewPainel').classList.toggle('hidden', t.dataset.view!=='painel');
    $('#viewChecklist').classList.toggle('hidden', t.dataset.view!=='checklist');
  });
  $('#empSelect').onchange = e => selecionarEmp(e.target.value);
  $('#btnSair').onclick = async()=>{ await sb.auth.signOut(); location.replace('index.html'); };
  $('#btnNovo').onclick = modalNovo;
  $('#btnEquipe').onclick = modalEquipe;
  $('#btnShare').onclick = modalShare;

  // Tema claro/escuro (lembra a escolha; padrão segue o sistema)
  const btnTema = $('#btnTema');
  const sincTema = ()=>{ btnTema.textContent = (document.documentElement.getAttribute('data-theme')==='dark') ? '☀' : '☾'; };
  sincTema();
  btnTema.onclick = ()=>{
    const novo = document.documentElement.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', novo);
    try{ localStorage.setItem('tema', novo); }catch(e){}
    sincTema();
  };

  // Delegação: abas de fase + edição de células
  $('#faseTabs').addEventListener('click', e=>{ const b=e.target.closest('.subtab'); if(b){ state.fase=+b.dataset.fase; renderChecklist(); } });
  ['busca','fSetor','fResp','fStatus'].forEach(id=>{ const el=$('#'+id); el.addEventListener('input',renderChecklist); el.addEventListener('change',renderChecklist); });
  const body=$('#acoesBody');
  body.addEventListener('change', e=>{ const el=e.target; if(el.dataset.f==='status'||el.dataset.f==='prazo_real'){ salvarCampo(el.dataset.id, el.dataset.f, el.value); } });
  body.addEventListener('blur', e=>{ const el=e.target; if(el.dataset.f==='observacao'){ const a=state.acoes.find(x=>x.id===el.dataset.id); if(a && (a.observacao||'')!==el.value) salvarCampo(el.dataset.id,'observacao',el.value); } }, true);
  body.addEventListener('click', e=>{
    const ed=e.target.closest('[data-edit]'); if(ed){ const a=state.acoes.find(x=>x.id===ed.dataset.edit); if(a) modalTarefa(a); return; }
    const de=e.target.closest('[data-del]'); if(de){ excluirTarefa(de.dataset.del); }
  });
  const bNova=$('#btnNovaTarefa'); if(bNova) bNova.onclick=()=>modalTarefa(null);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') fecharModal(); });
}

init();
})();
