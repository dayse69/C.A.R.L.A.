# 🎨 UI Components - Sistema de Interface Visual

## 📋 Visão Geral

Este módulo contém todos os componentes visuais do bot, incluindo embeds, cards, menus e modals.

---

## 📂 Estrutura

```
ui/
├── embeds/          # Discord Embeds
│   └── fichaEmbeds.ts
├── cards/           # Visual Cards (ANSI)
│   └── profileCard.ts
├── menus/           # Select Menus (futuro)
├── modals/          # Modal Forms (futuro)
└── index.ts         # Barrel exports
```

---

## 🎨 Embeds

### `fichaEmbeds.ts`

Embeds formatados para fichas de personagens:

#### Funções Principais:
```typescript
// Embed de ficha geral
criarEmbedGeralFicha(personagem: Character): EmbedBuilder

// Embed de combate
criarEmbedCombateFicha(personagem: Character): EmbedBuilder

// Embed de perícias
criarEmbedPericiasFicha(personagem: Character): EmbedBuilder

// Embed de poderes
criarEmbedPoderesFicha(personagem: Character): EmbedBuilder

// Embed de magias
criarEmbedMagiasFicha(personagem: Character): EmbedBuilder

// Embed de inventário
criarEmbedInventarioFicha(personagem: Character): EmbedBuilder

// Embeds de feedback
criarEmbedConfirmacao(titulo: string, descricao: string): EmbedBuilder
criarEmbedErro(titulo: string, descricao: string): EmbedBuilder
```

#### Cores Padrão:
- **Geral**: `#4A90E2` (Azul)
- **Combate**: `#E74C3C` (Vermelho)
- **Perícias**: `#F39C12` (Laranja)
- **Poderes**: `#9B59B6` (Roxo)
- **Magias**: `#3498DB` (Azul claro)
- **Sucesso**: `#2ECC71` (Verde)
- **Erro**: `#E74C3C` (Vermelho)

---

## 🎴 Cards Visuais

### `profileCard.ts`

Cards visuais usando ANSI color codes para Discord:

#### Funções:
```typescript
// Card de perfil principal com barras de progresso
criarProfileCard(character: Character): EmbedBuilder

// Card de estatísticas de combate
criarCombateCard(character: Character): EmbedBuilder

// Card de perícias com ranking
criarPericiasCard(character: Character): EmbedBuilder
```

#### Recursos:
- ✅ Barras de progresso visuais (█ ░)
- ✅ ANSI color codes para destaque
- ✅ Sistema de XP visual
- ✅ Ranking de perícias com estrelas (⭐)

#### Cores ANSI Usadas:
```typescript
\x1b[2;36m  // Cyan (informações)
\x1b[2;32m  // Green (valores positivos)
\x1b[2;31m  // Red (HP baixo)
\x1b[1;37m  // White bold (destaques)
\x1b[0m     // Reset
```

---

## 🔧 Como Usar

### Importar Componentes:
```typescript
import { 
    criarEmbedGeralFicha, 
    criarProfileCard 
} from "@/ui";
```

### Criar e Enviar Embed:
```typescript
const embed = criarEmbedGeralFicha(personagem);
await interaction.reply({ embeds: [embed] });
```

### Card com Barra de Progresso:
```typescript
const card = criarProfileCard(character);
await interaction.reply({ embeds: [card] });
```

---

## 🎯 Convenções

### Estrutura de Embed:
```typescript
new EmbedBuilder()
    .setColor(COR_TEMATICA)
    .setTitle("📋 Título do Embed")
    .setDescription("Descrição principal")
    .addFields(
        { name: "Campo 1", value: "Valor", inline: true },
        { name: "Campo 2", value: "Valor", inline: true }
    )
    .setThumbnail(character.avatar)
    .setFooter({ text: "Footer info" })
    .setTimestamp();
```

### Emojis Consistentes:
```typescript
import { EMOJIS } from "@/utils/constants";

// Usar sempre EMOJIS do constants.ts
${EMOJIS.SUCCESS} // ✅
${EMOJIS.ERROR}   // ❌
${EMOJIS.INFO}    // ℹ️
```

---

## 📊 Componentes Futuros

### Menus (Planejado)
```typescript
// menus/fichaSelectMenu.ts
export function criarMenuAbas(characterId: string): StringSelectMenuBuilder;
```

### Modals (Planejado)
```typescript
// modals/editCharacterModal.ts
export function criarModalEdicao(character: Character): ModalBuilder;
```

---

## 🧪 Testes

```typescript
// __tests__/fichaEmbeds.test.ts
describe("FichaEmbeds", () => {
    it("deve criar embed geral válido", () => {
        const embed = criarEmbedGeralFicha(mockCharacter);
        expect(embed.data.title).toContain(mockCharacter.nome);
    });
});
```

---

## 🎨 Guia de Estilo Visual

### Hierarquia de Informação:
1. **Título** - Nome do personagem ou ação
2. **Descrição** - Contexto principal
3. **Fields** - Detalhes organizados
4. **Footer** - Metadata (autor, timestamp)

### Inline Fields:
- Usar `inline: true` para dados numéricos
- Usar `inline: false` para textos longos
- Máximo 3 campos por linha

### Limites Discord:
- Título: 256 caracteres
- Descrição: 4096 caracteres
- Field name: 256 caracteres
- Field value: 1024 caracteres
- Total fields: 25 máximo
- Total caracteres: 6000 máximo

---

*Documentação atualizada: Dezembro 2025*
