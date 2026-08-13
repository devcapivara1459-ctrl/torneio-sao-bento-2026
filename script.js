const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('nav');
toggle?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const data={
futsal:{title:'Futsal Juvenil',items:['14 a 26 anos, masculino e feminino.','5 titulares e até 5 reservas.','Partidas: 2 tempos de 7 minutos corridos, com intervalo de 3 minutos.','Substituições livres e ilimitadas.','Empate na fase classificatória: 3 cobranças de pênaltis para cada equipe.','W.O. após 10 minutos: 3 × 0 para a equipe presente.']},
junior:{title:'Futsal Junior',items:['7 a 13 anos, masculino e feminino.','5 titulares e até 5 reservas.','Segue as regras do regulamento de futsal com as adaptações previstas.','Empate e W.O. seguem o sistema definido para o futsal.']},
volei:{title:'Voleibol Misto',items:['15 a 26 anos.','4 titulares e até 4 reservas.','Deve haver no mínimo uma mulher em quadra durante toda a partida.','Melhor de 3 sets: 21, 21 e tie-break de 15 pontos.','É necessária vantagem mínima de 2 pontos.','W.O. após 10 minutos.']},
queimada:{title:'Queimada Mista',items:['15 a 26 anos.','10 atletas: obrigatoriamente 5 homens e 5 mulheres.','Partida com duração máxima de 10 minutos.','Vence quem eliminar todos os adversários ou tiver mais atletas em jogo ao fim do tempo.','W.O. se a equipe não estiver completa após 10 minutos.']},
domino:{title:'Dominó',items:['Idade livre.','Dupla por comunidade: masculina, feminina ou mista.','Cada participante recebe 7 peças.','A dupla vence ao chegar a 200 pontos e cumprir uma das condições previstas.','Em partida fechada, vence a dupla com menor soma das peças restantes.']},
xadrez:{title:'Xadrez',items:['15 a 26 anos.','1 titular e 1 reserva por comunidade.','Cada jogador terá 10 minutos para todos os movimentos.','Regras oficiais de xadrez, com adaptações do regulamento.','Celular, consulta externa ou auxílio podem resultar em perda da partida.']},
travinha:{title:'Travinha Infantil',items:['7 a 10 anos.','1 participante por comunidade.','Cada participante tem 5 finalizações.','Cada gol vale 1 ponto.','Empate: nova rodada com 3 finalizações.']},
corrida:{title:'Corrida de 3 KM',items:['Idade livre.','5 participantes por comunidade.','Percurso total de 3 km definido e sinalizado pela organização.','Classificação pela ordem de chegada e menor tempo.','É permitido caminhar durante o percurso.']},
saco:{title:'Corrida de Saco',items:['10 a 14 anos.','1 participante por comunidade.','O participante deve permanecer dentro do saco durante o percurso.','Vence quem cruzar primeiro a linha de chegada dentro do saco.','Em empate, haverá nova corrida.']},
cabo:{title:'Cabo de Guerra',items:['Idade livre.','10 participantes: 5 homens e 5 mulheres.','A composição deve ser mantida durante a disputa.','Não é permitido enrolar ou amarrar a corda ao corpo.','A organização poderá interromper a prova por segurança.']}
};
const modal=document.querySelector('#modal'), content=document.querySelector('#modal-content');
document.querySelectorAll('[data-modal]').forEach(btn=>btn.addEventListener('click',()=>{
 const d=data[btn.dataset.modal]; if(!d)return;
 content.innerHTML=`<h2>${d.title}</h2><ul>${d.items.map(x=>`<li>${x}</li>`).join('')}</ul>`;
 modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}));
document.querySelector('.modal-close').addEventListener('click',closeModal);
document.querySelector('.modal-backdrop').addEventListener('click',closeModal);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}

// Integração da seção de inscrições incorporada.
document.querySelectorAll('a[href="#inscricoes"]').forEach(link=>{link.addEventListener('click',()=>{setTimeout(()=>{const form=document.querySelector('.registration-form-wrap');form?.classList.add('form-focus');setTimeout(()=>form?.classList.remove('form-focus'),1200)},350)})});
