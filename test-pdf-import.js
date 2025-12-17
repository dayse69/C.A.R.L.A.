/**
 * Teste rápido do fluxo de PDF parsing
 */

const fs = require("fs");
const path = require("path");

async function testPDFParsing() {
    try {
        console.log("1. Importando pdf-parse...");
        const pdfParse = require("pdf-parse");
        console.log("✅ pdf-parse importado");

        // Criar um PDF de teste mínimo (se não tiver um real)
        console.log("\n2. Para testar, coloque um PDF de ficha em: ./test-ficha.pdf");

        const testPdfPath = "./test-ficha.pdf";
        if (!fs.existsSync(testPdfPath)) {
            console.log("⚠️  Nenhum test-ficha.pdf encontrado.");
            console.log("   Coloque um PDF de ficha de teste aqui e rode novamente.");
            return;
        }

        console.log("3. Lendo arquivo PDF...");
        const dataBuffer = fs.readFileSync(testPdfPath);
        console.log(`✅ PDF lido: ${dataBuffer.length} bytes`);

        console.log("4. Extraindo texto...");
        const data = await pdfParse(dataBuffer);
        console.log(`✅ Texto extraído: ${data.text.length} caracteres`);
        console.log("\nPrimeiros 500 caracteres:");
        console.log("─".repeat(60));
        console.log(data.text.substring(0, 500));
        console.log("─".repeat(60));

        // Testar parsing básico
        console.log("\n5. Testando parser de ficha...");
        const nomeMatch = data.text.match(/(?:Nome|NAME)[\s:]*([^\n]+)/i);
        const racaMatch = data.text.match(/(?:Raça|Race)[\s:]*([^\n]+)/i);
        const classeMatch = data.text.match(/(?:Classe|Class)[\s:]*([^\n]+)/i);

        console.log("Dados extraídos:");
        console.log(`  Nome: ${nomeMatch ? nomeMatch[1].trim() : "não encontrado"}`);
        console.log(`  Raça: ${racaMatch ? racaMatch[1].trim() : "não encontrado"}`);
        console.log(`  Classe: ${classeMatch ? classeMatch[1].trim() : "não encontrado"}`);

        console.log("\n✅ Teste completo! O sistema de PDF está funcional.");
    } catch (error) {
        console.error("\n❌ Erro no teste:", error);
        console.error("Stack:", error.stack);
    }
}

testPDFParsing();
