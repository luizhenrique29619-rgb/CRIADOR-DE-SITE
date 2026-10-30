/* =========================================================
   MODO APRESENTAÇÃO (público, somente leitura)
   Lê os dados pela função painel_publico(token) do Supabase.
   Sem login, sem edição. O token no link é a chave de acesso.
   ========================================================= */
(function(){
"use strict";
const sb = window.sb;
const esc = s => (s==null?'':String(s)).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ST_CLASS = {'PRONTO PARA INICIAR':'st-pronto','EM ANDAMENTO':'st-andamento','CONCLUÍDO':'st-concluido','PENDENTE':'st-pendente','ATRASADO':'st-atrasado','NÃO SE APLICA':'st-na'};
const FASES=[{num:1,nome:'FUTURO LANÇAMENTO',janela:'D-10 a D-5'},{num:2,nome:'BREVE LANÇAMENTO',janela:'D-4 a D-3'},
  {num:3,nome:'PRÉ-LANÇAMENTO',janela:'D-2 a D-1'},{num:4,nome:'LANÇAMENTO',janela:'D0 a D+1'},{num:5,nome:'MANUTENÇÃO',janela:'D+1 em diante'}];
const hoje=()=>{const d=new Date();d.setHours(0,0,0,0);return d;};
const parseD=s=>{ if(!s) return null; const d=new Date(s+'T00:00:00'); return isNaN(d)?null:d; };
const fmtD=s=>{ const d=parseD(s); return d?d.toLocaleDateString('pt-BR'):'—'; };
function atrasada(a){ if(a.status==='CONCLUÍDO'||a.status==='NÃO SE APLICA') return false; if(a.status==='ATRASADO') return true; const d=parseD(a.prazo_real||a.prazo_sugerido); return d?d<hoje():false; }
function alerta(a){ if(a.status==='CONCLUÍDO') return {cls:'al-ok',txt:'Concluído'}; if(a.status==='NÃO SE APLICA') return {cls:'al-none',txt:'N/A'};
  const d=parseD(a.prazo_real||a.prazo_sugerido); if(!d) return {cls:'al-none',txt:'—'}; const dias=Math.round((d-hoje())/86400000);
  if(dias<0) return {cls:'al-late',txt:'Vencida há '+Math.abs(dias)+'d'}; if(dias<=3) return {cls:'al-warn',txt:'Vence em '+dias+'d'}; return {cls:'al-ok',txt:'No prazo'}; }

async function run(){
  const token = new URLSearchParams(location.search).get('token');
  const erro=()=>{ document.getElementById('pLoading').classList.add('hidden'); document.getElementById('pErro').classList.remove('hidden'); };
  if(!sb || !token){ erro(); return; }

  const { data, error } = await sb.rpc('painel_publico', { p_slug: token });
  if(error || !data){ erro(); return; }

  const emp=data.empreendimento, acoes=data.acoes||[];
  document.getElementById('pNome').textContent = emp.nome;
  document.getElementById('pMeta').textContent =
    [emp.praca, emp.consultoria, 'D0: '+fmtD(emp.data_d0)].filter(Boolean).join('  ·  ');

  // Agregados
  const total=acoes.length;
  let concl=0,andam=0,atras=0,na=0;
  acoes.forEach(a=>{ if(a.status==='CONCLUÍDO')concl++; else if(a.status==='EM ANDAMENTO')andam++; if(a.status==='NÃO SE APLICA')na++; if(atrasada(a))atras++; });
  const efet=Math.max(1,total-na), pct=Math.round(concl/efet*100);

  document.getElementById('pKpis').innerHTML=`
    <div class="kpi accent"><div class="lbl">% Geral concluído</div><div class="val">${pct}%</div></div>
    <div class="kpi"><div class="lbl">Total de ações</div><div class="val">${total}</div></div>
    <div class="kpi"><div class="lbl">Concluídas</div><div class="val ok">${concl}</div></div>
    <div class="kpi"><div class="lbl">Em andamento</div><div class="val run">${andam}</div></div>
    <div class="kpi"><div class="lbl">Atrasadas</div><div class="val late">${atras}</div></div>`;
  document.getElementById('pProg').innerHTML=
    `<span class="s-ok" style="width:${concl/efet*100}%"></span><span class="s-run" style="width:${andam/efet*100}%"></span><span class="s-late" style="width:${atras/efet*100}%"></span>`;
  document.getElementById('pProgHint').textContent=`${concl} de ${total} ações concluídas · ${andam} em andamento · ${atras} atrasadas`;

  document.getElementById('pFases').innerHTML=FASES.map(f=>{
    const it=acoes.filter(a=>a.fase_num===f.num), t=it.length, c=it.filter(a=>a.status==='CONCLUÍDO').length,
      at=it.filter(atrasada).length, nn=it.filter(a=>a.status==='NÃO SE APLICA').length, p=t?Math.round(c/Math.max(1,t-nn)*100):0;
    return `<tr><td class="code">${f.num}</td><td><b>${esc(f.nome)}</b></td><td class="setor-tag">${f.janela}</td>
      <td class="num">${t}</td><td class="num">${c}</td><td class="num">${at}</td>
      <td><b>${p}%</b><div class="mini-bar"><span style="width:${p}%"></span></div></td></tr>`;
  }).join('');

  // Detalhe por fase (checklist completo, leitura)
  document.getElementById('pFasesDetalhe').innerHTML = FASES.map(f=>{
    const it=acoes.filter(a=>a.fase_num===f.num); if(!it.length) return '';
    return `<div class="tablecard"><table class="std"><thead>
      <tr><th colspan="6" style="background:var(--brand);color:#fff;font-size:13px">${esc(f.nome)} · ${f.janela}</th></tr>
      <tr><th>Código</th><th>Tarefa</th><th>Setor</th><th>Responsável</th><th>Status</th><th>Alerta</th></tr></thead><tbody>${
      it.map(a=>{ const al=alerta(a); return `<tr>
        <td class="code">${esc(a.codigo)}</td>
        <td class="tarefa"><b>${esc(a.tarefa)}</b><small>${esc(a.criterio_pronto||'')}</small></td>
        <td class="setor-tag">${esc(a.setor||'')}</td>
        <td>${esc(a.responsavel||'—')}</td>
        <td><span class="status ${ST_CLASS[a.status]}">${esc(a.status)}</span></td>
        <td><span class="badge ${al.cls}">${al.txt}</span></td></tr>`; }).join('')
    }</tbody></table></div>`;
  }).join('');

  document.getElementById('pLoading').classList.add('hidden');
  document.getElementById('pContent').classList.remove('hidden');
}
run();
})();
