/**
 * Script de teste para verificar a nova organização de classes
 */

import fs from "fs";
import path from "path";
import { lazyLoader } from "../services/lazyCompendiumLoader.js";

console.log("=".repeat(60));
console.log("🧪 TESTE: Nova Organização de Classes");
console.log("=".repeat(60));
console.log();

// 1. Verificar se os arquivos existem
console.log("📁 Verificando arquivos...");
const classesBasePath = path.join(process.cwd(), "data/compendium/classes-base.json");
const variantesPath = path.join(process.cwd(), "data/compendium/classes-variantes.json");

const classesBaseExists = fs.existsSync(classesBasePath);
const variantesExists = fs.existsSync(variantesPath);

console.log(`   ✓ classes-base.json: ${classesBaseExists ? "✅ Existe" : "❌ Não encontrado"}`);
console.log(`   ✓ classes-variantes.json: ${variantesExists ? "✅ Existe" : "❌ Não encontrado"}`);
console.log();

if (!classesBaseExists || !variantesExists) {
    console.error("❌ Arquivos necessários não encontrados!");
    process.exit(1);
}

// 2. Carregar dados dos arquivos
console.log("📖 Carregando dados dos arquivos...");
const classesBaseData = JSON.parse(fs.readFileSync(classesBasePath, "utf-8"));
const variantesData = JSON.parse(fs.readFileSync(variantesPath, "utf-8"));

const classesBaseCount = classesBaseData.classes?.length || 0;
const variantesCount = variantesData.variantes?.length || 0;

console.log(`   ✓ Classes Base: ${classesBaseCount}`);
console.log(`   ✓ Variantes: ${variantesCount}`);
console.log(`   ✓ Total: ${classesBaseCount + variantesCount}`);
console.log();

// 3. Testar LazyLoader
console.log("🔄 Testando LazyLoader...");
const classes = lazyLoader.getClasses();
console.log(`   ✓ Classes carregadas pelo LazyLoader: ${classes.length}`);
console.log();

// 4. Verificar tipos
console.log("🔍 Verificando tipos de classes...");
const classesBase = classes.filter((c: any) => c.tipo === "classe_base");
const variantes = classes.filter((c: any) => c.tipo === "variante");

console.log(`   ✓ Classes Base carregadas: ${classesBase.length}`);
console.log(`   ✓ Variantes carregadas: ${variantes.length}`);
console.log();

// 5. Exemplos
console.log("📋 Exemplos de Classes Base:");
classesBase.slice(0, 3).forEach((c: any) => {
    console.log(`   • ${c.nome} (${c.id}) - ${c.fonte}`);
});
console.log();

console.log("📋 Exemplos de Variantes:");
variantes.slice(0, 3).forEach((c: any) => {
    console.log(`   • ${c.nome} (${c.id}) - ${c.fonte} - Base: ${c.classe_base || "N/A"}`);
});
console.log();

// 6. Validações
console.log("✅ Validações:");
const issues: string[] = [];

// Verificar se todas as variantes têm classe_base
variantes.forEach((v: any) => {
    if (!v.classe_base) {
        issues.push(`Variante "${v.nome}" (${v.id}) não tem campo classe_base`);
    }
});

// Verificar se classes_base existem para as variantes
variantes.forEach((v: any) => {
    if (v.classe_base) {
        const baseExists = classesBase.some((c: any) => c.id === v.classe_base);
        if (!baseExists) {
            issues.push(
                `Variante "${v.nome}" referencia classe base inexistente: ${v.classe_base}`
            );
        }
    }
});

if (issues.length > 0) {
    console.log("   ⚠️ Problemas encontrados:");
    issues.forEach((issue) => console.log(`      - ${issue}`));
} else {
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

console.log("=".repeat(60));
console.log("✅ TESTE CONCLUÍDO COM SUCESSO!");
console.log("=".repeat(60));
