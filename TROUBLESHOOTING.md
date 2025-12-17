# Troubleshooting - C.A.R.L.A Bot

Guia de resolução de problemas comuns do bot.

---

## 🔴 Problemas de Inicialização

### Bot não inicia / Erro na inicialização

**Sintomas:**

```
Error: Invalid token
```

**Soluções:**

1. Verifique se o `.env` existe e está configurado:

    ```bash
    DISCORD_TOKEN=seu_token_aqui
    DISCORD_APP_ID=seu_app_id
    ```

2. Regenere o token no [Discord Developer Portal](https://discord.com/developers/applications)

3. Certifique-se que o bot tem as intents necessárias:
    - ✅ Guilds
    - ✅ Guild Messages
    - ✅ Message Content

---

### MongoDB não conecta

**Sintomas:**

```
❌ MongoDB timeout (12s)
⚠️ Modo de dados: LocalDB (fallback ativo)
```

**Soluções:**

#### Usando MongoDB Local (Docker):

```bash
# Verificar se MongoDB está rodando
docker ps | grep mongodb

# Se não estiver, iniciar
docker-compose up -d mongodb

# Verificar logs
docker logs discord-bot-mongodb
```

#### Usando MongoDB Atlas:

1. Verifique se `MONGODB_URI` está correta no `.env`
2. Whitelist seu IP no Atlas
3. Verifique credenciais (usuário/senha)
4. Teste conexão:
    ```bash
    mongosh "sua_connection_string"
    ```

#### LocalDB Fallback:

Se MongoDB não é necessário, o bot funcionará automaticamente com LocalDB (arquivos JSON).

---

### Erro de compilação TypeScript

**Sintomas:**

```
error TS2339: Property 'X' does not exist on type 'Y'
```

**Soluções:**

```bash
# Limpar build anterior
rm -rf build/

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Recompilar
npm run build
```

---

## 🤖 Problemas com Comandos

### Comandos não aparecem no Discord

**Sintomas:**

- Slash commands não aparecem ao digitar `/`

**Soluções:**

1. **Registrar comandos:**

    ```bash
    npm run dev
    # Aguarde "✅ 12 slash commands registered"
    ```

2. **Limpar cache do Discord:**
    - Windows: `Ctrl + Shift + R`
    - Mac: `Cmd + Shift + R`

3. **Reautorizar bot:**
    - Gere novo link de convite no Developer Portal
    - Inclua `applications.commands` scope
    - Reautorize o bot no servidor

4. **Verificar permissões:**
    ```bash
    # O bot precisa da permissão "Use Application Commands"
    ```

---

### Comando retorna erro "Unknown interaction"

**Sintomas:**

```
The application did not respond
```

**Soluções:**

1. **Responder em até 3 segundos:**

    ```typescript
    // ❌ RUIM
    async execute(interaction) {
        await longRunningOperation(); // 5+ segundos
        await interaction.reply("Done");
    }

    // ✅ BOM
    async execute(interaction) {
        await interaction.deferReply(); // Responde imediatamente
        await longRunningOperation();
        await interaction.editReply("Done");
    }
    ```

2. **Verificar se handler existe:**
    ```bash
    npm run build
    # Verifique se o arquivo do comando está em build/discord/commands/
    ```

---

### Modal/Button/Select não responde

**Sintomas:**

- Clique em botão não faz nada
- Modal não abre

**Soluções:**

1. **Verificar custom_id:**

    ```typescript
    // Button
    new ButtonBuilder()
        .setCustomId("acervo_page/classes/1") // Deve corresponder ao responder

    // Responder
    @Responder({
        type: ResponderType.Button,
        customId: "acervo_page/:categoria/:page" // Pattern matching
    })
    ```

2. **Verificar se responder foi compilado:**

    ```bash
    ls build/discord/responders/buttons/
    ls build/discord/responders/selects/
    ls build/discord/responders/modals/
    ```

3. **Logs de debug:**
    ```typescript
    console.log("Custom ID recebido:", interaction.customId);
    ```

---

## 📊 Problemas com Dados

### Ficha não salva / "Failed to save character"

**Sintomas:**

```
❌ Erro ao salvar personagem
```

**Soluções:**

#### MongoDB:

```bash
# Verificar se coleções existem
mongosh
> use grimorio-corrupcao
> show collections
```

#### LocalDB:

```bash
# Verificar se arquivos existem
ls data/localdb/
cat data/localdb/characters.json
```

#### Permissões:

```bash
# Linux/Mac
chmod 755 data/localdb/
chmod 644 data/localdb/*.json

# Windows: Verificar permissões de escrita na pasta
```

---

### Compendium vazio / "Nenhuma classe encontrada"

**Sintomas:**

- `/acervo` mostra lista vazia
- Comandos de criação sem opções

**Soluções:**

1. **Verificar arquivos:**

    ```bash
    ls data/compendium/
    # Deve conter: acervo-do-golem.json, classes.json, races.json
    ```

2. **Validar JSON:**

    ```bash
    # Verificar se JSON é válido
    node -e "JSON.parse(require('fs').readFileSync('data/compendium/classes.json', 'utf-8'))"
    ```

3. **Recarregar cache:**

    ```typescript
    // No código ou via command
    import { clearCompendiumCache, warmUpCache } from "./services/compendiumService";

    clearCompendiumCache();
    await warmUpCache();
    ```

4. **Verificar logs:**
    ```bash
    # Procurar por erros de carregamento
    grep "Cache" logs/combined.log
    grep "Erro ao carregar" logs/error.log
    ```

---

## 🐌 Problemas de Performance

### Bot lento / Alta latência

**Sintomas:**

- Comandos demoram 5+ segundos
- "Thinking..." prolongado

**Diagnóstico:**

```typescript
// Verificar stats de cache
import { getCacheStats } from "./services/compendiumService";

const stats = getCacheStats();
console.log(stats);
// { initialized: true, totalClasses: 77, ... }
```

**Soluções:**

1. **Cache não inicializado:**

    ```bash
    # Verificar logs de inicialização
    grep "Aquecimento" logs/combined.log

    # Deve mostrar:
    # [Cache] ✅ Aquecimento completo em 200ms
    ```

2. **MongoDB sem índices:**

    ```bash
    # No código
    import { DatabaseIndexes } from './database/DatabaseIndexes';
    await DatabaseIndexes.createAllIndexes();

    # Verificar se foram criados
    await DatabaseIndexes.listAllIndexes();
    ```

3. **Arquivo JSON muito grande:**

    ```bash
    # Verificar tamanho
    du -h data/compendium/acervo-do-golem.json

    # Se > 50MB, considerar dividir:
    # Veja docs/ORGANIZATION_OPTIMIZATION.md seção "Separar Compendium"
    ```

---

## 🔧 Problemas de Build

### Build falha com erros TypeScript

**Sintomas:**

```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Soluções:**

1. **Atualizar tipos:**

    ```bash
    npm install --save-dev @types/node@latest
    npm install --save-dev @types/discord.js@latest
    ```

2. **Verificar tsconfig.json:**

    ```json
    {
        "compilerOptions": {
            "target": "ES2022",
            "module": "ES2022",
            "moduleResolution": "node",
            "strict": true
        }
    }
    ```

3. **Forçar recompilação:**
    ```bash
    npm run clean
    npm run build
    ```

---

### ESM Module Errors

**Sintomas:**

```
Error [ERR_REQUIRE_ESM]: require() of ES Module
```

**Soluções:**

1. **Verificar package.json:**

    ```json
    {
        "type": "module"
    }
    ```

2. **Usar imports ESM:**

    ```typescript
    // ❌ RUIM
    const fs = require("fs");

    // ✅ BOM
    import fs from "fs";
    ```

3. **File extensions:**

    ```typescript
    // ❌ RUIM
    import { func } from "./file";

    // ✅ BOM
    import { func } from "./file.js"; // Sempre .js mesmo com .ts
    ```

---

## 🌐 Problemas de Rede

### WebSocket errors / Disconnects

**Sintomas:**

```
WebSocket was closed before the connection was established
```

**Soluções:**

1. **Verificar conexão:**

    ```bash
    ping discord.com
    ```

2. **Verificar proxy/firewall:**
    - Libere porta 443 (wss)
    - Whitelist: `*.discord.com`

3. **Reconexão automática:**
    ```typescript
    // Já implementado no bot
    client.on("disconnect", () => {
        client.login(process.env.DISCORD_TOKEN);
    });
    ```

---

## 📝 Logs e Debug

### Ativar logs detalhados

```bash
# .env
LOG_LEVEL=debug

# Restart bot
npm run dev
```

### Ver logs em tempo real

```bash
# Linux/Mac
tail -f logs/combined.log

# Windows PowerShell
Get-Content logs/combined.log -Wait -Tail 50
```

### Filtrar logs por erro

```bash
grep "ERROR" logs/error.log
grep "❌" logs/combined.log
```

---

## 🆘 Ainda com Problemas?

1. **Verifique issues existentes:**
    - [GitHub Issues](https://github.com/seu-repo/issues)

2. **Crie um novo issue:**
    - Inclua logs completos
    - Versões (Node, MongoDB, SO)
    - Passos para reproduzir

3. **Discord da comunidade:**
    - [Servidor de suporte](https://discord.gg/seu-link)

---

## 🔄 Comandos Úteis

```bash
# Verificar status de tudo
npm run status

# Limpar e rebuild completo
npm run clean && npm run build

# Verificar saúde do banco
npm run db:check

# Ver estatísticas de cache
npm run cache:stats

# Recriar índices MongoDB
npm run db:reindex

# Executar diagnóstico completo
npm run diagnose
```

---

**Última atualização:** 11 de Dezembro de 2025
