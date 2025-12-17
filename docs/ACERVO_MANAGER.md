# 🎮 Gerenciador do Acervo do Golem

Ferramenta CLI para gerenciar o Acervo do Golem localmente pelo terminal/VSCode.

## 📊 Estado Atual do Acervo

**Tamanho:** 136.89 MB  
**Conteúdo:**

- 🧬 **Raças:** 1
- ⚔️ **Classes:** 67
- 🎭 **Classes Alternativas:** 4
- ✨ **Poderes Gerais:** 0 (nenhum poder importado ainda)
- 📦 **Itens:** 12 (5 mundanos, 4 mágicos)
- 🕯️ **Divindades:** 2 (servidores)
- 🏆 **Distinções:** 14
- 📜 **Bases:** 0
- 🎭 **Domínios:** 0
- 📖 **Origens:** 0

## 🚀 Comandos Rápidos

### Ver Estatísticas

```bash
npm run acervo:stats
```

### Modo Interativo

```bash
npm run acervo
```

No modo interativo, você pode usar:

- `stats` - Ver resumo completo
- `list <categoria>` - Listar itens (ex: `list classes`, `list racas`)
- `search <termo>` - Buscar no acervo
- `delete <categoria> <nome>` - Remover um item
- `exit` - Sair

### Comandos Diretos

**Buscar algo:**

```bash
npm run acervo:search -- guerreiro
```

**Listar categoria:**

```bash
npm run acervo -- list classes
```

**Deletar item:**

```bash
npm run acervo -- delete classes "Nome da Classe"
```

## 📂 Categorias Disponíveis

- `racas` - Raças
- `classes` - Classes
- `classes_alternativas` - Classes Alternativas
- `origens` - Origens
- `poderes/racial` - Poderes Raciais
- `poderes/combate` - Poderes de Combate
- `poderes/destino` - Poderes de Destino
- `poderes/magia` - Poderes de Magia
- `poderes/tormenta` - Poderes de Tormenta
- `poderes/concedido` - Poderes Concedidos
- `itens/mundanos` - Itens Mundanos
- `itens/consumiveis` - Itens Consumíveis
- `itens/magicos` - Itens Mágicos
- `itens/aprimorados` - Itens Aprimorados
- `deuses_maiores` - Deuses Maiores
- `deuses_menores` - Deuses Menores
- `deuses_servidores` - Deuses Servidores
- `distincoes` - Distinções
- `bases` - Bases
- `dominios` - Domínios

## 💡 Exemplos de Uso

**Buscar por "guerreiro":**

```bash
npm run acervo:search -- guerreiro
```

**Listar todas as classes:**

```bash
npm run acervo -- list classes
```

**Ver estatísticas:**

```bash
npm run acervo:stats
```

**Modo interativo (mais fácil):**

```bash
npm run acervo
> search mago
> list racas
> exit
```

## 🔧 Recursos

✅ Ver estatísticas completas do acervo  
✅ Listar itens por categoria  
✅ Buscar texto em todo o acervo  
✅ Remover itens (com confirmação)  
✅ Modo interativo para uso mais fácil  
✅ Suporte a todas as categorias do Acervo

## ⚠️ Observações

- O arquivo acervo-do-golem.json está grande (136 MB), então carregamento pode demorar alguns segundos
- Sempre faça backup antes de operações de delete em massa
- A busca é case-insensitive e procura em nomes e descrições
- Use o modo interativo para explorar o acervo de forma mais confortável

## 🎯 Próximos Passos Sugeridos

Os poderes gerais ainda não foram importados. Para adicionar:

1. Verifique se os arquivos TXT em `data/import/` têm o campo `TIPO: poder` ou `TIPO: poder_geral`
2. Adicione também `SUBTIPO:` ou `CATEGORIA:` com um dos valores: racial, combate, destino, magia, tormenta, concedido
3. Execute `npm run import:txt` ou use `/importar` no Discord
