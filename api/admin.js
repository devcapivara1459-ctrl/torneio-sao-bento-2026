import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function send(res,status,data){
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}
function body(req){
  if(!req.body) return {};
  if(typeof req.body==='object') return req.body;
  try{return JSON.parse(req.body)}catch{return {}}
}
function auth(req){
  return Boolean(process.env.ADMIN_PASSWORD) &&
    req.headers['x-admin-password']===process.env.ADMIN_PASSWORD;
}
export default async function handler(req,res){
  try{
    const action=String(req.query?.action||'');
    if(action==='login'){
      if(req.method!=='POST') return send(res,405,{error:'Método não permitido.'});
      return auth(req)?send(res,200,{ok:true}):send(res,401,{error:'Senha inválida.'});
    }
    if(!auth(req)) return send(res,401,{error:'Não autorizado.'});

    if(req.method==='GET' && action==='state'){
      const [modalidades,participantes,partidas,chaveamentos,resultados]=await Promise.all([
        sql`SELECT id,nome,icone,descricao,tipo,ativa FROM modalidades WHERE ativa=true ORDER BY nome`,
        sql`SELECT id,nome,comunidade,modalidade_id,tipo FROM participantes ORDER BY created_at`,
        sql`SELECT id,modalidade_id,fase,ordem,participante_a,participante_b,comunidade_a,comunidade_b,placar_a,placar_b,status,vencedor,bracket_match_id FROM partidas ORDER BY ordem,created_at`,
        sql`SELECT modalidade_id,dados FROM chaveamentos`,
        sql`SELECT id,modalidade_id,comunidade,colocacao,pontos FROM resultados_modalidades ORDER BY created_at`
      ]);
      return send(res,200,{modalidades,participantes,partidas,chaveamentos,resultados});
    }

    if(req.method!=='POST') return send(res,405,{error:'Método não permitido.'});
    const b=body(req);

    if(action==='participant-save'){
      if(!b.nome||!b.comunidade||!b.modalidade_id||!b.tipo) return send(res,400,{error:'Dados obrigatórios ausentes.'});
      if(b.id){
        const rows=await sql`UPDATE participantes SET nome=${b.nome},comunidade=${b.comunidade},modalidade_id=${b.modalidade_id},tipo=${b.tipo},updated_at=now() WHERE id=${b.id}::uuid RETURNING id,nome,comunidade,modalidade_id,tipo`;
        return send(res,200,rows[0]);
      }
      const rows=await sql`INSERT INTO participantes(nome,comunidade,modalidade_id,tipo) VALUES(${b.nome},${b.comunidade},${b.modalidade_id},${b.tipo}) RETURNING id,nome,comunidade,modalidade_id,tipo`;
      return send(res,201,rows[0]);
    }

    if(action==='participant-delete'){
      await sql`DELETE FROM participantes WHERE id=${b.id}::uuid`;
      return send(res,200,{ok:true});
    }

    if(action==='match-save'){
      if(!b.modalidade_id||!b.participante_a||!b.participante_b) return send(res,400,{error:'Partida incompleta.'});
      if(b.id){
        const rows=await sql`UPDATE partidas SET modalidade_id=${b.modalidade_id},fase=${b.fase||null},ordem=${Number(b.ordem)||1},participante_a=${b.participante_a},participante_b=${b.participante_b},comunidade_a=${b.comunidade_a||null},comunidade_b=${b.comunidade_b||null},placar_a=${b.placar_a??null},placar_b=${b.placar_b??null},status=${b.status||'aguardando'},vencedor=${b.vencedor||null},bracket_match_id=${b.bracket_match_id||null},updated_at=now() WHERE id=${b.id}::uuid RETURNING *`;
        return send(res,200,rows[0]);
      }
      const rows=await sql`INSERT INTO partidas(modalidade_id,fase,ordem,participante_a,participante_b,comunidade_a,comunidade_b,placar_a,placar_b,status,vencedor,bracket_match_id) VALUES(${b.modalidade_id},${b.fase||null},${Number(b.ordem)||1},${b.participante_a},${b.participante_b},${b.comunidade_a||null},${b.comunidade_b||null},${b.placar_a??null},${b.placar_b??null},${b.status||'aguardando'},${b.vencedor||null},${b.bracket_match_id||null}) RETURNING *`;
      return send(res,201,rows[0]);
    }

    if(action==='match-delete'){
      await sql`DELETE FROM partidas WHERE id=${b.id}::uuid`;
      return send(res,200,{ok:true});
    }

    if(action==='bracket-save'){
      await sql`INSERT INTO chaveamentos(modalidade_id,dados,updated_at) VALUES(${b.modalidade_id},${JSON.stringify(b.dados)}::jsonb,now()) ON CONFLICT(modalidade_id) DO UPDATE SET dados=excluded.dados,updated_at=now()`;
      return send(res,200,{ok:true});
    }

    if(action==='score-add'){
      const place=Number(b.colocacao),points=place===1?10:place===2?7:place===3?5:1;
      const rows=await sql`INSERT INTO resultados_modalidades(modalidade_id,comunidade,colocacao,pontos) VALUES(${b.modalidade_id},${b.comunidade},${place},${points}) RETURNING id,modalidade_id,comunidade,colocacao,pontos`;
      return send(res,201,rows[0]);
    }

    if(action==='score-delete'){
      await sql`DELETE FROM resultados_modalidades WHERE id=${b.id}::uuid`;
      return send(res,200,{ok:true});
    }

    return send(res,404,{error:'Ação não encontrada.'});
  }catch(error){
    console.error(error);
    return send(res,500,{error:'Erro interno da API.',detail:String(error?.message||error)});
  }
}
