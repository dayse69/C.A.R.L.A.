# Checklist de Instalação e Configuração de Bot Discord

## Passos Padrão

1. Criar aplicação no Discord Developer Portal
2. Adicionar bot à aplicação e copiar o token
3. Configurar permissões e intents necessárias
4. Clonar ou criar o projeto localmente
5. Criar arquivo `.env` com variáveis (BOT_TOKEN, etc)
6. Instalar dependências (`npm install`)
7. Configurar arquivos do projeto (constants, configs)
8. (Opcional) Configurar banco de dados
9. Rodar o bot (`npm run dev` ou `npm start`)
10. Registrar comandos no Discord
11. Adicionar bot ao servidor
12. Testar comandos
13. (Opcional) Configurar Docker
14. (Opcional) Configurar CI/CD

---

## Comparação com o Projeto Atual

-   [x] Estrutura Node.js/TypeScript completa
-   [x] Uso de `.env` documentado
-   [x] Dependências instaladas e listadas
-   [x] Configuração centralizada (constants.json, tsconfig.json)
-   [x] MongoDB integrado e documentado
-   [x] Scripts npm para build/dev/start
-   [x] Suporte a Docker (Dockerfile, docker-compose)
-   [x] Registro de comandos documentado
-   [x] Testes e scripts presentes
-   [x] Documentação detalhada em `/docs`
-   [ ] CI/CD explícito (pode ser adicionado)

Seu projeto cobre todos os passos essenciais e está acima da média em organização e automação.
