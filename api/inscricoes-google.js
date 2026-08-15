import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function send(res, status, data) {
  res
    .status(status)
    .setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );

  res.end(
    JSON.stringify(data)
  );
}

function body(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === 'object') {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function norm(v = '') {
  return String(v)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function yes(v = '') {
  const n = norm(v);

  return (
    n.includes('sim') ||
    n.includes('concordo') ||
    n.includes('ciente') ||
    n.includes('de acordo')
  );
}

export default async function handler(req, res) {

  // ==========================================================
  // PERMITIR SOMENTE POST
  // ==========================================================

  if (req.method !== 'POST') {
    return send(res, 405, {
      error: 'Método não permitido.'
    });
  }


  // ==========================================================
  // LER CORPO DA REQUISIÇÃO
  // ==========================================================

  const b = body(req);


  // ==========================================================
  // VERIFICAR CHAVE DA INTEGRAÇÃO
  // ==========================================================

  const recebido =
    String(
      b.secret || ''
    ).trim();

  const configurado =
    String(
      process.env.GOOGLE_FORMS_SECRET || ''
    ).trim();


  if (recebido !== configurado) {

    return send(res, 401, {

      error:
        'Integração não autorizada.',

      diagnostico: {

        secretExisteNaVercel:
          configurado.length > 0,

        tamanhoVercel:
          configurado.length,

        secretChegou:
          recebido.length > 0,

        tamanhoRecebido:
          recebido.length
      }
    });
  }


  // ==========================================================
  // PROCESSAR INSCRIÇÃO
  // ==========================================================

  try {

    const comunidade =
      String(
        b.comunidade || ''
      ).trim();

    const modalidadeRaw =
      String(
        b.modalidade || ''
      ).trim();

    const jogadores =
      String(
        b.jogadores || ''
      ).trim();


    // ========================================================
    // CAMPOS OBRIGATÓRIOS
    // ========================================================

    if (
      !b.origem_id ||
      !comunidade ||
      !modalidadeRaw ||
      !jogadores
    ) {

      return send(res, 400, {

        error:
          'Inscrição incompleta.',

        campos: {
          origem_id:
            Boolean(b.origem_id),

          comunidade:
            Boolean(comunidade),

          modalidade:
            Boolean(modalidadeRaw),

          jogadores:
            Boolean(jogadores)
        }
      });
    }


    // ========================================================
    // BUSCAR MODALIDADES NO NEON
    // ========================================================

    const mods = await sql`
      SELECT
        id,
        nome
      FROM modalidades
      WHERE ativa = true
    `;


    // ========================================================
    // TENTAR IDENTIFICAR MODALIDADE
    // ========================================================

    const wanted =
      norm(
        modalidadeRaw
      );


    const modalidade =
      mods.find(m => {

        const nome =
          norm(
            m.nome
          );

        return (
          wanted.includes(nome) ||
          nome.includes(wanted)
        );

      }) || null;


    // ========================================================
    // PROCURAR POSSÍVEL INSCRIÇÃO DUPLICADA
    // ========================================================

    const dup = await sql`

      SELECT
        id

      FROM inscricoes

      WHERE

        lower(
          trim(comunidade)
        )
        =
        lower(
          trim(${comunidade})
        )

      AND

        lower(
          trim(modalidade_raw)
        )
        =
        lower(
          trim(${modalidadeRaw})
        )

      AND

        lower(
          trim(jogadores_raw)
        )
        =
        lower(
          trim(${jogadores})
        )

      AND

        status <> 'rejeitada'

      ORDER BY
        created_at DESC

      LIMIT 1
    `;


    // ========================================================
    // DEFINIR STATUS
    // ========================================================

    const possuiDuplicidade =
      dup.length > 0;

    const status =
      possuiDuplicidade
        ? 'duplicada'
        : 'pendente';


    // ========================================================
    // SALVAR NO NEON
    // ========================================================

    const rows = await sql`

      INSERT INTO inscricoes (

        origem,
        origem_id,

        data_inscricao,

        comunidade,

        modalidade_raw,
        modalidade_id,

        responsavel_contato,

        jogadores_raw,

        regulamento_aceito,
        contribuicao_ciente,

        status,

        possivel_duplicidade,

        duplicada_de,

        dados_originais

      )

      VALUES (

        'google_forms',

        ${String(
          b.origem_id
        )},

        ${
          b.data_inscricao ||
          null
        },

        ${comunidade},

        ${modalidadeRaw},

        ${
          modalidade?.id ||
          null
        },

        ${
          String(
            b.responsavel || ''
          ).trim()
          ||
          null
        },

        ${jogadores},

        ${
          yes(
            b.regulamento
          )
        },

        ${
          yes(
            b.contribuicao
          )
        },

        ${status},

        ${
          possuiDuplicidade
        },

        ${
          dup[0]?.id ||
          null
        }::uuid,

        ${
          JSON.stringify(
            b.dados_originais || b
          )
        }::jsonb

      )

      ON CONFLICT (
        origem,
        origem_id
      )

      DO UPDATE SET

        data_inscricao =
          excluded.data_inscricao,

        comunidade =
          excluded.comunidade,

        modalidade_raw =
          excluded.modalidade_raw,

        modalidade_id =
          excluded.modalidade_id,

        responsavel_contato =
          excluded.responsavel_contato,

        jogadores_raw =
          excluded.jogadores_raw,

        regulamento_aceito =
          excluded.regulamento_aceito,

        contribuicao_ciente =
          excluded.contribuicao_ciente,

        dados_originais =
          excluded.dados_originais,

        updated_at =
          now()

      RETURNING

        id,

        status,

        possivel_duplicidade,

        modalidade_id
    `;


    // ========================================================
    // RESPOSTA DE SUCESSO
    // ========================================================

    return send(res, 201, {

      ok: true,

      message:
        possuiDuplicidade
          ? 'Inscrição recebida e marcada como possível duplicidade.'
          : 'Inscrição recebida com sucesso.',

      inscricao:
        rows[0]
    });


  } catch (error) {

    console.error(error);

    return send(res, 500, {

      error:
        'Erro ao registrar inscrição.',

      detail:
        String(
          error?.message ||
          error
        )
    });
  }
}
