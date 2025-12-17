# Reorganização de Classes e Variantes

## 📋 Sumário

A estrutura de classes do Acervo foi reorganizada para melhor separação entre **Classes Base** e **Classes Alternativas (Variantes)**.

## 🗂️ Estrutura Anterior

Anteriormente, todas as classes estavam no arquivo `acervo-do-golem.json`:

```
data/compendium/
  └── acervo-do-golem.json  (67 classes: bases + variantes)
```

## ✨ Nova Estrutura

Agora as classes estão organizadas em arquivos separados:

```
data/compendium/
  ├── classes-base.json       (33 classes base)
  ├── classes-variantes.json  (29 variantes)
  └── acervo-do-golem.json   (referência aos novos arquivos)
```

## 📦 Arquivos

### `classes-base.json`

Contém todas as **classes base** do sistema T20:

- 14 classes do **Livro Básico** (Arcanista, Bárbaro, Bardo, Bucaneiro, Cavaleiro, Clérigo, Druida, Guerreiro, Inventor, Ladino, Lutador, Místico, Nobre, Paladino, Ranger)
- Classes de suplementos oficiais
- Classes de homebrews aprovados

**Estrutura:**

```json
{
  "classes": [
    {
      "id": "guerreiro",
      "nome": "Guerreiro",
      "descricao": "Mestres do combate, excelem no uso de armas e armaduras.",
      "fonte": "Tormenta20 Básico",
      "tipo": "classe_base"
    },
    ...
  ]
}
```

### `classes-variantes.json`

Contém todas as **variantes de classes** (classes alternativas):

- Variantes do **Heróis de Arton** (15 variantes)
- Variantes do **Mitos de Arton** (14 variantes)

**Estrutura:**

```json
{
  "variantes": [
    {
      "id": "necromante",
      "nome": "Necromante",
      "descricao": "Variante de Arcanista especializada em magia negra.",
      "fonte": "Heróis de Arton",
      "tipo": "variante",
      "classe_base": "arcanista"
    },
    ...
  ]
}
```

**Campo especial:**

- `classe_base`: Identifica qual classe base esta variante substitui

## 🔧 Integração no Código

### LazyCompendiumLoader

O `lazyCompendiumLoader.ts` foi atualizado para carregar os novos arquivos:

```typescript
// Modo otimizado (split)
const filePath = path.join(this.splitDir, "classes.json");

// Modo padrão (novos arquivos separados)
const classesBasePath = path.join(this.fallbackDir, "classes-base.json");
const variantesPath = path.join(this.fallbackDir, "classes-variantes.json");

// Carrega e combina
this.cache.classes = [...classesBase, ...variantes];
```

### Compatibilidade

O sistema mantém **compatibilidade total** com código existente:

- `lazyLoader.getClasses()` retorna todas as classes (base + variantes)
- Nenhuma mudança necessária em comandos ou responders existentes

## 📊 Estatísticas

| Tipo             | Quantidade |
| ---------------- | ---------- |
| **Classes Base** | 33         |
| **Variantes**    | 29         |
| **Total**        | 62         |

## 🎯 Benefícios

### 1. **Organização**

- Separação clara entre classes base e variantes
- Fácil identificação de novos conteúdos

### 2. **Manutenção**

- Edição mais simples (arquivos menores)
- Menos conflitos em merge de git
- Estrutura mais clara

### 3. **Performance**

- Carregamento seletivo possível no futuro
- Cache mais eficiente
- Arquivos menores = leitura mais rápida

### 4. **Extensibilidade**

- Fácil adicionar novas variantes
- Possibilidade de adicionar metadata específica
- Suporte para futuras features (filtros, busca por classe base, etc.)

## 🚀 Próximos Passos

### Possíveis Melhorias Futuras

1. **Busca por Variantes**
    - Comando para listar variantes de uma classe específica
    - `/buscar classe:arcanista variantes:true`

2. **Comparação**
    - Comparar classe base vs variante
    - Destacar diferenças e vantagens

3. **Metadata Adicional**
    - Tags (combate, magia, suporte, etc.)
    - Nível de complexidade
    - Popularidade

4. **Validação**
    - Script para verificar integridade dos dados
    - Checar referências de classe_base

## 📝 Notas de Desenvolvimento

### Estrutura Original (mantida em acervo-do-golem.json)

- `classes` agora contém apenas uma referência
- `classes_info` indica os novos arquivos

### Migração

- ✅ Dados exportados com sucesso
- ✅ Código atualizado
- ✅ Compatibilidade mantida
- ⏳ Aguardando testes

## 🐛 Troubleshooting

### Problema: Classes não carregam

**Solução:**

1. Verificar se os arquivos existem:

    ```powershell
    Test-Path "data/compendium/classes-base.json"
    Test-Path "data/compendium/classes-variantes.json"
    ```

2. Verificar sintaxe JSON:

    ```powershell
    Get-Content "data/compendium/classes-base.json" | ConvertFrom-Json
    ```

3. Rebuild do projeto:
    ```powershell
    npm run build
    ```

### Problema: Variantes não aparecem

**Verificar:**

- Campo `tipo` deve ser `"variante"`
- Arquivo `classes-variantes.json` deve ter chave `"variantes"` (não `"classes"`)

---

**Data da Reorganização:** 12 de dezembro de 2025  
**Autor:** Sistema de organização do Acervo  
**Versão:** 1.0.0
