/**
 * Script de teste para visualizar a ficha de exemplo
 * Execute com: npm run test:ficha-exemplo
 */

import fs from "fs";
import {
    criarEmbedCombateFicha,
    criarEmbedGeralFicha,
    criarEmbedMagiasFicha,
} from "../src/ui/embeds/fichaEmbeds.js";

// Ler ficha de exemplo
const fichaExemplo = JSON.parse(fs.readFileSync("./exemplos/ficha-exemplo.json", "utf-8"));

console.log("\n🧿 FICHA DE EXEMPLO — A Sombra Escaroluz\n");
console.log("═".repeat(60));

// Aba Geral
console.log("\n📋 ABA 1: GERAL\n");
const embedGeral = criarEmbedGeralFicha(fichaExemplo);
console.log("Título:", embedGeral.data.title);
console.log("Cor:", embedGeral.data.color);
console.log("Descrição:", embedGeral.data.description);
console.log("Campos:");
embedGeral.data.fields?.forEach((field: any, i: number) => {
    console.log(`  ${i + 1}. ${field.name}`);
    console.log(`     ${field.value.substring(0, 80)}...`);
});

// Aba Combate
console.log("\n📋 ABA 2: COMBATE\n");
const embedCombate = criarEmbedCombateFicha(fichaExemplo);
console.log("Título:", embedCombate.data.title);
console.log("Cor:", embedCombate.data.color);
console.log("Campos:");
embedCombate.data.fields?.forEach((field: any, i: number) => {
    console.log(`  ${i + 1}. ${field.name}`);
    console.log(`     ${field.value.substring(0, 80)}`);
});

// Aba Magias
console.log("\n📋 ABA 5: MAGIAS\n");
const embedMagias = criarEmbedMagiasFicha(fichaExemplo);
console.log("Título:", embedMagias.data.title);
console.log("Cor:", embedMagias.data.color);
console.log("Descrição (primeiras linhas):");
console.log(embedMagias.data.description?.split("\n").slice(0, 3).join("\n"));

console.log("\n" + "═".repeat(60));
console.log("✅ Teste concluído! Fichas renderizadas com sucesso.");
console.log("\nPara visualizar no Discord:");
console.log("1. Use o comando: /ficha criar");
console.log("2. Ou importe o exemplo: npm run import:exemplo-ficha\n");
