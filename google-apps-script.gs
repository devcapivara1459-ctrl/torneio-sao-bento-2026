const API_URL = 'https://torneiosaobento.capivaratech.dev.br/api/inscricoes-google';
const GOOGLE_FORMS_SECRET = 'COLE_AQUI_O_MESMO_SEGREDO_DA_VERCEL';

function onFormSubmit(e) {
  const n = e.namedValues || {};
  const row = e.range ? e.range.getRow() : new Date().getTime();
  const sheetId = e.source ? e.source.getId() : 'planilha';
  const pick = (titulo) => (n[titulo] && n[titulo][0]) ? String(n[titulo][0]).trim() : '';

  const payload = {
    origem_id: `${sheetId}:${row}`,
    data_inscricao: pick('Carimbo de data/hora'),
    comunidade: pick('Qual sua comunidade?'),
    modalidade: pick('Qual a modalidade que deseja realizar a inscrição?'),
    responsavel: pick('Responsável pela equipe/contato'),
    jogadores: pick('Nome completo dos Jogadores'),
    regulamento: pick('De acordo com o regulamento?'),
    contribuicao: pick('Confirmação da contribuição'),
    dados_originais: n
  };

  const response = UrlFetchApp.fetch(API_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: {'x-google-forms-secret': GOOGLE_FORMS_SECRET},
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  console.log(response.getResponseCode(), response.getContentText());
}
