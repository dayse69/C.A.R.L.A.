# 📚 Acervo do Golem - Compendium C.A.R.L.A

## 🤖 Sobre C.A.R.L.A
**C.A.R.L.A** - "O Arquivo Guardião dos Mistérios Cósmicos" é o bot oficial de Tormenta 20 para gerenciamento de fichas de personagens e sistema de rolagens.

## 📖 Acervo do Golem
O **Acervo do Golem** é o compendium centralizado contendo toda a informação necessária para criar e gerir personagens em Tormenta 20.

### Estrutura do Compendium

#### 🎭 Classes
O compendium está dividido em dois grupos principais de classes:

##### Classes Principais (8 classes)
- **Guerreiro** - Mestres do combate e armaduras
- **Mago** - Canalizadores de magia arcana
- **Clérigo** - Devotos de poderes divinos
- **Ladrão** - Astutos e ágeis operadores das sombras
- **Paladino** - Guerreiros sagrados
- **Druida** - Mestres da natureza e magia primal
- **Ranger** - Caçadores versáteis
- **Bardo** - Artistas manipuladores

##### Classes Alternativas (4 classes)
- **Monge** - Mestres do combate desarmado
- **Mago da Guerra** - Especialistas em combate mágico agressivo
- **Bruxo** - Fazedores de pactos com entidades cósmicas
- **Feiticeiro** - Portadores de magia inata

#### ✨ Distinções
Feitos especiais que modificam e aprimoram personagens:
- **Atlético** - Excelente condicionamento físico
- **Evasão** - Mover-se entre o fogo da batalha
- **Investigador** - Olhar aguçado para detalhes
- **Intuitivo** - Forte ligação espiritual
- **Manipulador** - Domínio de persuasão

#### 👥 Raças (7 raças)
- **Humano** - Versáteis e ambiciosos
- **Anão** - Resistentes e fortes
- **Elfo** - Graciosos e mágicos
- **Meia-Raça** - Filhos de dois mundos
- **Goblin** - Pequenos e astutos
- **Tiefling** - Descendentes de herança infernal
- **Draconato** - Humanoides dracônicos

#### 💪 Poderes Gerais
Habilidades extraordinárias disponíveis para personagens:
- Potência Brutal
- Escudo Mágico
- Ataque Furtivo
- Golpe Crítico
- Passo do Vento

#### 🙏 Deuses (5 divindades)
- **Arsésnio** - Deus da guerra e glória militar
- **Prissana** - Deusa da magia e conhecimento
- **Maliir** - Deus da morte e repouso
- **Agnar** - Deus da natureza e caça
- **Thyara** - Deusa do comércio e fortuna

#### 🛡️ Itens
Divididos em três categorias de raridade:

**Mundanos** - Itens comuns
- Espada Longa
- Arco Curto
- Cota de Malha
- Mochila
- Corda de Cânhamo

**Aprimados** - Itens de qualidade superior
- Espada Longa Forjada
- Armadura de Placas Refinada
- Escudo Reforçado

**Mágicos** - Itens com poder sobrenatural
- Espada Flamejante
- Amuleto de Proteção
- Anel da Inteligência
- Capa da Invisibilidade (Lendária)

## 🔄 Usando o Compendium

### Arquivo Principal
O compendium está armazenado em:
```
data/compendium/acervo-do-golem.json
```

### Estrutura JSON
```json
{
  "nome": "Acervo do Golem",
  "descricao": "...",
  "versao": "1.0.0",
  "classes": {
    "classe_principal": [...],
    "classe_alternativa": [...]
  },
  "distincoes": [...],
  "racas": [...],
  "poderes_gerais": [...],
  "deuses": [...],
  "itens": {
    "mundanos": [...],
    "aprimados": [...],
    "magicos": [...]
  }
}
```

## 🔮 Comandos do Bot

### Comando `/ficha`
- `/ficha criar` - Criar nova ficha de personagem
- `/ficha ver` - Visualizar ficha de personagem
- `/ficha listar` - Listar todas as suas fichas
- `/ficha editar` - Editar ficha existente (futuro)

### Comando `/compendium` (futuro)
- `/compendium classes` - Listar classes
- `/compendium racas` - Listar raças
- `/compendium deuses` - Listar deuses
- `/compendium itens` - Listar itens
- `/compendium poderes` - Listar poderes

### Comando `/rolar` (Dado D20)
- `/rolar d20` - Rolagem simples
- `/rolar multiplo` - Múltiplas rolagens
- `/rolar pericia` - Teste de perícia
- `/rolar ataque` - Teste de ataque

## 📊 Banco de Dados

### Collections MongoDB
```
grimorio-corrupcao/
├── users
├── characters
├── compendium_races
├── compendium_classes
├── compendium_powers
├── compendium_spells
├── compendium_items
└── compendium_gods
```

## 🚀 Próximas Atualizações
- [ ] Suporte completo a Magias/Feitiços
- [ ] Sistema de equipamento e inventário
- [ ] Campanhas e sessões de jogo
- [ ] Sistema de experiência e progressão
- [ ] Integração com Voice Channels
- [ ] Comandos de Mestre de Jogo

## 📝 Notas
- O Compendium é baseado em **Tormenta 20** (Sistema T20)
- Todos os dados são armazenados em **MongoDB**
- As fichas são salvaguardadas por usuário
- O bot oferece interface amigável via Embeds do Discord

---

**Versão**: 1.0.0  
**Última Atualização**: 2025-12-06  
**Bot**: C.A.R.L.A (O Arquivo Guardião dos Mistérios Cósmicos)
