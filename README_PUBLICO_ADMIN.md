# Separação Público x Administração

## Público
- `index.html`: informações gerais e inscrições.
- `resultados.html`: somente leitura de jogos, resultados, chaveamentos e classificação.
- Nenhum botão de cadastro, geração de chave ou edição é exposto ao público.

## Administração
- `admin/login.html`: login da organização.
- `admin/index.html`: gerenciamento completo.

## API
- `/api/public`: leitura pública dos resultados.
- `/api/admin`: operações protegidas pela senha do administrador.

O público nunca recebe a senha nem a connection string do Neon.
