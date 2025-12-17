# 📋 Guia de Teste: Importação de PDF no /criar

## ✨ O que foi implementado

Agora o comando `/criar` aceita um anexo PDF para importar fichas automaticamente:

```
/criar nome:Gandalf pdf:[anexar-ficha.pdf]
```

## 🔍 Status atual

- ✅ Código implementado com logs detalhados
- ✅ pdf-parse instalado e funcional
- ✅ Bot online e registrado
- ⚠️ Comando pode estar com registro antigo no Discord

## 🧪 Como testar

### 1. Forçar re-registro do comando

O Discord cacheia comandos. Como adicionamos a opção `pdf` (Attachment), precisamos forçar atualização:

**Opção A: Aguardar cache expirar** (até 1 hora)

**Opção B: Remover e re-adicionar o bot**

- Remova o bot do servidor de teste
- Re-adicione com o link de convite

**Opção C: Usar comando de desenvolvedor** (se tiver)

- No Discord: Configurações > Integrações > Bots > Atualizar Comandos

### 2. Testar sem PDF primeiro

```
/criar nome:TesteSemPDF
```

Deve mostrar o menu de seleção normalmente.

### 3. Testar com PDF

```
/criar nome:TesteComPDF pdf:[anexar-ficha-tormenta20.pdf]
```

**Logs esperados no terminal:**

```
[criar] command invoked by user=... nome=TesteComPDF
[criar] importando PDF da ficha: ficha.pdf url=...
[criar] baixando PDF para: C:\Users\...\tmp\...
[criar] PDF baixado: XXXX bytes
[criar] extraindo texto do PDF...
[criar] texto extraído: ...
[criar] ficha parseada: nome=... raca=... classe=...
[criar] ficha importada de PDF criada id=...
```

## 🐛 Se o comando travar em "pensando..."

### Verificar logs

Verifique o terminal do bot. Se não houver NENHUM log após executar `/criar`:

1. **O comando não foi registrado com a nova opção `pdf`**
    - Aguarde 30-60 minutos para cache do Discord expirar
    - Ou remova/re-adicione o bot

2. **Erro silencioso no Discord.js**
    - Verifique se há algum erro no terminal após executar

### Se houver log mas travar no processamento:

1. **Verificar se o PDF é válido**

    ```bash
    node test-pdf-import.js
    ```

    (Coloque um PDF de teste como `test-ficha.pdf` na raiz)

2. **Timeout do Discord (3 segundos)**
    - PDFs muito grandes podem demorar
    - Solução: adicionar mensagem intermediária

## 📝 Arquivos modificados

- `src/discord/commands/public/criar.ts` - Lógica de import
- `test-pdf-import.js` - Script de teste local

## 🔧 Próximos passos se necessário

### Se o problema for timeout:

Podemos adicionar uma mensagem de progresso:

```typescript
await interaction.editReply({ content: "⏳ Extraindo dados do PDF..." });
// ... processar ...
await interaction.editReply({ content: "💾 Salvando ficha..." });
```

### Se o parsing falhar:

Podemos melhorar o `parsearFichaPDF()` em:

- `src/services/pdfParserService.ts`

## 📞 Debug rápido

Execute no terminal do projeto:

```powershell
# Testar pdf-parse
node -e "require('pdf-parse'); console.log('OK')"

# Ver logs ao vivo
npm run dev

# Verificar processos node rodando
Get-Process node | Select-Object Id, StartTime
```

## ✅ Checklist de validação

- [ ] Bot online no Discord
- [ ] Comando `/criar` aparece no autocomplete
- [ ] Opção `pdf` aparece nas opções do comando
- [ ] Teste sem PDF funciona (mostra menu)
- [ ] Teste com PDF funciona (importa e mostra card)
- [ ] Logs aparecem no terminal ao executar

---

**Última atualização:** 2025-12-12 22:30  
**Status:** Implementação completa, aguardando teste no Discord
