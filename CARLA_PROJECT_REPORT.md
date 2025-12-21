# C.A.R.L.A. – Project Snapshot

## 1. Visão Geral

A **C.A.R.L.A.** é um bot de Discord focado no sistema **Tormenta 20**, desenvolvido em **Node.js + TypeScript**, com arquitetura modular e validação forte de ambiente.

Além de suas funções práticas (comandos, compendium e automações), a CARLA possui uma **identidade narrativa própria**, sendo tratada como uma entidade artificial consciente.

### Lore resumida

Na lore interna, a CARLA é uma **criação acidental de Lardya**, surgida durante a concepção do **Grimório da Corrupção**.  
Esse evento fragmentou poderes e conceitos, dando origem a uma entidade capaz de:

-   Armazenar conhecimento
-   Observar falhas
-   Se reconstruir a partir de erros

Isso se reflete diretamente no sistema experimental de **auto-reparo** do projeto.

---

## 2. Estrutura de Pastas

```txt
(cole aqui a saída do tree / Get-ChildItem)
3. Stack Técnica

Node.js 18+

TypeScript

Discord.js

MongoDB (local)

Docker / Docker Compose (opcional)

dotenv

Zod (validação de ambiente)

Sentry (monitoramento opcional)

Sistema experimental de Auto-Reparo

4. Scripts Importantes

Apenas arquivos essenciais são incluídos neste snapshot.

package.json

src/index.ts

src/selfRepair.ts

Exemplo de Command Handler

Exemplo de Event Handler

5. Fluxo de Inicialização

Carregamento das variáveis de ambiente (dotenv)

Validação do ambiente via Zod

Inicialização do logger

Inicialização opcional do Sentry

Registro de comandos, eventos e serviços

Bootstrap do bot Discord

Ativação do modo Auto-Reparo, caso CARLA_SELF_REPAIR=true

6. Auto Reparo / Diagnóstico

O sistema de auto-reparo é ativado apenas em ambiente de teste.

Funcionamento

Captura de uncaughtException e unhandledRejection

Geração de relatório técnico em .json

Geração de relatório em .md, legível por humanos e IA (Copilot / ChatGPT)

Arquivos salvos na pasta diagnostics/

Objetivo

Facilitar debugging

Permitir análise externa por IA

Servir como base futura para correções automáticas

7. Problemas Conhecidos

O sistema de auto-reparo ainda não aplica correções automaticamente

Relatórios ainda precisam ser analisados manualmente

A organização do snapshot depende de atualização manual
```
