# Extrator de Compêndio - Guia de Uso

## ⚠️ AVISO LEGAL

Esta ferramenta é para **uso pessoal exclusivo** com materiais que você **adquiriu legalmente**.

**NÃO:**

- Extraia ou distribua conteúdo protegido por direitos autorais sem autorização
- Compartilhe os arquivos JSON gerados com terceiros
- Use para fins comerciais

**SIM:**

- Use para organizar seu próprio material do T20 legalmente adquirido
- Crie compêndios personalizados para uso pessoal
- Facilite consultas durante suas sessões de jogo

---

## 📦 Pré-requisitos

Instale a biblioteca necessária:

```bash
npm install pdf-parse
```

---

## 🚀 Como Usar

### Método 1: Script Automático

Execute o script que processa o Livro Básico:

```bash
npm run extract-compendio
```

### Método 2: Customizado

Edite [src/tools/extractCompendium.ts](../src/tools/extractCompendium.ts) para apontar para seu PDF:

```typescript
const CAMINHO_PDF = path.join(__dirname, "../../data/import/SEU_ARQUIVO.pdf");
```

---

## 📊 O que será extraído

O extrator tentará identificar e estruturar:

### 1. **Raças** → `racas-*.json`

- Nome, ID
- Modificadores de atributos
- Tamanho e deslocamento
- Habilidades raciais

### 2. **Classes** → `classes-*.json`

- Nome, ID
- Pontos de Vida (PV)
- Perícias
- Proficiências
- Habilidades de classe

### 3. **Poderes** → `poderes-*.json`

- Nome, ID
- Pré-requisitos
- Benefícios

### 4. **Magias** → `magias-*.json`

- Nome, ID, Círculo
- Escola de magia
- Tempo de conjuração
- Alcance, alvo, duração

### 5. **Itens** → `itens-*.json`

- Nome, ID, Categoria
- Preço e peso
- Propriedades

---

## 📁 Estrutura de Saída

Arquivos JSON serão salvos em:

```
data/compendium/extracted/
├── racas-T20-Livro-Basico.json
├── classes-T20-Livro-Basico.json
├── poderes-T20-Livro-Basico.json
├── magias-T20-Livro-Basico.json
└── itens-T20-Livro-Basico.json
```

Cada arquivo terá a estrutura:

```json
{
  "versao": "1.0",
  "dataExtracao": "2025-12-13T...",
  "totalItens": 25,
  "itens": [
    {
      "id": "humano",
      "nome": "Humano",
      "tipo": "raca",
      "descricao": "...",
      "fonte": "T20 - Livro Básico",
      "modificadores": {...},
      ...
    }
  ]
}
```

---

## 🔧 Ajustando o Extrator

O PDF pode ter formatação diferente do esperado. Para melhorar a extração:

### 1. **Teste com uma página específica**

Em [src/services/pdfParserService.ts](../src/services/pdfParserService.ts):

```typescript
const texto = await extrairTextoPDF(caminhoPDF, {
    paginas: [10, 11, 12], // Apenas páginas 10-12
    incluirMetadados: true,
});
```

### 2. **Ajuste os padrões RegEx**

Em [src/tools/compendiumExtractor.ts](../src/tools/compendiumExtractor.ts), modifique as funções de extração:

```typescript
// Exemplo: ajustar padrão de título
const secoesRacas = extrairSecoes(
    texto,
    /^[A-Z][A-ZÀ-Ú\s]+$/m // Títulos todo em maiúsculas
);
```

### 3. **Adicione logging para debug**

```typescript
console.log("Texto extraído:", texto.substring(0, 500));
console.log("Seções encontradas:", secoes.length);
```

---

## 🎯 Integração com o Bot

Após extrair, você pode:

### 1. **Mover para compêndio principal**

```bash
# Copie os JSONs para data/compendium/
cp data/compendium/extracted/racas-*.json data/compendium/
```

### 2. **Integrar com LazyCompendiumLoader**

Edite [src/services/lazyCompendiumLoader.ts](../src/services/lazyCompendiumLoader.ts):

```typescript
// Adicione novo arquivo ao loader
const novosItens = await lerJSON("data/compendium/poderes-livro-basico.json");
```

### 3. **Visualizar no Dashboard**

O dashboard já suporta:

- `/api/acervo?type=classes` → Classes
- `/api/acervo?type=racas` → Raças
- `/api/acervo?type=poderes` → Poderes
- `/api/acervo?type=magias` → Magias
- `/api/acervo?type=itens` → Itens

---

## 🐛 Solução de Problemas

### Erro: "pdf-parse não encontrado"

```bash
npm install pdf-parse
```

### Erro: "Arquivo não encontrado"

Verifique o caminho em `extractCompendium.ts`:

```bash
ls "data/import/T20 - Livro Básico.pdf"
```

### Extração vazia ou incorreta

1. O PDF pode ter proteção DRM
2. Pode ser imagens escaneadas (não tem texto)
3. Formatação muito diferente do padrão

**Solução**: Use OCR ou ajuste manualmente os padrões de extração.

### Caracteres estranhos (�)

O PDF usa encoding diferente. Teste:

```typescript
const dados = await pdfParse(dadosArquivo, {
    encoding: "utf-8",
});
```

---

## 📝 Exemplo Completo

```bash
# 1. Instalar dependência
npm install pdf-parse

# 2. Executar extração
npm run extract-compendio

# 3. Ver resultados
ls data/compendium/extracted/

# 4. Verificar conteúdo
cat data/compendium/extracted/racas-T20-Livro-Basico.json | head -n 50

# 5. Integrar ao compêndio (opcional)
cp data/compendium/extracted/*.json data/compendium/

# 6. Testar no dashboard
npm run dashboard
# Acesse http://localhost:3000 e navegue em "Acervo"
```

---

## 🔮 Próximos Passos

Após extrair o conteúdo:

1. **Revisar e corrigir** dados extraídos incorretamente
2. **Adicionar mais detalhes** manualmente aos JSONs
3. **Criar scripts de merge** para combinar múltiplas fontes
4. **Implementar validação** de dados contra schemas TypeScript
5. **Adicionar busca semântica** no dashboard para facilitar consultas

---

## 📚 Referências

- **pdf-parse**: https://www.npmjs.com/package/pdf-parse
- **Compêndio atual**: [data/compendium/](../data/compendium/)
- **Parser de fichas**: [src/services/pdfParserService.ts](../src/services/pdfParserService.ts)
- **Dashboard**: [src/server/index.ts](../src/server/index.ts)

---

## 💡 Dicas

- **Comece pequeno**: Teste com uma página/seção antes de processar tudo
- **Backup**: Mantenha backups dos JSONs originais antes de modificar
- **Valide**: Sempre revise dados extraídos automaticamente
- **Documente**: Anote quais padrões funcionam para seu PDF específico

---

**Criado para uso pessoal e educacional com materiais legalmente adquiridos.**
