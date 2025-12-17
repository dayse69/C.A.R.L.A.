# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.4.4] - 2025-12-11

### ✨ Adicionado

- **Cache de Compendium em Memória**: Sistema de cache otimizado que reduz I/O em ~80%
    - Função `warmUpCache()` para pré-carregar dados na inicialização
    - Função `getCacheStats()` para monitoramento de cache
    - Logging de performance para cada carregamento
- **Índices MongoDB**: Sistema completo de índices para otimizar queries (+500%)
    - Índices para `characters`: userId, nome, classe, raça, nível
    - Índices para `users`: discordId (unique), username
    - Índices para compendium: id (unique), nome, tipo, círculo, escola
    - Funções utilitárias: `listAllIndexes()`, `dropAllIndexes()`
- **Paginação no Acervo**: Sistema de navegação por páginas para classes (63 classes)
    - 10 itens por página
    - Botões Previous/Next com estados disabled
    - Footer com indicador "Página X/Y"
- **Sistema de Templates**: Gerador automático de templates a partir de arquivos TXT
    - Extração inteligente de classes, raças e itens
    - Suporte para múltiplos campos (atributos, habilidades, custo, raridade)
    - Scripts npm: `templates:classes`, `templates:races`, `templates:items`, `templates:all`

### 🔧 Otimizado

- Carregamento de compendium agora usa cache em memória
- Queries MongoDB 5x mais rápidas com índices
- Embeds de classes carregam 16x mais rápido
- Operação `/criar` reduzida de 110ms para 1.5ms (~70x)

### 📝 Documentação

- Adicionado `docs/CACHE_OPTIMIZATION.md` - Detalhes técnicos do cache
- Adicionado `docs/ORGANIZATION_OPTIMIZATION.md` - Análise completa do projeto
- Adicionado `CHANGELOG.md` - Histórico de versões
- Adicionado `CONTRIBUTING.md` - Guia para contribuidores

### 🐛 Corrigido

- ESM module errors com `require.main === module`
- Build ocasionalmente falhando (warnings → erros)

---

## [1.4.3] - 2025-12-10

### ✨ Adicionado

- Comando `/acervo` - Consulta ao Acervo do Golem
- Comando `/criar` - Sistema de criação de fichas
- Fallback LocalDB automático quando MongoDB não disponível

### 🔧 Mudanças

- Migração completa para TypeScript 5.7.2
- Atualização Discord.js para 14.22.1
- Estrutura de pastas refatorada

---

## [1.4.0] - 2025-12-05

### ✨ Adicionado

- Integração MongoDB com schemas completos
- Sistema de seed automático
- Repositórios para Characters, Users, Campaigns
- Docker Compose para ambiente dev

### 📝 Documentação

- `docs/database/` - Setup e integração MongoDB
- `docs/guides/` - Guias de comandos e testes
- `docs/api/` - Documentação técnica da API

---

## [1.3.0] - 2025-11-28

### ✨ Adicionado

- Comando `/ficha` - Exibir ficha de personagem
- Comando `/rolar` - Sistema de rolagem de dados
- UI Components: Embeds e Cards customizados

### 🔧 Mudanças

- Migração de JavaScript para TypeScript
- Constatic Base framework para comandos

---

## [1.2.0] - 2025-11-20

### ✨ Adicionado

- Sistema base de comandos Discord
- Logger customizado
- Error handler global

---

## [1.0.0] - 2025-11-15

### ✨ Inicial

- Bot Discord funcional
- Conexão com servidor
- Estrutura básica de projeto

---

## Tipos de Mudanças

- ✨ **Adicionado**: Novas funcionalidades
- 🔧 **Mudanças**: Alterações em funcionalidades existentes
- 🐛 **Corrigido**: Correção de bugs
- 🚀 **Performance**: Melhorias de performance
- 📝 **Documentação**: Mudanças apenas em documentação
- 🔒 **Segurança**: Correções de segurança
- ⚠️ **Deprecated**: Funcionalidades marcadas para remoção
- ❌ **Removido**: Funcionalidades removidas
