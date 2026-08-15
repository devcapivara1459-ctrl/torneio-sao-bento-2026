V4 - Integração Google Forms

1. Vercel > Settings > Environment Variables:
   GOOGLE_FORMS_SECRET = crie uma chave longa e aleatória.

2. Abra google-apps-script.gs e substitua COLE_AQUI_O_MESMO_SEGREDO_DA_VERCEL pela mesma chave.

3. Na planilha de respostas: Extensões > Apps Script. Cole o conteúdo do arquivo.

4. Em Apps Script > Acionadores > Adicionar acionador:
   Função: onFormSubmit
   Origem do evento: Da planilha
   Tipo de evento: Ao enviar formulário

5. Faça um envio de teste pelo Google Forms e abra Admin > Inscrições.

Observação: respostas antigas da planilha não são importadas automaticamente por este gatilho.
