import { logger } from "../utils/logger.js";
/**
 * Script para separar acervo-do-golem.json em arquivos menores
 * Reduz I/O e melhora performance de carregamento
 */
import fs from "fs";
import path from "path";
async function splitCompendium() {
    console.log("📦 Separando acervo-do-golem.json...\n");
    const acervoPath = path.join(process.cwd(), "data/compendium/acervo-do-golem.json");
    const outputDir = path.join(process.cwd(), "data/compendium/split");
    // Criar diretório de saída
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    // Ler arquivo grande
    console.log("📖 Lendo acervo-do-golem.json...");
    const startRead = performance.now();
    const acervoData = JSON.parse(fs.readFileSync(acervoPath, "utf-8"));
    const readTime = (performance.now() - startRead).toFixed(2);
    console.log(`✅ Leitura completa em ${readTime}ms\n`);
    // Estatísticas
    const stats = {
        classes: (acervoData.classes || []).length,
        classes_alternativas: (acervoData.classes_alternativas || []).length,
        racas: (acervoData.racas || []).length,
        poderes: (acervoData.poderes || []).length,
        magias: (acervoData.magias || []).length,
        itens: (acervoData.itens || []).length,
        deuses: (acervoData.deuses || []).length,
    };
    console.log("📊 Estatísticas do Acervo:");
    Object.entries(stats).forEach(([key, count]) => {
        if (count > 0) {
            console.log(`  ${key}: ${count} itens`);
        }
    });
    console.log("");
    // Separar em arquivos
    const startSplit = performance.now();
    let totalSize = 0;
    const files = [];
    // Classes (principais + alternativas)
    if (stats.classes > 0 || stats.classes_alternativas > 0) {
        const classesData = {
            classes: acervoData.classes || [],
            classes_alternativas: acervoData.classes_alternativas || [],
            metadata: {
                total: stats.classes + stats.classes_alternativas,
                principais: stats.classes,
                alternativas: stats.classes_alternativas,
                generated_at: new Date().toISOString(),
            },
        };
        const filePath = path.join(outputDir, "classes.json");
        const content = JSON.stringify(classesData, null, 2);
        fs.writeFileSync(filePath, content);
        const size = Buffer.byteLength(content, "utf-8");
        totalSize += size;
        files.push({
            name: "classes.json",
            size: size,
            items: stats.classes + stats.classes_alternativas,
        });
        console.log(`✅ classes.json criado (${(size / 1024).toFixed(2)} KB)`);
    }
    // Raças
    if (stats.racas > 0) {
        const racasData = {
            racas: acervoData.racas || [],
            metadata: {
                total: stats.racas,
                generated_at: new Date().toISOString(),
            },
        };
        const filePath = path.join(outputDir, "racas.json");
        const content = JSON.stringify(racasData, null, 2);
        fs.writeFileSync(filePath, content);
        const size = Buffer.byteLength(content, "utf-8");
        totalSize += size;
        files.push({ name: "racas.json", size: size, items: stats.racas });
        console.log(`✅ racas.json criado (${(size / 1024).toFixed(2)} KB)`);
    }
    // Poderes
    if (stats.poderes > 0) {
        const poderesData = {
            poderes: acervoData.poderes || [],
            metadata: {
                total: stats.poderes,
                generated_at: new Date().toISOString(),
            },
        };
        const filePath = path.join(outputDir, "poderes.json");
        const content = JSON.stringify(poderesData, null, 2);
        fs.writeFileSync(filePath, content);
        const size = Buffer.byteLength(content, "utf-8");
        totalSize += size;
        files.push({ name: "poderes.json", size: size, items: stats.poderes });
        console.log(`✅ poderes.json criado (${(size / 1024).toFixed(2)} KB)`);
    }
    // Magias
    if (stats.magias > 0) {
        const magiasData = {
            magias: acervoData.magias || [],
            metadata: {
                total: stats.magias,
                generated_at: new Date().toISOString(),
            },
        };
        const filePath = path.join(outputDir, "magias.json");
        const content = JSON.stringify(magiasData, null, 2);
        fs.writeFileSync(filePath, content);
        const size = Buffer.byteLength(content, "utf-8");
        totalSize += size;
        files.push({ name: "magias.json", size: size, items: stats.magias });
        console.log(`✅ magias.json criado (${(size / 1024).toFixed(2)} KB)`);
    }
    // Itens
    if (stats.itens > 0) {
        const itensData = {
            itens: acervoData.itens || [],
            metadata: {
                total: stats.itens,
                generated_at: new Date().toISOString(),
            },
        };
        const filePath = path.join(outputDir, "itens.json");
        const content = JSON.stringify(itensData, null, 2);
        fs.writeFileSync(filePath, content);
        const size = Buffer.byteLength(content, "utf-8");
        totalSize += size;
        files.push({ name: "itens.json", size: size, items: stats.itens });
        console.log(`✅ itens.json criado (${(size / 1024).toFixed(2)} KB)`);
    }
    // Deuses
    if (stats.deuses > 0) {
        const deusesData = {
            deuses: acervoData.deuses || [],
            metadata: {
                total: stats.deuses,
                generated_at: new Date().toISOString(),
            },
        };
        const filePath = path.join(outputDir, "deuses.json");
        const content = JSON.stringify(deusesData, null, 2);
        fs.writeFileSync(filePath, content);
        const size = Buffer.byteLength(content, "utf-8");
        totalSize += size;
        files.push({ name: "deuses.json", size: size, items: stats.deuses });
        console.log(`✅ deuses.json criado (${(size / 1024).toFixed(2)} KB)`);
    }
    // Criar índice
    const indexData = {
        version: "1.0.0",
        generated_at: new Date().toISOString(),
        source: "acervo-do-golem.json",
        files: files.map((f) => ({
            name: f.name,
            size_kb: (f.size / 1024).toFixed(2),
            items: f.items,
        })),
        total_items: Object.values(stats).reduce((a, b) => a + b, 0),
        total_size_kb: (totalSize / 1024).toFixed(2),
    };
    const indexPath = path.join(outputDir, "index.json");
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    const splitTime = (performance.now() - startSplit).toFixed(2);
    console.log(`\n✅ Separação completa em ${splitTime}ms`);
    console.log(`\n📊 Resultado:`);
    console.log(`  ${files.length} arquivos criados`);
    console.log(`  ${(totalSize / 1024).toFixed(2)} KB total`);
    console.log(`  ${Object.values(stats).reduce((a, b) => a + b, 0)} itens processados`);
    console.log(`\n📁 Arquivos salvos em: data/compendium/split/`);
}
splitCompendium().catch(logger.error);
