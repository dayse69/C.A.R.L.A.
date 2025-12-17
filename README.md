# Discord Bot

Este é um bot para Discord feito em Node.js/TypeScript.

## Scripts principais
- `npm run build` — Compila o projeto para a pasta `build`
- `npm run start` — Executa o bot já compilado
- `npm run dev` — Executa o bot em modo desenvolvimento (TypeScript direto)

## Configuração
- Edite o arquivo `constants.json` para definir nome, prefixo e owner do bot.
- Crie um arquivo `.env` com suas variáveis de ambiente (token, database, etc).

## Dependências principais
- discord.js
- zod
- chalk

## Docker
Se desejar rodar via Docker, utilize o `Dockerfile` já incluso.
