# 📊 **GUIA DE BANCO DE DADOS - Grimório da Corrupção**

## 🏗️ **Arquitetura do Banco de Dados**

### **MongoDB Collections**

```
grimorio-corrupcao/
├── users                    # Usuários do Discord
├── characters              # Personagens dos jogadores
├── compendium_races        # Raças disponíveis
├── compendium_classes      # Classes disponíveis
├── compendium_powers       # Poderes/Habilidades
├── compendium_spells       # Magias
├── compendium_items        # Itens/Equipamentos
├── campaigns               # Campanhas (futuro)
└── session_logs            # Logs de sessões (futuro)
```

---

## 🔧 **Setup Inicial**

### **Opção 1: MongoDB Local (Windows)**

```powershell
# 1. Instalar MongoDB Community
# Baixar em: https://www.mongodb.com/try/download/community

# 2. Iniciar o serviço
mongod

# 3. Verificar conexão
mongosh
```

### **Opção 2: MongoDB Atlas (Cloud - Recomendado)**

```
1. Ir para https://www.mongodb.com/cloud/atlas
2. Criar conta gratuita
3. Criar um cluster
4. Copiar URI de conexão
5. Adicionar ao .env:
   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/grimorio-corrupcao
```

---

## 📦 **Instalar Dependências**

```bash
npm install mongodb
```

---

## 📋 **Estrutura das Coleções**

### **Users**
```typescript
{
  _id: ObjectId,
  discordId: string (único),
  username: string,
  avatar: string?,
  personagensAtivos: [string],
  configurações: {
    idioma: "pt-BR",
    notificações: true,
    tema: "dark"
  },
  criadoEm: Date,
  atualizadoEm: Date
}
```

### **Characters**
```typescript
{
  _id: ObjectId,
  userId: string (FK),
  nome: string,
  raca: string,
  classe: string,
  nivel: number (1-20),
  
  atributos: {
    FOR, DES, CON, INT, SAB, CAR: number
  },
  
  stats: {
    pv, pvAtual, pm, pmAtual,
    defesa, deslocamento, iniciativa: number
  },
  
  pericias: Record<string, number>,
  poderes: [string],        // IDs
  magias: [string],         // IDs
  
  inventario: [{
    id, nome, quantidade, raridade, peso, descricao
  }],
  
  historia: string,
  notas: string,
  experiencia: number,
  ouro: number,
  
  criadoEm: Date,
  atualizadoEm: Date,
  ultimoUso: Date
}
```

### **Compendium (Races, Classes, etc)**
```typescript
// Cada entrada tem:
{
  _id: ObjectId,
  id: string (único),
  nome: string,
  descricao: string,
  // ... dados específicos
  criadoEm: Date,
  atualizadoEm: Date
}
```

---

## 🔌 **Como Usar no Código**

### **Conectar ao Banco**

```typescript
import { connectDatabase, disconnectDatabase } from "#database";

// No main/bootstrap
await connectDatabase();

// Na função de shutdown
process.on('exit', async () => {
  await disconnectDatabase();
});
```

### **Usar Repositories**

```typescript
import { CharacterRepository } from "#database";
import { RaceRepository } from "#database";

// Criar personagem
const character = await CharacterRepository.create({
  userId: interaction.user.id,
  nome: "Aragorn",
  raca: "Humano",
  classe: "Guerreiro",
  nivel: 1,
  // ...
});

// Listar personagens
const meus = await CharacterRepository.findByUser(userId);

// Buscar raça
const humano = await RaceRepository.findByName("Humano");
```

---

## 🌱 **Popular BD com Dados**

```typescript
import { DatabaseSeeder } from "#database";
import { connectDatabase } from "#database";

await connectDatabase();
await DatabaseSeeder.seedAll();
```

Isso cria:
- ✅ 5 Raças
- ✅ 5 Classes
- ✅ Poderes básicos
- ✅ Magias básicas
- ✅ Itens básicos

---

## 📊 **Índices Automáticos**

O sistema cria automaticamente:

```
users:
  - discordId (único)

characters:
  - userId
  - nome
  - userId + nome (único)

compendium:
  - id (único, para cada coleção)
```

---

## 💾 **Backup**

### **Backup Local**

```bash
# Exportar dados
mongodump --db grimorio-corrupcao --out ./backups/

# Restaurar dados
mongorestore ./backups/grimorio-corrupcao --db grimorio-corrupcao
```

### **Backup Atlas**

1. Atlas > Deployments > Backup
2. Criar backup manual
3. Restaurar quando necessário

---

## 🔍 **Queries Úteis**

```javascript
// Listar todos os personagens de um usuário
db.characters.find({ userId: "123456789" })

// Contar fichas
db.characters.countDocuments({ userId: "123456789" })

// Buscar por nível
db.characters.find({ nivel: { $gte: 10 } })

// Personagens mais recentes
db.characters.find().sort({ atualizadoEm: -1 }).limit(10)

// Remover personagem
db.characters.deleteOne({ _id: ObjectId("...") })
```

---

## ⚠️ **Boas Práticas**

1. **Sempre conectar na inicialização do bot**
2. **Usar Repositories para operações CRUD**
3. **Fazer backup regularmente**
4. **Nunca usar credenciais em repositório público**
5. **Usar `.env` para configurações sensíveis**
6. **Adicionar índices conforme crescer**
7. **Monitorar uso de BD via Atlas**

---

## 🚀 **Próximos Passos**

- [ ] Implementar User Repository
- [ ] Adicionar Campaign & SessionLog
- [ ] Criar backup automático
- [ ] Implementar cache (Redis)
- [ ] Adicionar migrations
- [ ] Monitorar performance
