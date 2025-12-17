# Discord Bot

> Bot para Discord focado em Tormenta 20, feito em Node.js/TypeScript.

## Scripts principais

-   `npm run build` — Compila o projeto para a pasta `build`
-   `npm run start` — Executa o bot já compilado
-   `npm run dev` — Executa o bot em modo desenvolvimento (TypeScript direto)

## Estrutura e Padrões

-   **Aliases TypeScript:** Utilize imports como `#services`, `#utils`, `#database` (ver `tsconfig.json`)
-   **Barrel Exports:** Todas as pastas de domínio possuem `index.ts` exportando módulos agrupados
-   **Logger Estruturado:** Use sempre `logger` ao invés de `console.log/error` para logs padronizados
-   **Validação de Ambiente:** Variáveis `.env` validadas via Zod, mensagens centralizadas em `constants.json`

## Configuração

-   Edite `constants.json` para nome, prefixo e owner do bot
-   Crie `.env` com variáveis de ambiente (token, database, etc)

## Testes

-   (Recomendado) Adicione testes unitários com Jest ou Vitest
-   Exemplo de script: `npm run test`

## Scripts recomendados

-   `npm run build` — Compila o projeto
-   `npm run start` — Executa produção
-   `npm run dev` — Hot reload dev
-   `npm run test` — Executa testes (implemente)
-   `npm run backup` — (Sugestão) Script para backup do banco
-   `npm run deploy` — (Sugestão) Script para deploy automatizado

## Docker

Rode via Docker usando o `Dockerfile` e `docker-compose.yml` inclusos.

## Observações

-   **Deploy/Backup:** Scripts de deploy e backup são recomendados para produção
-   **Monitoramento:** Integre Sentry ou similar para monitoramento de erros
-   **Documentação:** Consulte os arquivos em `/docs` para detalhes de arquitetura, acervo, etc

---

Contribua! Veja `CONTRIBUTING.md` para diretrizes.
