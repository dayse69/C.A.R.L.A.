# 🤖 CARLA — Discord Bot para Tormenta 20

Bot de Discord focado no sistema **Tormenta 20**, desenvolvido em **Node.js + TypeScript**, com arquitetura modular, validação forte de ambiente e pronto para rodar tanto em desenvolvimento quanto em produção.

## Scripts principais

-   `npm run build` — Compila o projeto para a pasta `build`
-   `npm run start` — Executa o bot já compilado
-   `npm run dev` — Executa o bot em modo desenvolvimento (TypeScript direto)

## Estrutura e Padrões

-   **Aliases TypeScript:** Utilize imports como `#services`, `#utils`, `#database` (ver `tsconfig.json`)
-   **Barrel Exports:** Todas as pastas de domínio possuem `index.ts` exportando módulos agrupados
-   **Logger Estruturado:** Use sempre `logger` ao invés de `console.log/error` para logs padronizados
-   **Validação de Ambiente:** Variáveis `.env` validadas via Zod, mensagens centralizadas em `constants.json`

# CARLA — Estado Perfeito 🌟

## 📖 Sumário Rápido

-   [Visão Geral e Status](#carla--estado-perfeito-)
-   [Checklist de Instalação](CHECKLIST_DISCORD_BOT.md)
-   [Changelog](CHANGELOG.md)
-   [Guia de Contribuição](CONTRIBUTING.md)
-   [Status de Implementação](STATUS_IMPLEMENTACAO.md)



## ✨ Visão Geral

A **CARLA** foi pensada para ser:

-   🧠 **Organizada** — aliases de import, camadas bem definidas
-   🛠️ **Extensível** — serviços desacoplados, comandos modulares
-   🔐 **Segura** — nenhuma credencial versionada
-   🚀 **Pronta para produção** — build limpo, Docker-friendly

---

## 📦 Requisitos

-   **Node.js** 18+ (recomendado LTS)
-   **npm** ou **pnpm**
-   (Opcional) **Docker + Docker Compose**
-   (Opcional) **MongoDB** (local ou container)

---

## ⚙️ Instalação Rápida

```bash
npm install
cp .env.example .env
```

Preencha o `.env` com suas credenciais do Discord.

---

## ▶️ Scripts Principais

| Script          | Descrição                                           |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Executa em modo desenvolvimento (TypeScript direto) |
| `npm run build` | Compila o projeto para a pasta `build/`             |
| `npm start`     | Executa o bot já compilado                          |

> 💡 **Dica:** durante desenvolvimento, prefira `npm run dev`.

---

## 🧱 Estrutura do Projeto

```
src/            # Código-fonte (versionado)
build/          # Código compilado (ignorado pelo Git)
utils/          # Helpers, logger, permissões
services/       # Lógica de domínio
commands/       # Comandos do Discord
.env             # Variáveis locais (NUNCA versionar)
.env.example     # Exemplo de variáveis (versionado)
```

### 📜 Regra de Ouro

```
src/        → vai para o Git
build/      → NUNCA vai para o Git
.env        → local
.env.example → versionado
```

---

## 🧭 Padrões e Convenções

### 🔗 Aliases TypeScript

Utilize imports curtos e legíveis:

```ts
import { logger } from "#utils/logger";
import { connectDatabase } from "#database";
```

Configurados via `tsconfig.json`.

---

### 📦 Barrel Exports

Cada domínio possui um `index.ts` exportando seus módulos públicos, evitando imports profundos.

---

### 🪵 Logger Estruturado

-   ❌ Evite `console.log`
-   ✅ Use sempre `logger`

Isso garante logs padronizados e prontos para produção.

---

### 🔐 Validação de Ambiente

-   Variáveis de ambiente são validadas com **Zod**
-   Mensagens de erro centralizadas
-   Falhas de configuração quebram cedo (fail fast)

---

## 🧪 Fluxo de Desenvolvimento

### 💻 Desenvolvimento (PC / VS Code)

```bash
npm run dev
```

Ideal para:

-   criar comandos
-   ajustar serviços
-   debugar rapidamente

---

### 🖥️ Produção / Servidor (Notebook / Lubuntu)

```bash
docker compose up -d
```

ou

```bash
npm run build
npm start
```

O notebook atua como **servidor da CARLA**.

---

## 🔁 Fluxo Git (Importante)

O espelhamento **não é automático** — e isso é proposital.

Fluxo correto:

```
PC (VS Code)  → git push
Notebook     → git pull
```

Isso garante controle total do que entra em produção.

---

## 📌 Estado Atual do Repositório

```
✔️ Working tree clean
✔️ Sem conflitos
✔️ build/ fora do Git
✔️ Commits organizados
```

Projeto está em **estado estável e profissional**.

---

## 🚀 Publicando Alterações

```bash
git push
```

Se o GitHub pedir autenticação:

-   **Usuário:** `dayse69`
-   **Senha:** _Token de acesso do GitHub_

---

## 🧩 Próximos Passos (Opcional)

-   Padronizar definitivamente `DISCORD_TOKEN`
-   Refinar comandos administrativos
-   Expandir integração com MongoDB
-   Adicionar testes automatizados

---

💜 **CARLA não é só um bot — é uma base sólida para campanhas, compêndios e automações de Tormenta 20.**

## 📄 Documentação Técnica

Para visão completa de arquitetura, snapshot do código e sistema de auto-reparo:

👉 [CARLA_PROJECT_REPORT.md](./CARLA_PROJECT_REPORT.md)

Perfeito. Vou te entregar **os dois**, de forma **simples, visual e oficial**, prontos para entrar no README sem confundir você no futuro.

Vou separar em **(A) Diagrama simples** e **(B) Alinhamento oficial com Docker (dev vs prod)**.

---

# 🧭 A) Diagrama simples de funcionamento

Este diagrama explica **como a CARLA vive**, sem depender de hardware específico.

```
┌─────────────────────┐
│     PC PRINCIPAL     │
│  (VS Code / Windows) │
│─────────────────────│
│ • Edita src/         │
│ • Edita README.md   │
│ • npm run dev       │
│ • npm run build     │
│─────────────────────│
│ git commit / push   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│        GITHUB        │
│─────────────────────│
│ • Código versionado │
│ • README oficial    │
│ • src/              │
│ • docker-compose    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│      NOTEBOOK       │
│   (Lubuntu / Linux) │
│─────────────────────│
│ • git pull          │
│ • Docker            │
│ • MongoDB           │
│ • npm start         │
│ • docker compose up │
└─────────────────────┘
```

### 📌 Regra visual

* **Nada sobe sozinho**
* **Nada executa sem você mandar**
* **Git é a ponte**
* **Notebook é o “corpo” da CARLA**
* **PC é o “cérebro”**

---

# 🐳 B) Alinhamento oficial com Docker (DEV vs PROD)

Aqui a CARLA fica **profissional de verdade**.

---

## 🧪 Modo DEV (desenvolvimento)

📍 **Onde:** PC principal
📍 **Objetivo:** escrever, testar, quebrar e consertar

### Como roda

```bash
npm run dev
```

### Características

* Usa TypeScript direto (`ts-node`, `tsx`, etc)
* Não precisa Docker
* Não precisa Mongo real
* Logs verbosos
* Pode cair sem problema

### Estrutura

```
src/
.env
```

📎 **Nada aqui é permanente**

---

## 🚀 Modo PROD (execução / produção)

📍 **Onde:** Notebook (Lubuntu)
📍 **Objetivo:** manter a CARLA viva

### Como roda

```bash
docker compose up -d
```

ou

```bash
npm run build
npm start
```

### Características

* Usa código compilado (`build/`)
* Docker controla serviços
* Mongo ativo
* Reinício automático
* Logs de saúde

### Estrutura

```
src/
build/
.env
docker-compose.yml
```

📎 **Este é o estado real do bot online**

---

## 🔁 Relação DEV → PROD

```
DEV (PC)
 ├─ escreve src/
 ├─ testa
 ├─ git push
 ▼
PROD (Notebook)
 ├─ git pull
 ├─ npm run build
 └─ docker compose up -d
```

⚠️ **Nunca edite código direto no PROD**
⚠️ **Nunca rode Docker no PC sem motivo**

---

## 🧱 Regra oficial da CARLA (documentada)

```
src/        → sempre versionado
build/      → gerado, nunca versionado
.env        → específico de cada máquina
README.md   → único, vem do Git
```

---

## 🧠 Frase-chave (pra você nunca se perder)

> **O código não sabe onde está rodando.
> Quem decide o ambiente é você.**
