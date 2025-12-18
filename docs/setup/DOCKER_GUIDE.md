# 🐳 Guia Docker - Discord Bot T20

## ✅ Instalação Completa com Docker

Parabéns por instalar Docker e MongoDB! Aqui está como configurar tudo para rodar em containers.

---

## 📦 Arquivos Criados

- ✅ `Dockerfile` - Imagem do bot
- ✅ `docker-compose.yml` - Orquestração completa
- ✅ `.dockerignore` - Arquivos ignorados no build

---

## 🚀 Quick Start (1 minuto)

### 1. Configurar .env
```bash
# Copiar template
cp .env.example .env

# Editar .env com seus valores
DISCORD_TOKEN=seu_token_aqui
MONGODB_URI=mongodb://admin:password123@mongodb:27017/grimorio-corrupcao?authSource=admin
```

### 2. Iniciar Containers
```bash
# Iniciar MongoDB + Bot
docker-compose up -d

# Ver logs
docker-compose logs -f bot
```

### 3. Pronto! 🎉
```bash
# Bot está rodando em container
# MongoDB está rodando em container
# Interface web em: http://localhost:8081 (opcional)
```

---

## 📋 Comandos Essenciais

### Build & Run
```bash
# Build da imagem do bot
docker-compose build

# Iniciar tudo em background
docker-compose up -d

# Iniciar com logs em tempo real
docker-compose up

# Parar containers
docker-compose down

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f bot
docker-compose logs -f mongodb
```

### Gerenciamento
```bash
# Remover containers e volumes
docker-compose down -v

# Rebuild do zero
docker-compose down -v && docker-compose build --no-cache && docker-compose up -d

# Acessar container do bot
docker-compose exec bot sh

# Acessar MongoDB
docker-compose exec mongodb mongosh -u admin -p password123
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────┐
│     Discord Bot Container       │
│  (Node.js 20 + TypeScript)      │
│  - Porta: 3000 (interna)        │
│  - Conecta ao MongoDB           │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│   MongoDB Container             │
│  - Porta: 27017 (host)          │
│  - User: admin                  │
│  - Pass: password123            │
│  - Volume: mongodb_data         │
└─────────────────────────────────┘
             
┌─────────────────────────────────┐
│ MongoDB Express (Opcional)      │
│ - Porta: 8081 (http://localhost)│
│ - Interface Web para MongoDB    │
│ - Perfil: dev                   │
└─────────────────────────────────┘
```

---

## 🔐 Variáveis de Ambiente

### .env (criar na raiz)
```env
# Discord Bot Token (obrigatório)
DISCORD_TOKEN=sua_token_aqui

# Guild ID (opcional - para testes)
GUILD_ID=seu_guild_id

# MongoDB (automático no docker-compose)
# MONGODB_URI=mongodb://admin:password123@mongodb:27017/grimorio-corrupcao?authSource=admin
```

---

## 📚 Estrutura do docker-compose.yml

### Services

**MongoDB**
- Imagem: `mongo:7.0` (latest stable)
- Container: `tormenta20-mongodb`
- Porta: `27017:27017`
- Healthcheck automático
- Volume persistente: `mongodb_data`
- Rede: `tormenta20-network`

**Bot**
- Build: `Dockerfile`
- Container: `tormenta20-bot`
- Depende: `mongodb` (aguarda health)
- Redes: `tormenta20-network`
- Volumes: logs

**MongoDB Express** (opcional)
- Imagem: `mongo-express:latest`
- Porta: `8081:8081`
- Perfil: `dev` (usar: `docker-compose --profile dev up`)

---

## 🧪 Testes

### Verificar se tudo está rodando
```bash
# Ver containers
docker-compose ps

# Deve mostrar:
# tormenta20-mongodb  RUNNING
# tormenta20-bot      RUNNING
```

### Testar Conexão MongoDB
```bash
# Acessar MongoDB
docker-compose exec mongodb mongosh -u admin -p password123

# Dentro do MongoDB:
> use grimorio-corrupcao
> db.collection.count()
> show collections
```

### Testar Bot
```bash
# Ver logs do bot
docker-compose logs bot

# Procurar por: "C.A.R.L.A online"
```

### Interface Web (Opcional)
```bash
# Iniciar mongo-express
docker-compose --profile dev up -d

# Abrir navegador
http://localhost:8081

# Login
# Username: admin
# Password: password123
```

---

## ⚙️ Configuração Avançada

### Mudar Credenciais MongoDB
Edit `docker-compose.yml`:
```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: seu_user
  MONGO_INITDB_ROOT_PASSWORD: sua_senha
```

### Usar MongoDB Atlas (Cloud)
```bash
# Modificar .env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/grimorio-corrupcao
```

### Persistência de Dados
```bash
# Volumes automaticamente salvam em:
# C:\Users\dayse\AppData\Docker (Windows)
# Ou onde Docker Desktop está configurado

# Para backup:
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017" --out=/backup
```

### Limpar Dados
```bash
# Remove volumes (data será perdida)
docker-compose down -v

# Remove tudo e começa do zero
docker-compose down -v && docker-compose build --no-cache && docker-compose up -d
```

---

## 🐛 Troubleshooting

### Erro: "MongoDB connection refused"
```bash
# Verificar se MongoDB está rodando
docker-compose ps

# Se não estiver:
docker-compose up -d mongodb

# Aguardar healthcheck passar (≈10s)
docker-compose logs mongodb
```

### Erro: "Port 27017 already in use"
```bash
# Mudar porta no docker-compose.yml
ports:
  - "27018:27017"  # Host:Container
```

### Erro: "Bot não conecta ao Discord"
```bash
# Verificar DISCORD_TOKEN em .env
# Verificar logs
docker-compose logs bot

# Restart
docker-compose restart bot
```

### Erro: "Permission denied"
```bash
# Windows: Executar como Administrador
# Linux/Mac: sudo docker-compose up
```

### Container sai rapidinho
```bash
# Ver erro:
docker-compose logs bot

# Verificar .env está correto
# Verificar node_modules em build/
```

---

## 📊 Monitoramento

### Ver uso de recursos
```bash
docker stats

# Ou específico
docker stats tormenta20-bot tormenta20-mongodb
```

### Logs em tempo real
```bash
# Todo mundo
docker-compose logs -f

# Apenas bot
docker-compose logs -f bot -n 50

# Apenas MongoDB
docker-compose logs -f mongodb -n 50
```

---

## 🔄 Workflow de Desenvolvimento

### 1. Iniciar tudo
```bash
docker-compose up -d
```

### 2. Fazer mudanças no código
```bash
# Editar src/commands/... etc
```

### 3. Rebuild bot (se mudou dependencies)
```bash
docker-compose build --no-cache bot
docker-compose up -d bot
```

### 4. Ver logs
```bash
docker-compose logs -f bot
```

### 5. Parar tudo
```bash
docker-compose down
```

---

## 🎯 Fluxo Completo: Do Zero ao Hero

```bash
# 1. Clonar/Baixar projeto
cd "Discord Bot"

# 2. Criar .env
cp .env.example .env
# Editar DISCORD_TOKEN

# 3. Build da imagem
docker-compose build

# 4. Iniciar
docker-compose up -d

# 5. Verificar
docker-compose ps
docker-compose logs bot

# 6. Testar no Discord
# /ficha criar nome:TestBot raca:Humano classe:Guerreiro

# 7. Ver dados no MongoDB
docker-compose exec mongodb mongosh -u admin -p password123

# 8. Parar
docker-compose down
```

---

## 📈 Performance

### Otimizações Aplicadas
- Alpine Linux (imagem pequena)
- Multi-stage build (sem devDependencies em production)
- Health checks (reinicia se falhar)
- Volumes persistentes (dados não perdem)
- Network isolada (melhor segurança)

### Tamanho Estimado
- MongoDB: ~300MB
- Bot Image: ~500MB
- Total com volumes: ~1GB

---

## 🔐 Segurança

### Credenciais (Mudar em Produção!)
- Username: `admin`
- Password: `password123`

**⚠️ IMPORTANTE: Mudar credenciais para produção!**

```bash
# Gerar senha segura
openssl rand -base64 12

# Atualizar .env e docker-compose.yml
```

---

## 🚀 Próximos Passos

### Para Desenvolvimento Local
```bash
docker-compose --profile dev up -d

# MongoDB Express estará em: http://localhost:8081
```

### Para Produção
```bash
# Remover perfil dev
# Usar credenciais seguras
# Usar MongoDB Atlas ao invés de local
```

### Para CI/CD
```bash
# Push para Docker Hub
# GitHub Actions para build automático
# Deploy em cloud (AWS, Azure, GCP)
```

---

## 📚 Documentação Relacionada

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Setup MongoDB
- [README_MONGODB.md](README_MONGODB.md) - MongoDB integration
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Como testar

---

## 🎉 Pronto!

Você tem:
- ✅ Docker instalado
- ✅ MongoDB instalado
- ✅ Dockerfile pronto
- ✅ docker-compose configurado
- ✅ MongoDB Express (opcional)

**Próximo passo: `docker-compose up -d`**

Divirta-se! 🚀
