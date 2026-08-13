const STATUS={aguardando:'Aguardando',proximo:'Próximo',andamento:'Em andamento',encerrado:'Encerrado',wo:'W.O.'};
let data={modalidades:[],partidas:[],chaveamentos:[],resultados:[]},sport='';
function esc(v=''){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function load(){
  const r=await fetch('/api/public');
  if(!r.ok) throw new Error('Falha ao carregar');
  data=await r.json();sport=data.modalidades[0]?.id||'';render();
}
function render(){
  const live=data.partidas.filter(x=>x.status==='andamento');
  document.querySelector('#live-text').textContent=live.length?`${live.length} partida${live.length>1?'s':''} em andamento`:'Nenhuma partida em andamento';
  const priority={andamento:0,proximo:1,encerrado:2,aguardando:3,wo:4};
  const games=[...data.partidas].sort((a,b)=>(priority[a.status]??9)-(priority[b.status]??9)||a.ordem-b.ordem).slice(0,6);
  document.querySelector('#highlight-games').innerHTML=games.length?games.map(g=>`<article class="game"><div class="game-head"><small>${esc(nameSport(g.modalidade_id))} • Jogo ${g.ordem}</small><span class="status ${g.status}">${STATUS[g.status]||g.status}</span></div><div class="teams"><div class="team"><span>${esc(g.participante_a)}</span><b>${g.placar_a??'–'}</b></div><div class="team"><span>${esc(g.participante_b)}</span><b>${g.placar_b??'–'}</b></div></div></article>`).join(''):'<div class="empty">As partidas aparecerão aqui quando a organização iniciar o torneio.</div>';
  const sel=document.querySelector('#sport-select');sel.innerHTML=data.modalidades.map(s=>`<option value="${s.id}">${esc(s.nome)}</option>`).join('');sel.value=sport;sel.onchange=e=>{sport=e.target.value;renderBracket()};
  renderBracket();renderRanking();
}
function nameSport(id){return data.modalidades.find(s=>s.id===id)?.nome||id}
function renderBracket(){
  const c=data.chaveamentos.find(x=>x.modalidade_id===sport),area=document.querySelector('#bracket-public');
  if(!c?.dados){area.innerHTML='<div class="empty">O chaveamento desta modalidade ainda não foi publicado pela organização.</div>';return}
  const d=c.dados;if(d.ranking?.length){area.innerHTML=`<div class="ranking">${d.ranking.map((r,i)=>`<div class="rank-row"><b>${i+1}º</b><strong>${esc(r.name)}</strong><span>${esc(r.time||r.score||'')}</span></div>`).join('')}</div>`;return}
  if(!d.rounds?.length){area.innerHTML='<div class="empty">O chaveamento desta modalidade ainda não foi iniciado.</div>';return}
  let html='<div class="bracket-scroll"><div class="bracket">';
  d.rounds.forEach((round,ri)=>{const title=round.length===1?'Final':round.length===2?'Semifinais':round.length===4?'Quartas de final':`Rodada ${ri+1}`;html+=`<section class="round"><h3>${title}</h3><div class="round-list">${round.map((m,mi)=>`<article class="match"><div class="match-label">JOGO ${mi+1}</div><div class="match-team ${m.winner?.name===m.a?.name?'winner':''}"><span>${esc(m.a?.name||'A definir')}</span><b>${m.sa??(m.winner?.name===m.a?.name?'✓':'')}</b></div><div class="match-team ${m.winner?.name===m.b?.name?'winner':''}"><span>${esc(m.b?.name||'A definir')}</span><b>${m.sb??(m.winner?.name===m.b?.name?'✓':'')}</b></div></article>`).join('')}</div></section>`});html+='</div></div>';const final=d.rounds.at(-1)?.[0];if(final?.winner)html+=`<div class="champion"><small>CAMPEÃO DA MODALIDADE</small><strong>🏆 ${esc(final.winner.name)}</strong></div>`;area.innerHTML=html;
}
function renderRanking(){
  const map={};data.resultados.forEach(s=>{if(!map[s.comunidade])map[s.comunidade]={community:s.comunidade,points:0,first:0,second:0,third:0,parts:0};const x=map[s.comunidade];x.points+=Number(s.pontos)||0;x.parts++;if(s.colocacao===1)x.first++;if(s.colocacao===2)x.second++;if(s.colocacao===3)x.third++});
  const rows=Object.values(map).sort((a,b)=>b.points-a.points||b.first-a.first||b.second-a.second||b.third-a.third||b.parts-a.parts);
  document.querySelector('#public-ranking').innerHTML=rows.length?rows.map((r,i)=>`<div class="rank-row"><b>${i+1}º</b><strong>${esc(r.community)}</strong><span>${r.points} pts</span></div>`).join(''):'<div class="empty">A classificação geral aparecerá quando os resultados forem registrados.</div>';
}
load().catch(()=>{document.querySelector('#highlight-games').innerHTML='<div class="empty">Não foi possível carregar os dados neste momento.</div>'});
setInterval(()=>load().catch(()=>{}),15000);
