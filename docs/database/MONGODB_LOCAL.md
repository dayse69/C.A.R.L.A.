# 🗄️ Guia Completo: MongoDB Local

## 📋 Índice
1. [Instalação do MongoDB](#instalação)
2. [Configuração Inicial](#configuração)
3. [Iniciar MongoDB](#iniciar-mongodb)
4. [Configurar o Bot](#configurar-o-bot)
5. [Comandos Úteis](#comandos-úteis)
6. [Solução de Problemas](#solução-de-problemas)

---

## 1. 📥 Instalação do MongoDB

### Windows (Método Recomendado)

**Opção A: Instalador MSI**
1. Acesse: https://www.mongodb.com/try/download/community
2. Selecione:
   - Version: 8.0 ou superior
   - Platform: Windows
   - Package: MSI
3. Baixe e execute o instalador
4. Durante instalação:
   - ✅ Marque "Install MongoDB as a Service"
   - ✅ Marque "Install MongoDB Compass" (interface gráfica)
   - Caminho padrão: `C:\Program Files\MongoDB\Server\8.0\`

**Opção B: MongoDB Compass (Interface Gráfica)**
- Já vem incluído na instalação MSI
- Permite visualizar bancos, coleções e documentos
- Interface amigável para iniciantes

---

## 2. ⚙️ Configuração Inicial

### Verificar se MongoDB está instalado

```powershell
# Verificar versão
mongod --version

# Verificar se está rodando como serviço
Get-Service -Name MongoDB
```

### Criar diretório de dados (se necessário)

```powershell
# Criar pasta para dados do MongoDB
New-Item -Path "C:\data\db" -ItemType Directory -Force
```

---

## 3. 🚀 Iniciar MongoDB

### Método 1: Como Serviço Windows (Automático)

Se você instalou como serviço, o MongoDB já está rodando!

```powershell
# Verificar status
Get-Service -Name MongoDB

# Iniciar serviço (se parado)
Start-Service MongoDB

# Parar serviço
Stop-Service MongoDB

# Reiniciar serviço
Restart-Service MongoDB
```

### Método 2: Manual (Terminal)

```powershell
# Navegar até a pasta do MongoDB
cd "C:\Program Files\MongoDB\Server\8.0\bin"

# Iniciar MongoDB (SEM autenticação - desenvolvimento)
.\mongod.exe --dbpath "C:\data\db" --noauth

# Ou com autenticação
.\mongod.exe --dbpath "C:\data\db"
```

**Sinais de que está funcionando:**
```
Waiting for connections on port 27017
```

### Método 3: MongoDB Compass (Interface Gráfica)

1. Abra MongoDB Compass
2. String de conexão: `mongodb://localhost:27017`
3. Clique em "Connect"
4. Pronto! Você verá seus bancos de dados

---

## 4. 🤖 Configurar o Bot

### Passo 1: Atualizar arquivo `.env`

Abra o arquivo `.env` na raiz do projeto:

**Sem autenticação (desenvolvimento):**
```env
MONGODB_URI=mongodb://localhost:27017/grimorio-corrupcao
```

**Com autenticação (produção):**
```env
MONGODB_URI=mongodb://usuario:senha@localhost:27017/grimorio-corrupcao?authSource=admin
```

### Passo 2: Criar usuário MongoDB (opcional)

Se quiser usar autenticação:

```powershell
# Conectar ao MongoDB
mongosh

# No shell do MongoDB:
use admin
db.createUser({
  user: "botuser",
  pwd: "senhaSegura123",
  roles: [ 
    { role: "readWrite", db: "grimorio-corrupcao" },
    { role: "dbAdmin", db: "grimorio-corrupcao" }
  ]
})
```

Depois atualize o `.env`:
```env
MONGODB_URI=mongodb://botuser:senhaSegura123@localhost:27017/grimorio-corrupcao?authSource=admin
```

### Passo 3: Iniciar o Bot

```powershell
# No diretório do bot
npm run dev
```

**Logs esperados:**
```
🔄 Conectando ao MongoDB...
🔄 Tentando conectar ao MongoDB: mongodb://localhost:27017/grimorio-corrupcao
✓ MongoDB connected successfully
✓ Collections initialized
✅ MongoDB conectado com sucesso!
```

---

## 5. 🛠️ Comandos Úteis

### MongoDB Shell (mongosh)

```powershell
# Conectar ao MongoDB
mongosh

# Comandos dentro do shell:

# Listar bancos de dados
show dbs

# Usar banco de dados
use grimorio-corrupcao

# Listar coleções
show collections

# Ver documentos de uma coleção
db.characters.find().pretty()

# Contar documentos
db.characters.countDocuments()

# Buscar personagens de um usuário
db.characters.find({ userId: "585893960309014551" })

# Apagar todos os documentos de uma coleção
db.characters.deleteMany({})

# Apagar banco de dados inteiro
use grimorio-corrupcao
db.dropDatabase()

# Sair
exit
```

### PowerShell (Administração)

```powershell
# Ver se MongoDB está rodando
Get-Process -Name mongod

# Ver porta usada pelo MongoDB
Get-NetTCPConnection -LocalPort 27017

# Parar processo MongoDB
Stop-Process -Name mongod -Force

# Iniciar MongoDB manualmente
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db" --noauth
```

---

## 6. 🔧 Solução de Problemas

### ❌ Erro: "Command createIndexes requires authentication"

**Problema:** MongoDB está configurado com autenticação mas você não forneceu credenciais.

**Solução 1 - Desabilitar autenticação (desenvolvimento):**
```powershell
# Parar MongoDB
Stop-Service MongoDB

# Iniciar sem autenticação
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db" --noauth
```

**Solução 2 - Adicionar credenciais no .env:**
```env
MONGODB_URI=mongodb://usuario:senha@localhost:27017/grimorio-corrupcao?authSource=admin
```

### ❌ Erro: "Database not connected"

**Problema:** MongoDB não está rodando ou não está acessível.

**Verificações:**
```powershell
# 1. MongoDB está rodando?
Get-Process -Name mongod

# 2. Porta 27017 está aberta?
Test-NetConnection -ComputerName localhost -Port 27017

# 3. Testar conexão com mongosh
mongosh mongodb://localhost:27017
```

**Solução:**
```powershell
# Iniciar MongoDB
Start-Service MongoDB
# ou
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db" --noauth
```

### ❌ Erro: "MongoNetworkError: connect ECONNREFUSED"

**Problema:** MongoDB não está rodando.

**Solução:**
```powershell
# Iniciar MongoDB como serviço
Start-Service MongoDB

# Ou manualmente
cd "C:\Program Files\MongoDB\Server\8.0\bin"
.\mongod.exe --dbpath "C:\data\db" --noauth
```

### ❌ Bot funciona mas comandos não respondem

**Problema:** MongoDB conectou mas há erro ao criar índices.

**Solução:** Edite `src/database/mongodb.ts` e comente a linha de índices:
```typescript
// await createIndexes(); // Comentar esta linha temporariamente
```

---

## 🎯 Resumo Rápido

### Para Desenvolvimento Local (Sem Autenticação)

1. **Iniciar MongoDB:**
   ```powershell
   Start-Service MongoDB
   ```

2. **Configurar .env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/grimorio-corrupcao
   ```

3. **Iniciar Bot:**
   ```powershell
   npm run dev
   ```

4. **Testar comandos:**
   - `/ficha criar nome:Gandalf raca:Humano classe:Mago`
   - `/ficha listar`

### Para Visualizar Dados (MongoDB Compass)

1. Abra MongoDB Compass
2. Conecte em: `mongodb://localhost:27017`
3. Banco: `grimorio-corrupcao`
4. Coleções: `characters`, `users`, etc.

---

## 📚 Recursos Adicionais

- **Documentação MongoDB:** https://docs.mongodb.com/
- **MongoDB Compass:** https://www.mongodb.com/products/compass
- **Mongosh (Shell):** https://docs.mongodb.com/mongodb-shell/
- **Node.js Driver:** https://mongodb.github.io/node-mongodb-native/

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique os logs do bot (`npm run dev`)
2. Verifique se MongoDB está rodando (`Get-Service MongoDB`)
3. Teste conexão com Compass ou mongosh
4. Consulte este guia novamente 😊
