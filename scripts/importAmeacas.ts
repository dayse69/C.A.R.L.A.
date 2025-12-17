import * as fs from "fs";
import * as path from "path";

interface Creature {
    name: string;
    type: string; // Humanoides, Monstro, Morto-vivo, Construto, etc.
    size: string; // Médio, Grande, Pequeno, etc.
    nd: number; // Nível de Desafio
    description: string;
    traits: {
        initiative?: string;
        perception?: string;
        defense?: string;
        saves?: {
            fort?: number;
            ref?: number;
            will?: number;
        };
        hp?: number;
        movement?: string;
        mana?: number;
    };
    attributes: {
        strength?: string;
        dexterity?: string;
        constitution?: string;
        intelligence?: string;
        wisdom?: string;
        charisma?: string;
    };
    abilities: Array<{
        name: string;
        type: string;
        description: string;
    }>;
    attacks: Array<{
        name: string;
        bonus?: number;
        damage?: string;
    }>;
    skills?: string[];
    spells?: string[];
    equipment?: string;
    treasure?: string;
    source: string;
}

function extractCreaturesFromTxt(filePath: string): Creature[] {
    const content = fs.readFileSync(filePath, "utf-8");
    const creatures: Creature[] = [];

    // Split by creature entries - creatures typically start with a name and type on separate lines
    const lines = content.split("\n");

    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();

        // Look for ND pattern (Nível de Desafio)
        if (line.match(/^ND\s+(\d+|[A-Z\+]+)/i)) {
            const ndMatch = line.match(/ND\s+([\d\+A-Z]+)/i);
            if (!ndMatch) {
                i++;
                continue;
            }

            // Work backwards to find creature name and type
            let nameIdx = i - 1;
            while (
                nameIdx >= 0 &&
                (!lines[nameIdx].trim() ||
                    lines[nameIdx]
                        .trim()
                        .match(
                            /^(Iniciativa|Morto-vivo|Humanoides|Monstro|Construto|Elemental|Animal|Espírito|Criatura)/
                        ))
            ) {
                nameIdx--;
            }

            if (nameIdx < 0) {
                i++;
                continue;
            }

            const creatureName = lines[nameIdx].trim();

            // Find type (next non-empty line after name)
            let typeIdx = nameIdx + 1;
            while (typeIdx < lines.length && !lines[typeIdx].trim()) {
                typeIdx++;
            }

            let creatureType = "";
            let creatureSize = "";

            if (typeIdx < lines.length) {
                const typeStr = lines[typeIdx].trim();
                // Parse "Morto-vivo Médio" or "Humanoides (humano) Médio" etc.
                if (
                    typeStr.match(
                        /Morto-vivo|Humanoides|Monstro|Construto|Elemental|Animal|Espírito/i
                    )
                ) {
                    creatureType = typeStr.split(/\s+/)[0];
                    const sizeMatch = typeStr.match(
                        /(Minúsculo|Pequeno|Médio|Grande|Enorme|Colossal)/i
                    );
                    if (sizeMatch) {
                        creatureSize = sizeMatch[1];
                    }
                }
            }

            const nd = parseInt(ndMatch[1]);
            if (isNaN(nd)) {
                i++;
                continue;
            }

            const creature: Creature = {
                name: creatureName,
                type: creatureType || "Desconhecido",
                size: creatureSize || "Médio",
                nd,
                description: "",
                traits: {},
                attributes: {},
                abilities: [],
                attacks: [],
                source: "T20 - Ameaças de Arton",
            };

            // Extract description (next paragraphs until we hit stats)
            let descIdx = typeIdx + 1;
            while (descIdx < i && descIdx < lines.length) {
                const descLine = lines[descIdx].trim();
                if (
                    descLine &&
                    !descLine.match(
                        /^(Iniciativa|Defesa|Pontos|Deslocamento|For |Des |Con |Int |Sab |Car )/
                    )
                ) {
                    creature.description += descLine + " ";
                }
                descIdx++;
            }
            creature.description = creature.description.trim().substring(0, 500); // Limit description

            // Extract stats
            for (let j = typeIdx; j < Math.min(i + 30, lines.length); j++) {
                const statLine = lines[j].trim();

                if (statLine.match(/Iniciativa/i)) {
                    const init = statLine.match(/Iniciativa\s+([\+\-\d]+)/i);
                    if (init) creature.traits.initiative = init[1];
                }

                if (statLine.match(/Percepção/i)) {
                    const perc = statLine.match(/Percepção\s+([\+\-\d]+)/i);
                    if (perc) creature.traits.perception = perc[1];
                }

                if (statLine.match(/^Defesa\s/i)) {
                    const def = statLine.match(/Defesa\s+(\d+)/i);
                    if (def) creature.traits.defense = def[1];

                    const fort = statLine.match(/Fort\s+([\+\-\d]+)/i);
                    const ref = statLine.match(/Ref\s+([\+\-\d]+)/i);
                    const will = statLine.match(/Von\s+([\+\-\d]+)/i);

                    if (fort || ref || will) {
                        creature.traits.saves = {};
                        if (fort) creature.traits.saves.fort = parseInt(fort[1]);
                        if (ref) creature.traits.saves.ref = parseInt(ref[1]);
                        if (will) creature.traits.saves.will = parseInt(will[1]);
                    }
                }

                if (statLine.match(/Pontos de Vida/i)) {
                    const hp = statLine.match(/Pontos de Vida\s+(\d+)/i);
                    if (hp) creature.traits.hp = parseInt(hp[1]);
                }

                if (statLine.match(/^For\s/i)) {
                    const attrs = statLine;
                    const strength = attrs.match(/For\s+([\d–\-]+|—|–)/);
                    const dex = attrs.match(/Des\s+([\d–\-]+|—|–)/);
                    const con = attrs.match(/Con\s+([\d–\-]+|—|–)/);
                    const intel = attrs.match(/Int\s+([\d–\-]+|—|–)/);
                    const wis = attrs.match(/Sab\s+([\d–\-]+|—|–)/);
                    const cha = attrs.match(/Car\s+([\d–\-]+|—|–)/);

                    if (strength) creature.attributes.strength = strength[1];
                    if (dex) creature.attributes.dexterity = dex[1];
                    if (con) creature.attributes.constitution = con[1];
                    if (intel) creature.attributes.intelligence = intel[1];
                    if (wis) creature.attributes.wisdom = wis[1];
                    if (cha) creature.attributes.charisma = cha[1];
                }
            }

            creatures.push(creature);
        }

        i++;
    }

    return creatures;
}

function main() {
    const inputFile = path.join(__dirname, "../data/import/T20 - Ameaças de Arton.txt");
    const outputFile = path.join(__dirname, "../data/compendium/compendium_ameacas.json");

    console.log(`Lendo arquivo: ${inputFile}`);

    if (!fs.existsSync(inputFile)) {
        console.error(`Arquivo não encontrado: ${inputFile}`);
        process.exit(1);
    }

    const creatures = extractCreaturesFromTxt(inputFile);

    console.log(`Extraídas ${creatures.length} criaturas`);

    if (creatures.length > 0) {
        console.log("\nPrimeiras 3 criaturas:");
        creatures.slice(0, 3).forEach((c, i) => {
            console.log(`${i + 1}. ${c.name} (${c.type}, ND ${c.nd})`);
        });
    }

    const envelope = {
        categoria: "ameacas",
        versao: "1.0",
        atualizadoEm: new Date().toISOString(),
        total: creatures.length,
        entradas: creatures,
    };

    fs.writeFileSync(outputFile, JSON.stringify(envelope, null, 2), "utf-8");
    console.log(`\nArquivo salvo: ${outputFile}`);
}

main();
