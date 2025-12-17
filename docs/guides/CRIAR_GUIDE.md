# 📜 Guia de Criação Unificada `/criar`

## Visão Geral

O comando `/criar` centraliza a criação de três tipos de conteúdo:
1. **Fichas de Personagem** — RPG character sheets
2. **Campanhas** — D&D campaign management
3. **Acervo** — Compendium items (Tormenta 20 rules)

---

## Fluxo Base

### 1️⃣ Iniciar `/criar`

```
/criar nome: <nome_obrigatório> origem: [opcional]
```

- **Nome** (obrigatório): Nome do personagem, campanha ou item
- **Origem** (opcional): Background do personagem (ex: Nobre, Misterioso)

### 2️⃣ Selecionar Tipo

Após preencher, um menu de seleção aparece:

- 🧑‍⚔️ **Ficha** — Criar personagem
- 🗺️ **Campanha** — Criar campanha D&D
- 📚 **Acervo** — Adicionar ao compendium

---

## 🧑‍⚔️ Fluxo: Criar Ficha

### Passos
1. `/criar nome: Aragorn origem: Ranger`
2. Selecione **Ficha**
3. Preencha o modal:
   - **Raça** (opcional): Humano, Elfo, Anão, etc.
   - **Classe** (opcional): Guerreiro, Mago, Clérigo, etc.
   - **Nível** (padrão: 1)
   - **Descrição** (opcional): História, aparência, personalidade

### Resultado
- ✅ Personagem criado no banco de dados
- 🔓 Acesse com `/ficha ver` ou `/ficha listar`

### Validação
- Raça/Classe são validadas contra o compendium; se inválido, defaults são usados (Indefinida / Aventureiro)

---

## 🗺️ Fluxo: Criar Campanha

### Passos
1. `/criar nome: A Busca do Artefato`
2. Selecione **Campanha**
3. Preencha o modal:
   - **Descrição** (obrigatório): Tema, plot, setting
   - **Ambientação** (opcional): Arton, Reino de Jade, etc.
   - **Nível Inicial** (padrão: 1)

### Resultado
- ✅ Campanha criada e associada ao seu usuário (mestre)
- 📋 Acesse com `/campanha listar` ou `/campanha ver`

---

## 📚 Fluxo: Criar Acervo

### Submenu: Categoria Principal

Selecione uma das 10 categorias:

- 📜 **Origens** — Backgrounds de personagem
- 🧬 **Raças** — Espécies do mundo
- ⚔️ **Classes** — Profissões e arquetipos
- 🎭 **Classes Alternativas** — Variantes únicas
- ✨ **Poderes Gerais** → Subcategorias: racial | combate | destino | magia | tormenta | concedido
- 🕯️ **Deuses** → Subcategorias: maiores | menores | servidores
- 🎖️ **Distinções** — Feitos e talentos
- 🏛️ **Bases** — Origens de poder
- 🌟 **Domínios** — Esferas de influência
- 📦 **Itens** → Subcategorias: mundanos | consumíveis | mágicos | aprimorados

### Exemplo: Criar Poder

1. `/criar nome: Golpe Drenador`
2. Selecione **Acervo** → **Poderes Gerais**
3. Selecione categoria (ex: **Combate**)
4. Preencha:
   - **Descrição** (obrigatório)
   - **Requisitos** (opcional): Pré-requisitos
   - **Efeitos/Bônus** (opcional): Detalhes do efeito

### Exemplo: Criar Item

1. `/criar nome: Adaga Flamejante`
2. Selecione **Acervo** → **Itens**
3. Selecione categoria (ex: **Mágicos**)
4. Preencha:
   - **Descrição** (obrigatório)
   - **Atributos/Bônus** (opcional)
   - **Requisitos** (opcional)

---

## ✅ Validação & Regras

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| **Nome** | String | ✅ | Sem duplicatas por contexto |
| **Origem** | String | ❌ | Validado contra `compendium.origens` |
| **Raça** | String | ❌ | Validado contra `compendium.racas`; default se inválido |
| **Classe** | String | ❌ | Validado contra `compendium.classes`; default se inválido |
| **Descrição (Ficha)** | Text (500 chars) | ❌ | — |
| **Descrição (Campanha)** | Text (1000 chars) | ✅ | — |
| **Descrição (Acervo)** | Text (500–700 chars) | ✅ | — |

---

## 💾 Onde Aparecem?

### Fichas
- `/ficha listar` — Lista suas fichas
- `/ficha ver [nome]` — Exibe detalhes
- `/ficha editar [nome]` — Edita história + nível
- `/ficha selecionar [nome]` — Marca como ativa

### Campanhas
- `/campanha listar` — Lista suas campanhas
- `/campanha ver [nome]` — Exibe detalhes
- `/campanha editar [nome]` — Edita descrição + ambientação

### Acervo
- `/compendium` → Menu de categorias → Vê itens por categoria
- `/acervo` → Similar ao `/compendium` (alias)

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Personagem já existe" | Mude o nome ou use `/ficha listar` para listar existentes |
| Raça/Classe não reconhecida | Use uma da lista em `/compendium` ou deixe em branco para defaults |
| Modal não aparece | Tente novamente; pode ter timeout Discord |
| Acervo não salva | Verifique se MongoDB está ativo (`/ping` retorna status) |

---

## 📌 Próximas Melhorias

- [ ] Paginação em `/ficha listar` e `/campanha listar`
- [ ] Preview antes de criar ("Vai criar: Barbaro Humano Nv 1?")
- [ ] Autocomplete em campos (Discord autocomplete integrado)
- [ ] Permissões (quem pode editar acervo?)
- [ ] Soft-delete (exclusão lógica)
