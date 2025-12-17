# 💾 LocalDB - Banco de Dados Local em JSON

O LocalDB é uma alternativa leve ao MongoDB baseada em arquivos JSON. Ele é ideal para desenvolvimento ou para quem não quer depender de um servidor de banco de dados.

## ✅ Principais características

- Armazenamento em `data/localdb/*.json` (uma coleção por arquivo)
- API compatível com MongoDB (insertOne, findOne, find, updateOne, deleteOne, countDocuments)
- Auto-save com debounce de 1s para reduzir I/O
- Fallback automático: se o MongoDB falhar, o bot usa LocalDB

## 📂 Estrutura das coleções

```
users.json
characters.json
campaigns.json
compendium_races.json
compendium_classes.json
compendium_powers.json
compendium_spells.json
compendium_items.json
```

## 🚀 Como ativar

- Padrão: se `MONGODB_URI` não for uma URI do Atlas, o adapter usa LocalDB.
- Forçar LocalDB:

```
MONGODB_URI=local
```

## 🔄 Migração transparente

A camada `src/database/index.ts` expõe `getCollections()` com a mesma interface que o MongoDB usa nos repositórios. Seu código continua igual.

## ⚠️ Limitações conhecidas

- `find().sort()` e `limit()` não existem no LocalDB: faça o sort no array após `toArray()`.
- Concorrência: como é arquivo, evite rodar múltiplas instâncias do bot gravando no mesmo diretório.
- Não há transações.

## 🧰 Dicas

- Faça backup periódico da pasta `data/localdb`.
- Para limpar dados, remova os arquivos `.json` (o LocalDB recria vazios ao iniciar).
- Para produção, prefira MongoDB.
