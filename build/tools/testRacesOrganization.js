/**
 * Script de teste para verificar a organização de raças
 */
import fs from "fs";
import path from "path";
import { lazyLoader } from "../services/lazyCompendiumLoader.js";
console.log("=".repeat(60));
console.log("🧪 TESTE: Organização de Raças");
console.log("=".repeat(60));
console.log();
// 1. Verificar se os arquivos existem
console.log("📁 Verificando arquivos...");
const racasBasePath = path.join(process.cwd(), "data/compendium/racas-base.json");
const racesPath = path.join(process.cwd(), "data/compendium/races.json");
const racasBaseExists = fs.existsSync(racasBasePath);
const racesExists = fs.existsSync(racesPath);
console.log(`   ✓ racas-base.json: ${racasBaseExists ? "✅ Existe" : "❌ Não encontrado"}`);
console.log(`   ✓ races.json (antigo): ${racesExists ? "✅ Existe" : "❌ Não encontrado"}`);
console.log();
if (!racasBaseExists) {
    logger.error("❌ Arquivo racas-base.json não encontrado!");
    process.exit(1);
}
// 2. Carregar dados do arquivo
console.log("📖 Carregando dados do arquivo...");
const racasBaseData = JSON.parse(fs.readFileSync(racasBasePath, "utf-8"));
const racasCount = racasBaseData.racas?.length || 0;
console.log(`   ✓ Raças Base: ${racasCount}`);
console.log();
// 3. Testar LazyLoader
console.log("🔄 Testando LazyLoader...");
const racas = lazyLoader.getRacas();
console.log(`   ✓ Raças carregadas pelo LazyLoader: ${racas.length}`);
console.log();
// 4. Verificar tipos
console.log("🔍 Verificando tipos de raças...");
const racasBase = racas.filter((r) => r.tipo === "raca_base");
console.log(`   ✓ Raças Base carregadas: ${racasBase.length}`);
console.log();
// 5. Exemplos
console.log("📋 Exemplos de Raças Base:");
racasBase.slice(0, 5).forEach((r) => {
    console.log(`   • ${r.nome} (${r.id}) - ${r.fonte || "N/A"}`);
});
console.log();
// 6. Validações
console.log("✅ Validações:");
const issues = [];
// Verificar se todas têm ID e nome
racas.forEach((r) => {
    if (!r.id) {
        issues.push(`Raça sem ID: ${r.nome || "desconhecida"}`);
    }
    if (!r.nome && !r.name) {
        issues.push(`Raça sem nome: ${r.id || "desconhecida"}`);
    }
});
// Verificar atributos
const racasComModificadores = racas.filter((r) => r.modificadores_atributo || r.attributeModifiers);
console.log(`   ✓ Raças com modificadores de atributo: ${racasComModificadores.length}/${racas.length}`);
// Verificar habilidades
const racasComHabilidades = racas.filter((r) => (r.habilidades || r.abilities)?.length > 0);
console.log(`   ✓ Raças com habilidades: ${racasComHabilidades.length}/${racas.length}`);
if (issues.length > 0) {
    console.log("   ⚠️ Problemas encontrados:");
    issues.forEach((issue) => console.log(`      - ${issue}`));
}
else {
    console.log("   ✅ Todas as validações passaram!");
}
console.log();
// 7. Estatísticas do LazyLoader
console.log("📊 Estatísticas do LazyLoader:");
const stats = lazyLoader.getStats();
console.log(`   • Modo: ${stats.mode}`);
console.log(`   • Cache ativo: ${stats.cached.join(", ") || "nenhum"}`);
console.log(`   • Total de carregamentos: ${stats.totalLoads}`);
console.log(`   • Tempo médio: ${stats.avgLoadTime}ms`);
console.log();
// 8. Comparar com arquivo antigo (se existir)
if (racesExists) {
    console.log("🔄 Comparando com races.json (formato antigo)...");
    const racesOldData = JSON.parse(fs.readFileSync(racesPath, "utf-8"));
    const racesOldCount = racesOldData.races?.length || 0;
    console.log(`   • Raças no races.json: ${racesOldCount}`);
    console.log(`   • Raças no racas-base.json: ${racasCount}`);
    if (racesOldCount === racasCount) {
        console.log("   ✅ Contagem compatível!");
    }
    else {
        console.log(`   ⚠️ Diferença de ${Math.abs(racesOldCount - racasCount)} raças`);
    }
    console.log();
}
console.log("=".repeat(60));
console.log("✅ TESTE CONCLUÍDO COM SUCESSO!");
console.log("=".repeat(60));
