#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as readline from "readline";

const ACERVO_PATH = join(process.cwd(), "data", "compendium", "acervo-do-golem.json");

interface AcervoData {
    origens: any[];
    racas: any[];
    classes: any[];
    classes_alternativas: any[];
    poderes_gerais: {
        racial: any[];
        combate: any[];
        destino: any[];
        magia: any[];
        tormenta: any[];
        concedido: any[];
    };
    deuses_maiores: any[];
    deuses_menores: any[];
    deuses_servidores: any[];
    distincoes: any[];
    bases: any[];
    dominios: any[];
    itens: {
        mundanos: any[];
        consumiveis: any[];
        magicos: any[];
        aprimorados: any[];
    };
}

function loadAcervo(): AcervoData {
    const raw = readFileSync(ACERVO_PATH, "utf-8");
    return JSON.parse(raw);
}

function saveAcervo(data: AcervoData) {
    writeFileSync(ACERVO_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function showStats(data: AcervoData) {
    const poderesTotal = Object.values(data.poderes_gerais || {}).reduce(
        (sum, arr) => sum + (arr?.length || 0),
        0
    );
    const itensTotal = Object.values(data.itens || {}).reduce(
        (sum, arr) => sum + (arr?.length || 0),
        0
    );
    const deusesTotal =
        (data.deuses_maiores?.length || 0) +
        (data.deuses_menores?.length || 0) +
        (data.deuses_servidores?.length || 0);

    console.log("\n📚 === ACERVO DO GOLEM - RESUMO === 📚");
    console.log(`🧬 Raças: ${data.racas?.length || 0}`);
    console.log(`⚔️  Classes: ${data.classes?.length || 0}`);
    console.log(`🎭 Classes Alternativas: ${data.classes_alternativas?.length || 0}`);
    console.log(`✨ Poderes Gerais: ${poderesTotal}`);
    console.log(
        `   ├─ Racial: ${data.poderes_gerais?.racial?.length || 0}, Combate: ${data.poderes_gerais?.combate?.length || 0}, Destino: ${data.poderes_gerais?.destino?.length || 0}`
    );
    console.log(
        `   └─ Magia: ${data.poderes_gerais?.magia?.length || 0}, Tormenta: ${data.poderes_gerais?.tormenta?.length || 0}, Concedido: ${data.poderes_gerais?.concedido?.length || 0}`
    );
    console.log(`📦 Itens: ${itensTotal}`);
    console.log(
        `   ├─ Mundanos: ${data.itens?.mundanos?.length || 0}, Consumíveis: ${data.itens?.consumiveis?.length || 0}`
    );
    console.log(
        `   └─ Mágicos: ${data.itens?.magicos?.length || 0}, Aprimorados: ${data.itens?.aprimorados?.length || 0}`
    );
    console.log(`🕯️  Divindades: ${deusesTotal}`);
    console.log(
        `   ├─ Maiores: ${data.deuses_maiores?.length || 0}, Menores: ${data.deuses_menores?.length || 0}, Servidores: ${data.deuses_servidores?.length || 0}`
    );
    console.log(`🏆 Distinções: ${data.distincoes?.length || 0}`);
    console.log(`📜 Bases: ${data.bases?.length || 0}`);
    console.log(`🎭 Domínios: ${data.dominios?.length || 0}`);
    console.log(`📖 Origens: ${data.origens?.length || 0}\n`);
}

function listItems(category: keyof AcervoData, data: AcervoData, limit = 50) {
    const items = data[category];
    if (Array.isArray(items)) {
        console.log(`\n📋 === ${category.toUpperCase()} (${items.length} itens) ===`);
        items.slice(0, limit).forEach((item, i) => {
            console.log(`${i + 1}. ${item.nome || item.name || item.id || "Sem nome"}`);
        });
        if (items.length > limit) console.log(`... e mais ${items.length - limit} itens`);
    } else {
        console.log(`\n📂 === ${category.toUpperCase()} ===`);
        for (const [key, arr] of Object.entries(items)) {
            console.log(`  ${key}: ${arr.length} itens`);
        }
    }
}

function searchItems(query: string, data: AcervoData) {
    const results: any[] = [];
    const q = query.toLowerCase();

    // Parse filter parameters (e.g., "type:classe subtipo:magia nome:fireball")
    const filters = new Map<string, string>();
    let searchTerm = "";
    
    const parts = q.split(/\s+/);
    parts.forEach((part) => {
        if (part.includes(":")) {
            const [key, value] = part.split(":", 2);
            filters.set(key, value);
        } else {
            searchTerm += (searchTerm ? " " : "") + part;
        }
    });

    function matches(item: any, categoryName: string): boolean {
        // Check type filter
        const typeFilter = filters.get("type");
        if (typeFilter) {
            // Map category names to types
            const typeMap: { [key: string]: string } = {
                "Raças": "raca",
                "Classes": "classe",
                "Classes Alternativas": "classe_alternativa",
                "Origens": "origem",
                "Poderes/racial": "poder",
                "Poderes/combate": "poder",
                "Poderes/destino": "poder",
                "Poderes/magia": "poder",
                "Poderes/tormenta": "poder",
                "Poderes/concedido": "poder",
                "Itens/mundanos": "item",
                "Itens/consumiveis": "item",
                "Itens/magicos": "item",
                "Itens/aprimorados": "item",
                "Deuses Maiores": "deus",
                "Deuses Menores": "deus",
                "Deuses Servidores": "deus",
                "Distinções": "distincao",
                "Bases": "base",
                "Domínios": "dominio",
            };
            const itemType = typeMap[categoryName]?.toLowerCase() || categoryName.toLowerCase();
            if (!itemType.includes(typeFilter)) {
                return false;
            }
        }

        // Check subtipo filter
        const subtipoFilter = filters.get("subtipo");
        if (subtipoFilter && item.SUBTIPO) {
            if (!item.SUBTIPO.toLowerCase().includes(subtipoFilter)) {
                return false;
            }
        }

        // Check nome filter
        const nomeFilter = filters.get("nome");
        if (nomeFilter) {
            const name = (item.nome || item.name || "").toLowerCase();
            if (!name.includes(nomeFilter)) {
                return false;
            }
        }

        // Check search term in nome/descricao
        if (searchTerm) {
            const name = (item.nome || item.name || "").toLowerCase();
            const desc = (item.descricao || item.description || "").toLowerCase();
            if (!name.includes(searchTerm) && !desc.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    }

    function searchArray(arr: any[], categoryName: string) {
        arr.forEach((item) => {
            if (matches(item, categoryName)) {
                results.push({ item, category: categoryName });
            }
        });
    }

    searchArray(data.racas, "Raças");
    searchArray(data.classes, "Classes");
    searchArray(data.classes_alternativas, "Classes Alternativas");
    searchArray(data.origens, "Origens");
    Object.entries(data.poderes_gerais).forEach(([key, arr]) => searchArray(arr, `Poderes/${key}`));
    Object.entries(data.itens).forEach(([key, arr]) => searchArray(arr, `Itens/${key}`));
    searchArray(data.deuses_maiores, "Deuses Maiores");
    searchArray(data.deuses_menores, "Deuses Menores");
    searchArray(data.deuses_servidores, "Deuses Servidores");
    searchArray(data.distincoes, "Distinções");
    searchArray(data.bases, "Bases");
    searchArray(data.dominios, "Domínios");

    console.log(`\n🔍 Resultados para "${query}" (${results.length} encontrados):`);
    results.slice(0, 20).forEach((r, i) => {
        console.log(`${i + 1}. [${r.category}] ${r.item.nome || r.item.name || r.item.id}`);
    });
    if (results.length > 20) console.log(`... e mais ${results.length - 20} resultados`);
}

function deleteItem(category: string, itemName: string, data: AcervoData): boolean {
    const targets: any[] = [];

    function removeFromArray(arr: any[], categoryName: string) {
        const idx = arr.findIndex(
            (item) =>
                (item.nome || item.name || item.id || "").toLowerCase() === itemName.toLowerCase()
        );
        if (idx !== -1) {
            targets.push({ arr, idx, categoryName });
            return true;
        }
        return false;
    }

    let found = false;
    if (category === "racas") found = removeFromArray(data.racas, "Raças");
    else if (category === "classes") found = removeFromArray(data.classes, "Classes");
    else if (category === "classes_alternativas")
        found = removeFromArray(data.classes_alternativas, "Classes Alternativas");
    else if (category === "origens") found = removeFromArray(data.origens, "Origens");
    else if (category.startsWith("poderes/")) {
        const sub = category.split("/")[1] as keyof typeof data.poderes_gerais;
        found = removeFromArray(data.poderes_gerais[sub], `Poderes/${sub}`);
    } else if (category.startsWith("itens/")) {
        const sub = category.split("/")[1] as keyof typeof data.itens;
        found = removeFromArray(data.itens[sub], `Itens/${sub}`);
    } else if (category === "deuses_maiores")
        found = removeFromArray(data.deuses_maiores, "Deuses Maiores");
    else if (category === "deuses_menores")
        found = removeFromArray(data.deuses_menores, "Deuses Menores");
    else if (category === "deuses_servidores")
        found = removeFromArray(data.deuses_servidores, "Deuses Servidores");
    else if (category === "distincoes") found = removeFromArray(data.distincoes, "Distinções");
    else if (category === "bases") found = removeFromArray(data.bases, "Bases");
    else if (category === "dominios") found = removeFromArray(data.dominios, "Domínios");

    if (found && targets.length > 0) {
        targets.forEach((t) => {
            t.arr.splice(t.idx, 1);
            console.log(`✅ Removido de ${t.categoryName}`);
        });
        return true;
    }
    return false;
}

async function promptUser(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function interactiveMode() {
    console.log("🎮 === MODO INTERATIVO - ACERVO MANAGER ===");
    console.log("Comandos:");
    console.log("  stats          - Ver resumo completo");
    console.log("  list <cat>     - Listar itens (ex: list racas, list classes)");
    console.log("  search <termo> - Buscar no acervo");
    console.log("  delete <cat> <nome> - Remover item");
    console.log("  exit           - Sair\n");

    let running = true;
    while (running) {
        const input = await promptUser("> ");
        const [cmd, ...args] = input.trim().split(/\s+/);

        if (!cmd || cmd === "exit") {
            running = false;
            console.log("👋 Até logo!");
            break;
        }

        const data = loadAcervo();

        switch (cmd) {
            case "stats":
                showStats(data);
                break;
            case "list":
                if (args[0]) {
                    listItems(args[0] as keyof AcervoData, data);
                } else {
                    console.log("❌ Use: list <categoria>");
                }
                break;
            case "search":
                if (args.length > 0) {
                    searchItems(args.join(" "), data);
                } else {
                    console.log("❌ Use: search <termo>");
                }
                break;
            case "delete":
                if (args.length >= 2) {
                    const [cat, ...nameParts] = args;
                    const name = nameParts.join(" ");
                    const confirm = await promptUser(
                        `⚠️ Confirma remoção de "${name}" da categoria "${cat}"? (s/n): `
                    );
                    if (confirm.toLowerCase() === "s" || confirm.toLowerCase() === "y") {
                        const removed = deleteItem(cat, name, data);
                        if (removed) {
                            saveAcervo(data);
                            console.log("💾 Acervo salvo!");
                        } else {
                            console.log("❌ Item não encontrado");
                        }
                    }
                } else {
                    console.log("❌ Use: delete <categoria> <nome>");
                }
                break;
            default:
                console.log(`❓ Comando desconhecido: ${cmd}`);
        }
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Modo interativo
        await interactiveMode();
        return;
    }

    const data = loadAcervo();

    const cmd = args[0];
    switch (cmd) {
        case "stats":
            showStats(data);
            break;
        case "list":
            if (args[1]) {
                listItems(args[1] as keyof AcervoData, data);
            } else {
                console.log("Uso: acervo list <categoria>");
            }
            break;
        case "search":
            if (args[1]) {
                searchItems(args.slice(1).join(" "), data);
            } else {
                console.log("Uso: acervo search <termo>");
            }
            break;
        case "delete":
            if (args.length >= 3) {
                const [, cat, ...nameParts] = args;
                const name = nameParts.join(" ");
                const removed = deleteItem(cat, name, data);
                if (removed) {
                    saveAcervo(data);
                    console.log("💾 Acervo salvo!");
                } else {
                    console.log("❌ Item não encontrado");
                }
            } else {
                console.log("Uso: acervo delete <categoria> <nome>");
            }
            break;
        default:
            console.log("Comandos: stats, list, search, delete");
    }
}

main();
