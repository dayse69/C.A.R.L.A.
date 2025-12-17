# 📋 Comandos Registrados - C.A.R.L.A Bot

**Data:** 6 de Dezembro de 2025  
**Status:** ✅ **4 Comandos Principais Registrados**

---

## 🎯 Resumo dos Comandos

| Comando | Tipo | Subcomandos | Status |
|---------|------|-------------|--------|
| `/counter` | Utility | ❌ 0 | ✅ Registrado |
| `/guild` | Info | ❌ 0 | ✅ Registrado |
| `/t20-roll` | Game | ❌ 0 | ✅ Registrado |
| `/ping` | Info | ❌ 0 | ✅ Registrado |
| `/ficha` | Game | ✅ 3+ | 🔄 Em Desenvolvimento |
| `/rolar` | Game | ✅ 3+ | 🔄 Em Desenvolvimento |

---

## ✅ Comandos Registrados (4)

### 1. `/counter` 🎮
**Tipo:** Utility  
**Localização:** `src/discord/commands/public/counter.ts`  
**Descrição:** Contador com persistência via buttons

**Funcionalidades:**
- ✅ Incrementar contador
- ✅ Usar botão `counter/:current`
- ✅ Armazenar valor em persistência

---

### 2. `/guild` ℹ️
**Tipo:** Info  
**Localização:** `src/discord/commands/public/guild.ts`  
**Descrição:** Informações do servidor Discord

**Funcionalidades:**
- ✅ Ver info do servidor
- ✅ Mostrar estatísticas
- ✅ Listar membros

---

### 3. `/t20-roll` 🎲
**Tipo:** Game  
**Localização:** `src/discord/commands/public/t20-roll.ts`  
**Descrição:** Rolagens de dados Tormenta 20

**Funcionalidades:**
- ✅ Rolar d20
- ✅ Rolar múltiplos dados
- ✅ Testes de perícia

---

### 4. `/ping` 🏓
**Tipo:** Info  
**Localização:** `src/discord/commands/public/ping.ts`  
**Descrição:** Verificar latência do bot

**Funcionalidades:**
- ✅ Mostrar ping em ms
- ✅ Status do bot
- ✅ Latência Discord API

---

## 🔄 Comandos em Desenvolvimento (Não Registrados)

### 1. `/ficha` 📋
**Tipo:** Game (RPG)  
**Localização:** `src/commands/ficha/ficha.ts`  
**Descrição:** Gerenciar fichas de personagens (com MongoDB)

**Subcomandos Implementados (3):**
```
/ficha criar   → Criar novo personagem (nome, raça, classe)
/ficha ver     → Visualizar personagem específico
/ficha listar  → Listar todos os seus personagens
```

**Status:**
- ✅ Código implementado
- ✅ MongoDB integration
- ✅ Repository pattern
- ❌ Não registrado automaticamente
- 🔄 Motivo: Localização diferente (src/commands/ vs src/discord/commands/public/)

**Banco de Dados:**
- Persistência: MongoDB ✅
- Repositório: CharacterRepository.ts
- Seeder: Automático

---

### 2. `/rolar` 🎲
**Tipo:** Game (RPG)  
**Localização:** `src/commands/rolagem/rolar.ts`  
**Descrição:** Sistema avançado de rolagens Tormenta 20

**Subcomandos Implementados (3+):**
```
/rolar d20     → Rolar um d20 (teste básico)
/rolar ataque  → Rolar ataque (com modificador)
/rolar pericia → Rolar teste de perícia
```

**Status:**
- ✅ Código implementado
- ✅ Serviço de rolagem
- ❌ Não registrado automaticamente
- 🔄 Motivo: Localização diferente

---

## 🔧 Estrutura de Carregamento de Comandos

### Caminho 1: Registrados ✅
```
src/discord/commands/public/
├── counter.ts     ✅ Registrado
├── guild.ts       ✅ Registrado
├── ping.ts        ✅ Registrado
├── perfil.ts      (arquivo)
└── t20-roll.ts    ✅ Registrado
```

**Resultado:** 4 comandos carregados automaticamente

### Caminho 2: Não Registrados 🔄
```
src/commands/
├── ficha/
│   └── ficha.ts   🔄 Não é carregado
├── rolagem/
│   └── rolar.ts   🔄 Não é carregado
├── compendium/    ❌ Vazio
└── mestre/        ❌ Vazio
```

**Motivo:** Sistema de descoberta de comandos (glob pattern) só procura em `src/discord/commands/public/`

---

## 📊 Análise

### O Que Funciona ✅
- 4 comandos públicos estão registrados
- Bot online e respondendo
- Slash commands funcionando
- Button responders ativos
- Logs mostrando carregamento correto

### O Que Falta 🔄
- `/ficha` e `/rolar` não aparecem no autocomplete
- Localização diferente causa não descoberta
- Compendium e Mestre vazio

### Por Que Não Aparecem?
O loader de comandos usa `glob` pattern que procura **apenas** em:
```
src/discord/commands/public/*.ts
```

Mas `/ficha` e `/rolar` estão em:
```
src/commands/ficha/*.ts    ❌ Caminho errado
src/commands/rolagem/*.ts  ❌ Caminho errado
```

---

## ✨ Opções de Solução

### Opção 1: Mover Comandos (Recomendado)
```bash
# Mover para local correto
mv src/commands/ficha/ficha.ts → src/discord/commands/public/ficha.ts
mv src/commands/rolagem/rolar.ts → src/discord/commands/public/rolar.ts
```

**Vantagem:**
- ✅ Descoberta automática
- ✅ Registro instantâneo
- ✅ Padrão do projeto

**Passo a passo:**
1. Mover ficha.ts para src/discord/commands/public/
2. Mover rolar.ts para src/discord/commands/public/
3. Rebuild: `npm run build`
4. Restart bot: `docker-compose restart bot`
5. Teste: `/ficha` e `/rolar` aparecerão no autocomplete

### Opção 2: Ajustar o Glob Pattern
Modificar o sistema de descoberta para incluir ambos os caminhos

**Localização:** `src/discord/base/commands/manager.ts` ou `creators.ts`

---

## 🎮 Teste dos Comandos Atuais

### Testar `/ping`
```
/ping
→ Retorna: Pong! 42ms
```

### Testar `/counter`
```
/counter
→ Mostra número com botão +
```

### Testar `/guild`
```
/guild
→ Mostra info do servidor
```

### Testar `/t20-roll`
```
/t20-roll
→ Rola d20 com resultado
```

---

## 📝 Próximas Ações Recomendadas

### Imediato (Se quer /ficha e /rolar funcionando)
1. Mover ficha.ts para discord/commands/public/
2. Mover rolar.ts para discord/commands/public/
3. Rebuild e restart
4. Teste no Discord

### Considerar
- Por que os comandos estavam em pastas diferentes?
- Consolidar estrutura de comandos
- Documentar padrão de organização

---

## 📌 Resumo Executivo

| Aspecto | Detalhes |
|---------|----------|
| **Comandos Online** | 4 / 6 |
| **Status** | ✅ Funcionando corretamente |
| **Problema** | `/ficha` e `/rolar` em local diferente |
| **Solução** | Mover 2 arquivos (5 minutos) |
| **Risco** | Nenhum, mudança simples |
| **Resultado Esperado** | 6 comandos registrados |

---

**Relatório Completo Gerado:** 6 de Dezembro de 2025
