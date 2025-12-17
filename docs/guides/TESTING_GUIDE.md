# 🧪 Guia de Testes - Discord Bot T20

> [!NOTE]
> Se você estiver usando o LocalDB (padrão com `MONGODB_URI=local`),
> ignore as etapas que exigem um servidor MongoDB. Todos os testes de
> comandos funcionam normalmente com persistência em arquivos JSON
> na pasta `data/localdb`.

## ✅ Checklist Pré-Teste

Antes de começar, certifique-se que:

- [ ] MongoDB está rodando (local ou Atlas)
- [ ] `.env` possui valores corretos:
    - `BOT_TOKEN` - Token do bot Discord
    - `MONGODB_URI` - URI da conexão (ex: `mongodb://localhost:27017/tormenta20-bot`)
- [ ] Build foi executado: `npm run build` ✓
- [ ] Sem erros de compilação

## 🚀 Teste 1: Inicialização

### Executar

```bash
npm run dev
```

### Verificar

```
✓ Bot inicializado (mensagem: "● NomeDoBot online ✓")
✓ MongoDB conectado (sem erro de conexão)
✓ Collections criadas no MongoDB
✓ Dados iniciais seeded (5 raças, 5 classes, etc)
✓ Bot responde a /ping
```

**Esperado:**

```
> /ping
→ "Pong! Latência: XXms"
```

---

## 🎯 Teste 2: Criar Personagem (Com Persistência)

### Comando

```
/ficha criar
  nome: Aragorn
  raca: Humano
  classe: Guerreiro
  nivel: 3
```

### Verificar no Discord

```
🔮 Aragorn
Raça: Humano | Classe: Guerreiro | Nível: 3
...
```

### Verificar no MongoDB

```javascript
db.characters.findOne({ nome: "Aragorn" });
// Deve retornar document com _id, userId, etc
```

**Esperado:**

- ✓ Embed com ficha aparece no Discord
- ✓ Personagem salvo no MongoDB
- ✓ Tem stats: PV, PM, Defesa, etc

---

## 👀 Teste 3: Visualizar Personagem

### Comando

```
/ficha ver nome: Aragorn
```

### Verificar

```
🔮 Aragorn (do MongoDB)
...
```

**Esperado:**

- ✓ Personagem recuperado do MongoDB
- ✓ Stats exatos como foram salvos
- ✓ Sem diferenças de dados

---

## 📋 Teste 4: Listar Personagens

### Comando

```
/ficha listar
```

### Verificar

```
Suas Fichas:
🔮 Aragorn - Humano Guerreiro (Nível 3)
🔮 Gandalf - Humano Mago (Nível 5)
```

**Esperado:**

- ✓ Lista todos os personagens do usuário
- ✓ Apenas personagens do seu userId aparecem
- ✓ Ordem por `atualizadoEm` (mais recentes primeiro)

---

## 🎲 Teste 5: Sistema de Rolagem

### Teste 5a: D20

```
/rolar d20
```

**Esperado:** Resultado entre 1-20

### Teste 5b: Múltiplos Dados

```
/rolar multiplo dados: 3
```

**Esperado:** 3d6, resultado visual

### Teste 5c: Perícia

```
/rolar pericia pericia: Acrobacia
```

**Esperado:** D20 + modificador

### Teste 5d: Ataque

```
/rolar ataque bonus: 2
```

**Esperado:** D20 + 2, crítico/falha crítica possível

---

## 🔄 Teste 6: Persistência de Dados

### Procedimento

1. Criar personagem "Legolas" com `/ficha criar`
2. Desligar o bot (`Ctrl+C`)
3. Aguardar 5 segundos
4. Reiniciar bot com `npm run dev`
5. Executar `/ficha listar`

**Esperado:**

- ✓ "Legolas" ainda aparece na lista
- ✓ Dados não foram perdidos
- ✓ MongoDB persistiu corretamente

---

## 🗄️ Teste 7: Validação Duplicata

### Procedimento

1. Criar personagem "Aragorn"
2. Tentar criar outro "Aragorn"

**Esperado:**

```
❌ Personagem já existe
Você já possui um personagem chamado "Aragorn".
Escolha outro nome.
```

---

## ⚙️ Teste 8: MongoDB Seed

### Verificar Collections

```javascript
// No MongoDB
db.compendium_races.countDocuments(); // Deve retornar 5
db.compendium_classes.countDocuments(); // Deve retornar 5
db.compendium_powers.countDocuments(); // Deve retornar 1+
db.compendium_spells.countDocuments(); // Deve retornar 1+
db.compendium_items.countDocuments(); // Deve retornar 2+
```

**Esperado:**

```
races: 5 ✓
classes: 5 ✓
powers: 1+ ✓
spells: 1+ ✓
items: 2+ ✓
```

---

## 🐛 Teste 9: Error Handling

### Teste Ficha Não Encontrada

```
/ficha ver nome: PersonagemInexistente
```

**Esperado:**

```
❌ Ficha não encontrada
Personagem "PersonagemInexistente" não encontrado.
Use `/ficha listar` para ver suas fichas.
```

### Teste Erro de Conexão

```javascript
// Desligar MongoDB enquanto bot está rodando
// Tentar criar personagem
```

**Esperado:**

```
❌ Erro ao criar ficha
Não foi possível criar sua ficha. Tente novamente.
```

---

## 📊 Teste 10: Performance

### Procedimento

```bash
# Criar 10 personagens rapidamente
# /ficha criar nome: Personagem1
# /ficha criar nome: Personagem2
# ... até 10

# Depois
/ficha listar
```

**Esperado:**

- ✓ Todos os 10 aparecem
- ✓ Sem timeout
- ✓ Resposta em < 2 segundos

---

## 🔐 Segurança

### Teste: Outro usuário não vê fichas

1. Usuário A: `/ficha criar nome: PersonagemA`
2. Usuário B: `/ficha listar`

**Esperado:**

- Usuário A vê: PersonagemA
- Usuário B vê: Nada (ou PersonagemB se tiver)
- Usuário B **NÃO** pode ver PersonagemA

---

## 📝 Checklist Final de Testes

### Sistema Básico

- [ ] Bot online ✓
- [ ] MongoDB conectado ✓
- [ ] Seed executado ✓
- [ ] /ping funciona ✓

### FICHA (Criar)

- [ ] Personagem criado ✓
- [ ] Salvo em MongoDB ✓
- [ ] Embed exibe corretamente ✓
- [ ] Validação duplicata funciona ✓

### FICHA (Ver)

- [ ] Recupera do MongoDB ✓
- [ ] Dados corretos ✓
- [ ] Erro para inexistente ✓

### FICHA (Listar)

- [ ] Lista todos ✓
- [ ] Apenas do usuário ✓
- [ ] Mensagem empty correta ✓

### ROLAR

- [ ] D20 funciona ✓
- [ ] Múltiplos funciona ✓
- [ ] Perícia funciona ✓
- [ ] Ataque funciona ✓

### PERSISTÊNCIA

- [ ] Dados persistem ✓
- [ ] Após restart continuam ✓

---

## 🚨 Se Algo Não Funcionar

### Erro: "MongoDB connection failed"

```bash
# Verificar se MongoDB está rodando
mongod --version  # Deve mostrar versão

# Ou no Windows (se instalado)
# Services -> MongoDB Server (deve estar rodando)
```

### Erro: "Invalid MONGODB_URI"

```bash
# Verificar .env
# Formato correto: mongodb://localhost:27017/tormenta20-bot
# Ou com Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Erro: "Bot token invalid"

```bash
# Verificar .env BOT_TOKEN
# Deve ser válido do Discord Developer Portal
```

### Erros de tipo TypeScript após mudanças

```bash
# Recompile
npm run build

# Se persistir, verificar:
npx tsc --noEmit
```

### Bot não responde a comandos

```bash
# Verificar permissões no Discord
# Bot precisa de: Send Messages, Embed Links, Ephemeral
# Verificar se está no servidor certo
```

---

## ✨ Testes Adicionais (Bonus)

### Teste de Criação em Massa

```bash
# Script para criar 100 personagens
# Medir tempo e memory
```

### Teste de Simultaneidade

```bash
# Múltiplos usuários criando simultaneamente
# Verificar se sem race conditions
```

### Teste de Limite

```bash
# Criar muitos personagens
# Verificar limite de armazenamento
```

---

**🟢 Se todos os testes passarem: Bot está 100% funcional!**

Para próximos passos, veja `STATUS_COMPLETO.md` para funcionalidades futuras.
