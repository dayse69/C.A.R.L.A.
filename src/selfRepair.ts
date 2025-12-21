import fs from "fs";
import path from "path";

const ENABLED = process.env.CARLA_SELF_REPAIR === "true";

export function isSelfRepairEnabled() {
    return ENABLED;
}

export function reportError(error: any, context: Record<string, any> = {}) {
    if (!ENABLED) return;

    const time = new Date();
    const timestamp = time.toISOString();
    const id = Date.now();

    const diagnosticsDir = path.resolve("diagnostics");
    if (!fs.existsSync(diagnosticsDir)) {
        fs.mkdirSync(diagnosticsDir, { recursive: true });
    }

    const normalizedError = {
        name: error?.name ?? "UnknownError",
        message: error?.message ?? String(error),
        stack: error?.stack ?? null,
    };

    /* ---------------- JSON (técnico) ---------------- */

    const jsonReport = {
        id,
        timestamp,
        environment: "TEST",
        error: normalizedError,
        context,
        node: process.version,
        platform: process.platform,
    };

    const jsonPath = path.join(diagnosticsDir, `diag-${id}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));

    /* ---------------- MD (amigável para IA) ---------------- */

    const mdReport = `
# 🛠️ C.A.R.L.A. — Auto Repair Diagnostic Report

## 📌 Identificação
- **ID:** ${id}
- **Timestamp:** ${timestamp}
- **Ambiente:** TEST
- **Node.js:** ${process.version}
- **Plataforma:** ${process.platform}

---

## ❌ Erro Capturado

**Tipo:** ${normalizedError.name}

**Mensagem:**
\`\`\`
${normalizedError.message}
\`\`\`

---

## 📍 Stack Trace
\`\`\`
${normalizedError.stack ?? "Stack indisponível"}
\`\`\`

---

## 🧠 Contexto do Sistema
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

---

## 🤖 Instruções para IA

Você é uma IA analisando um erro de runtime em um bot de Discord
feito em Node.js + TypeScript.

Objetivo:
1. Identificar a causa provável do erro
2. Sugerir correção no código
3. Indicar se é erro de lógica, configuração ou ambiente
4. Propor melhoria preventiva

⚠️ Não execute código.
⚠️ Não invente dependências.
⚠️ Considere que este erro ocorreu em ambiente de TESTE.

---

## 📎 Arquivo Técnico Relacionado
- JSON: \`diag-${id}.json\`
`;

    const mdPath = path.join(diagnosticsDir, `diag-${id}.md`);
    fs.writeFileSync(mdPath, mdReport.trim());

    console.log("🛠️ [C.A.R.L.A.] Diagnóstico gerado:");
    console.log(" →", jsonPath);
    console.log(" →", mdPath);
}
