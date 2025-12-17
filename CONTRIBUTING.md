# Guia de Contribuição

Obrigado por considerar contribuir para o **C.A.R.L.A Bot** (Compêndio Automatizado de Regras e Lendas de Arton)! 🎲

Este documento fornece diretrizes para contribuir com o projeto.

---

## 📋 Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

---

## 🚀 Como Contribuir

### 1. Reportar Bugs

**Antes de criar um issue:**

- Verifique se o bug já foi reportado
- Use a versão mais recente do código
- Teste com MongoDB E LocalDB (se aplicável)

**Ao reportar um bug, inclua:**

- Versão do bot (veja `package.json`)
- Sistema operacional
- Node.js version (`node --version`)
- Passos para reproduzir
- Comportamento esperado vs. observado
- Screenshots (se aplicável)
- Logs relevantes

**Template de Issue - Bug:**

```markdown
## Descrição

[Descrição clara do bug]

## Passos para Reproduzir

1. Execute comando X
2. Clique em Y
3. Veja erro

## Comportamento Esperado

[O que deveria acontecer]

## Comportamento Observado

[O que aconteceu]

## Ambiente

- SO: Windows 11
- Node: 20.11.0
- MongoDB: 7.0.0 / LocalDB
- Bot Version: 1.4.4

## Logs
```

[Cole logs aqui]

```

```

### 2. Sugerir Funcionalidades

**Antes de sugerir:**

- Verifique se já existe um issue similar
- Leia o [ROADMAP.md](docs/ROADMAP.md)

**Ao sugerir, inclua:**

- Problema que resolve
- Solução proposta
- Alternativas consideradas
- Impacto em funcionalidades existentes

**Template de Issue - Feature:**

```markdown
## Problema

[Qual problema isso resolve?]

## Solução Proposta

[Como você sugere resolver?]

## Alternativas

[Outras abordagens consideradas]

## Informações Adicionais

[Context, mockups, exemplos]
```

### 3. Contribuir com Código

#### 3.1. Setup do Ambiente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/discord-bot.git
cd discord-bot

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Inicie MongoDB (se usar)
docker-compose up -d mongodb

# Compile TypeScript
npm run build

# Inicie em modo dev
npm run dev
```

#### 3.2. Fluxo de Trabalho Git

```bash
# Crie uma branch para sua feature/fix
git checkout -b feat/nome-da-feature
# ou
git checkout -b fix/descricao-do-bug

# Faça commits atômicos
git add .
git commit -m "feat: adiciona funcionalidade X"

# Push para seu fork
git push origin feat/nome-da-feature

# Abra um Pull Request
```

#### 3.3. Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

**Tipos:**

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças em documentação
- `style`: Formatação, ponto-e-vírgula, etc (sem mudança de código)
- `refactor`: Refatoração de código (sem mudar comportamento)
- `perf`: Melhoria de performance
- `test`: Adicionar/corrigir testes
- `chore`: Tarefas de build, dependências, etc

**Exemplos:**

```bash
feat(acervo): adiciona paginação para classes
fix(ficha): corrige cálculo de PV de guerreiro
docs(readme): atualiza instruções de setup
perf(cache): implementa cache de compendium
refactor(database): simplifica queries de characters
test(services): adiciona testes para rollService
chore(deps): atualiza discord.js para 14.22.1
```

#### 3.4. Code Style

**TypeScript:**

```typescript
// ✅ BOM
export async function criarPersonagem(userId: string, nome: string): Promise<Character> {
    const character = await CharacterRepository.create({
        userId,
        nome,
        nivel: 1,
    });
    return character;
}

// ❌ RUIM
export async function criarPersonagem(userId: string, nome: string): Promise<Character> {
    const character = await CharacterRepository.create({ userId, nome, nivel: 1 });
    return character;
}
```

**Regras:**

- Use `async/await` ao invés de Promises
- Prefira `const` sobre `let`, nunca use `var`
- Use template strings ao invés de concatenação
- Sempre use tipos explícitos (evite `any`)
- Use `interface` para objetos, `type` para unions
- Funções devem ter no máximo 50 linhas
- Use nomes descritivos (evite abreviações)
- Comente apenas código complexo (código deve ser auto-explicativo)

**ESLint:**

```bash
# Verificar erros
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

#### 3.5. Testes

```typescript
// tests/unit/services/rollService.test.ts
import { describe, it, expect } from "vitest";
import { rolarDado } from "../../../src/services/rollService";

describe("rollService", () => {
    describe("rolarDado", () => {
        it("deve rolar 1d20 e retornar entre 1-20", () => {
            const resultado = rolarDado("1d20");
            expect(resultado.total).toBeGreaterThanOrEqual(1);
            expect(resultado.total).toBeLessThanOrEqual(20);
        });

        it("deve rolar 2d6+3 corretamente", () => {
            const resultado = rolarDado("2d6+3");
            expect(resultado.total).toBeGreaterThanOrEqual(5); // 2+3
            expect(resultado.total).toBeLessThanOrEqual(15); // 12+3
        });
    });
});
```

**Executar testes:**

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

#### 3.6. Pull Request

**Antes de abrir o PR:**

- [ ] Código compila sem erros (`npm run build`)
- [ ] Código passa no linter (`npm run lint`)
- [ ] Testes passam (`npm test`)
- [ ] Documentação atualizada (se necessário)
- [ ] CHANGELOG.md atualizado

**Template de PR:**

```markdown
## Tipo de Mudança

- [ ] 🐛 Bug fix
- [ ] ✨ Nova funcionalidade
- [ ] 🔧 Mudança em funcionalidade existente
- [ ] 📝 Documentação
- [ ] 🚀 Performance

## Descrição

[Descrição clara das mudanças]

## Issue Relacionada

Closes #123

## Como Testar

1. Execute comando X
2. Verifique Y
3. Confirme que Z acontece

## Checklist

- [ ] Código compila
- [ ] Lint passa
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] CHANGELOG atualizado

## Screenshots (se aplicável)

[Cole screenshots aqui]
```

---

## 📁 Estrutura de Arquivos

```
src/
├── discord/
│   ├── commands/         # Comandos do bot (slash commands)
│   ├── events/           # Event handlers (ready, interactionCreate)
│   ├── responders/       # Button/Select/Modal handlers
│   └── base/             # Base do framework
├── services/             # Lógica de negócio
├── database/             # Repositories e models
├── ui/                   # Embeds e cards
└── utils/                # Utilitários gerais

data/
├── compendium/           # Dados do compendium (JSON)
├── localdb/              # LocalDB fallback
├── import/               # Arquivos TXT fonte
└── templates/            # Templates gerados

docs/                     # Documentação completa
tests/                    # Testes automatizados
```

---

## 🏗️ Áreas para Contribuir

### 🌟 Alta Prioridade

- Testes automatizados (cobertura < 10%)
- Sistema de combate (iniciativa, turnos)
- Gestão de inventário
- Progressão de nível automática

### 📚 Documentação

- Guias de uso para jogadores
- Tutoriais em vídeo
- Tradução para inglês

### 🎨 UI/UX

- Melhorias em embeds
- Novos cards visuais
- Fluxos de interação

### 🚀 Performance

- Otimizar queries MongoDB
- Cache adicional
- Comprimir JSONs grandes

---

## 🔍 Revisão de Código

**O que revisamos:**

- ✅ Funcionalidade implementada corretamente
- ✅ Código segue convenções do projeto
- ✅ Testes cobrem casos de uso
- ✅ Documentação atualizada
- ✅ Performance não foi degradada
- ✅ Sem regressões

**Tempo de resposta:**

- Issues: 2-3 dias
- PRs: 3-5 dias
- PRs urgentes (bugs críticos): 24h

---

## 📞 Contato

- **Issues**: Use GitHub Issues
- **Discussões**: Use GitHub Discussions
- **Discord**: [Servidor do projeto](https://discord.gg/seu-convite)
- **Email**: seu-email@exemplo.com

---

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

**Obrigado por contribuir! 🎲✨**
