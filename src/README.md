# 📁 Arquitetura do Código Fonte

## 🏗️ Estrutura de Diretórios

```
src/
├── database/           # Camada de dados e repositórios
├── discord/           # Integração Discord.js
│   ├── base/         # Framework base (@magicyan/discord)
│   ├── commands/     # Comandos slash
│   ├── events/       # Event handlers
│   └── responders/   # Interações (botões, selects)
├── services/         # Lógica de negócio
├── ui/              # Interface do usuário
│   ├── embeds/      # Discord embeds
│   ├── cards/       # Visual cards
│   ├── menus/       # Dropdowns e selects
│   └── modals/      # Formulários modais
├── utils/           # Utilitários e helpers
├── functions/       # Funções auxiliares
├── env.ts           # Variáveis de ambiente
└── index.ts         # Entry point
```

---

## 📦 Módulos Principais

### 🗄️ `/database/`
**Responsabilidade:** Persistência e acesso a dados

- `mongodb.ts` - Configuração e conexão MongoDB
- `models.ts` - Schemas e interfaces TypeScript
- `CharacterRepository.ts` - CRUD de personagens
- `CompendiumRepository.ts` - Acesso ao compêndio
- `DatabaseSeeder.ts` - Populate inicial do banco

**Padrão:** Repository Pattern

### 🤖 `/discord/`
**Responsabilidade:** Integração com Discord API

#### `/discord/commands/`
Comandos slash registrados no Discord:
- `ficha.ts` - Gerenciar fichas de personagens
- `t20-roll.ts` - Sistema de rolagem Tormenta 20
- `ping.ts` - Health check
- `counter.ts` - Exemplo de contador
- `guild.ts` - Informações do servidor

#### `/discord/responders/`
Handlers de interações:
- `buttons/` - Resposta a botões clicados
- `selects/ficha-menu.ts` - Menu de navegação de fichas

#### `/discord/events/`
Event listeners:
- `error.ts` - Error handling global

### ⚙️ `/services/`
**Responsabilidade:** Lógica de negócio isolada

- `fichaService.ts` - Criação e manipulação de fichas
- `rollService.ts` - Sistema de rolagem de dados
- `compendiumService.ts` - Cache e acesso ao compêndio

**Padrão:** Service Layer + Singleton (cache)

### 🎨 `/ui/`
**Responsabilidade:** Interface visual Discord

- `embeds/fichaEmbeds.ts` - Embeds formatados de fichas
- `cards/profileCard.ts` - Cards visuais de perfil (ANSI)
- `menus/` - Componentes de select menu
- `modals/` - Formulários interativos

### 🔧 `/utils/`
**Responsabilidade:** Helpers e constantes

- `constants.ts` - Emojis, cores, valores fixos

---

## 🔄 Fluxo de Dados

```
Discord User
    ↓
Command Handler (/discord/commands/)
    ↓
Service Layer (/services/)
    ↓
Repository (/database/)
    ↓
MongoDB
    ↓
UI Components (/ui/)
    ↓
Discord Response
```

---

## 🎯 Convenções de Código

### Nomenclatura
- **Arquivos:** camelCase.ts
- **Classes:** PascalCase
- **Funções:** camelCase
- **Constantes:** UPPER_SNAKE_CASE
- **Interfaces:** PascalCase (prefixo I opcional)

### Imports
```typescript
// 1. Node modules
import { Collection } from "mongodb";

// 2. Discord.js
import { EmbedBuilder } from "discord.js";

// 3. Internos com alias
import { createCommand } from "#base";
import { env } from "#env";

// 4. Relativos
import { CharacterRepository } from "../../database/CharacterRepository.js";
```

### Async/Await
```typescript
// Sempre usar try/catch em comandos
async run(interaction) {
    try {
        const result = await service.doSomething();
        await interaction.reply({ content: result });
    } catch (error) {
        console.error("Error:", error);
        await interaction.reply({ 
            content: "❌ Erro ao processar comando",
            flags: ["Ephemeral"] 
        });
    }
}
```

---

## 🧪 Testes (em implementação)

```
src/
├── services/
│   ├── fichaService.ts
│   └── __tests__/
│       └── fichaService.test.ts
```

---

## 📊 Dependências Principais

- **discord.js** (14.22.1) - API Discord
- **@magicyan/discord** (1.5.2) - Framework de comandos
- **mongodb** (6.12.0) - Driver MongoDB
- **typescript** (5.7.2) - Type safety

---

## 🚀 Como Adicionar Funcionalidades

### Novo Comando Slash
1. Criar arquivo em `src/discord/commands/public/`
2. Usar `createCommand()` do framework
3. Implementar lógica em `src/services/`
4. Compilar e reiniciar bot

### Novo Responder (Botão/Select)
1. Criar em `src/discord/responders/buttons/` ou `selects/`
2. Definir customId pattern
3. Handler é registrado automaticamente

### Nova Feature
1. Service em `src/services/`
2. Repository em `src/database/` (se precisar DB)
3. UI components em `src/ui/`
4. Comando em `src/discord/commands/`

---

*Documentação atualizada: Dezembro 2025*
