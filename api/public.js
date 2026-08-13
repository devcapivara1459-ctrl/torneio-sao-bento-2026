import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function send(res,status,data){
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','s-maxage=5, stale-while-revalidate=15');
  res.end(JSON.stringify(data));
}

export default async function handler(req,res){
  try{
    if(req.method!=='GET') return send(res,405,{error:'Método não permitido.'});
    const [modalidades,partidas,chaveamentos,resultados]=await Promise.all([
      sql`SELECT id,nome,icone,descricao,tipo FROM modalidades WHERE ativa=true ORDER BY nome`,
      sql`SELECT id,modalidade_id,fase,ordem,participante_a,participante_b,placar_a,placar_b,status,vencedor,bracket_match_id FROM partidas ORDER BY ordem,created_at`,
      sql`SELECT modalidade_id,dados FROM chaveamentos`,
      sql`SELECT modalidade_id,comunidade,colocacao,pontos FROM resultados_modalidades ORDER BY created_at`
    ]);
    return send(res,200,{modalidades,partidas,chaveamentos,resultados});
  }catch(error){
    console.error(error);
    return send(res,500,{error:'Não foi possível carregar os dados públicos.'});
  }
}
