# Painel Administrativo + Neon

## O que mudou
Esta versão usa Neon Postgres no lugar do localStorage.

## Arquivos principais
- admin/login.html
- admin/index.html
- admin/admin.js
- api/admin.js
- package.json
- .env.example

## Variáveis na Vercel
Configure:
- DATABASE_URL
- ADMIN_PASSWORD

Não coloque DATABASE_URL no HTML ou no JavaScript público.

## Acesso
Depois do deploy:
- /admin/login.html

## Banco
O schema do torneio já foi aplicado ao projeto Neon desta aplicação.
