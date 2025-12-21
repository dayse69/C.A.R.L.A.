# Workaround: Corrigindo Imports Relativos para .js no Build

## Contexto

Devido a limitações do TypeScript com ESM (NodeNext), imports relativos precisam terminar com `.js` no output. O TypeScript não converte automaticamente imports de `.ts` para `.js` no build, causando erros de execução.

## Solução

Foi criado o script `scripts/fix-import-extensions.js` que percorre todos os arquivos `.js` no diretório `build/` e ajusta os imports relativos para terminarem com `.js`.

### Como usar

1. Execute o build normalmente:
    ```sh
    npm run build
    ```
2. Execute o script de correção:
    ```sh
    node scripts/fix-import-extensions.js
    ```
3. Agora o output em `build/` estará com todos os imports relativos corrigidos para `.js`.

## Observações

-   O script só altera imports relativos ("./" ou "../").
-   Não altera imports de pacotes externos.
-   Recomendado adicionar este passo ao seu pipeline de build.

---

Dúvidas? Consulte este documento ou abra uma issue.
