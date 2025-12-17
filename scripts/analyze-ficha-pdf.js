/**
 * Analisa os PDFs de fichas T20 para extrair a estrutura completa
 */

const fs = require("fs");
const path = require("path");
const PDFParser = require("pdf2json");

const FICHAS_DIR = path.join(__dirname, "..", "data", "import", "Fichas");

// Lista de PDFs para analisar
const pdfFiles = [
    "T20 - Ficha Editável.pdf",
    "Ficha T20 EDITÁVEL v1.5.b (PC e Celular).pdf",
    "Ficha T20 v.2.0.pdf",
];

async function analyzePDF(filename) {
    return new Promise((resolve, reject) => {
        const pdfPath = path.join(FICHAS_DIR, filename);

        if (!fs.existsSync(pdfPath)) {
            console.log(`⚠️  PDF não encontrado: ${filename}`);
            resolve(null);
            return;
        }

        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", (errData) => {
            console.error(`❌ Erro ao analisar ${filename}:`, errData.parserError);
            reject(errData.parserError);
        });

        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            console.log(`\n${"=".repeat(70)}`);
            console.log(`📄 Análise de: ${filename}`);
            console.log(`${"=".repeat(70)}\n`);

            // Extrair campos do formulário PDF
            const fields = [];

            if (pdfData.Pages) {
                pdfData.Pages.forEach((page, pageIndex) => {
                    console.log(`\n📃 Página ${pageIndex + 1}:`);

                    if (page.Texts) {
                        const texts = page.Texts.map((t) => decodeURIComponent(t.R[0].T)).filter(
                            (t) => t.trim()
                        );

                        console.log(`Textos encontrados: ${texts.length}`);

                        // Agrupar textos similares que indicam seções
                        const sections = {
                            informacoes: [],
                            atributos: [],
                            pericias: [],
                            combate: [],
                            equipamento: [],
                            talentos: [],
                            habilidades: [],
                            magias: [],
                            inventario: [],
                        };

                        texts.forEach((text) => {
                            const lower = text.toLowerCase();

                            // Informações básicas
                            if (
                                lower.match(
                                    /(nome|raça|classe|origem|divindade|deslocamento|idade|altura|peso)/i
                                )
                            ) {
                                sections.informacoes.push(text);
                            }

                            // Atributos
                            if (
                                lower.match(
                                    /(força|destreza|constituição|inteligência|sabedoria|carisma|for|des|con|int|sab|car|modificador)/i
                                )
                            ) {
                                sections.atributos.push(text);
                            }

                            // Perícias
                            if (
                                lower.match(
                                    /(perícia|acrobacia|atletismo|cavalgar|conhecimento|cura|diplomacia|enganação|furtividade|iniciativa|intimidação|intuição|investigação|jogatina|lidar com animais|luta|ofício|percepção|pilotagem|pontaria|reflexos|religião|sobrevivência|vontade)/i
                                )
                            ) {
                                sections.pericias.push(text);
                            }

                            // Combate
                            if (
                                lower.match(
                                    /(pv|pm|defesa|resistência|fortitude|ataque|dano|crítico|alcance|ca|iniciativa)/i
                                )
                            ) {
                                sections.combate.push(text);
                            }

                            // Equipamento
                            if (
                                lower.match(
                                    /(arma|armadura|escudo|acessório|equipamento|mochila|bolsa|munição|categoria)/i
                                )
                            ) {
                                sections.equipamento.push(text);
                            }

                            // Talentos
                            if (lower.match(/(talento|característica|poder)/i)) {
                                sections.talentos.push(text);
                            }

                            // Habilidades
                            if (
                                lower.match(
                                    /(habilidade|capacidade especial|traço|característica de raça|característica de classe)/i
                                )
                            ) {
                                sections.habilidades.push(text);
                            }

                            // Magias
                            if (lower.match(/(magia|feitiço|círculo|mana|conjuração|escola)/i)) {
                                sections.magias.push(text);
                            }

                            // Inventário
                            if (
                                lower.match(
                                    /(item|tesouro|dinheiro|to|tp|tc|ouro|prata|cobre|qtd|quantidade|peso total)/i
                                )
                            ) {
                                sections.inventario.push(text);
                            }
                        });

                        // Mostrar seções encontradas
                        Object.entries(sections).forEach(([section, items]) => {
                            if (items.length > 0) {
                                console.log(`\n  ${section.toUpperCase()}: ${items.length} campos`);
                                items.slice(0, 5).forEach((item) => {
                                    console.log(`    - ${item}`);
                                });
                                if (items.length > 5) {
                                    console.log(`    ... e mais ${items.length - 5} campos`);
                                }
                            }
                        });
                    }
                });
            }

            // Campos de formulário (se existirem)
            if (pdfData.formImage && pdfData.formImage.Pages) {
                pdfData.formImage.Pages.forEach((page, pageIndex) => {
                    if (page.Fields) {
                        console.log(`\n📝 Campos de formulário na página ${pageIndex + 1}:`);
                        page.Fields.forEach((field) => {
                            if (field.T && field.T.Name) {
                                console.log(`  - ${field.T.Name}`);
                                fields.push(field.T.Name);
                            }
                        });
                    }
                });
            }

            resolve({ filename, fields });
        });

        pdfParser.loadPDF(pdfPath);
    });
}

async function main() {
    console.log("\n🔍 Analisando PDFs de fichas T20...\n");

    for (const filename of pdfFiles) {
        try {
            await analyzePDF(filename);
        } catch (error) {
            console.error(`Erro ao processar ${filename}:`, error);
        }
    }

    console.log("\n\n📋 CAMPOS COMUNS EM FICHAS T20:");
    console.log("=".repeat(70));

    const templateStructure = {
        "INFORMAÇÕES BÁSICAS": [
            "nome",
            "jogador",
            "raça",
            "classe",
            "nível",
            "origem",
            "divindade",
            "idade",
            "altura",
            "peso",
            "deslocamento",
            "tamanho",
            "idiomas",
        ],
        ATRIBUTOS: [
            "FOR (Força)",
            "DES (Destreza)",
            "CON (Constituição)",
            "INT (Inteligência)",
            "SAB (Sabedoria)",
            "CAR (Carisma)",
            "Modificadores de atributo",
        ],
        COMBATE: [
            "PV (Pontos de Vida)",
            "PV Atuais",
            "PV Temporários",
            "PM (Pontos de Mana)",
            "PM Atuais",
            "Defesa",
            "Modificadores de defesa",
            "Resistências (Fortitude, Reflexos, Vontade)",
            "Iniciativa",
        ],
        PERÍCIAS: [
            "Acrobacia (DES)",
            "Adestramento (CAR)",
            "Atletismo (FOR)",
            "Atuação (CAR)",
            "Cavalgar (DES)",
            "Conhecimento (INT)",
            "Cura (SAB)",
            "Diplomacia (CAR)",
            "Enganação (CAR)",
            "Furtividade (DES)",
            "Guerra (INT)",
            "Iniciativa (DES)",
            "Intimidação (CAR)",
            "Intuição (SAB)",
            "Investigação (INT)",
            "Jogatina (CAR)",
            "Ladinagem (DES)",
            "Luta (FOR)",
            "Misticismo (INT)",
            "Nobreza (INT)",
            "Ofício (INT)",
            "Percepção (SAB)",
            "Pilotagem (DES)",
            "Pontaria (DES)",
            "Reflexos (DES)",
            "Religião (SAB)",
            "Sobrevivência (SAB)",
            "Vontade (SAB)",
        ],
        TALENTOS: ["Nome do talento", "Descrição", "Pré-requisitos"],
        HABILIDADES: [
            "Habilidades de classe",
            "Habilidades de raça",
            "Habilidades especiais",
            "Poderes concedidos",
        ],
        "EQUIPAMENTO - ARMAS": [
            "Nome da arma",
            "Tipo",
            "Ataque",
            "Dano",
            "Crítico",
            "Alcance",
            "Tipo de dano",
            "Especial",
        ],
        "EQUIPAMENTO - ARMADURA": [
            "Nome da armadura",
            "Tipo",
            "Defesa",
            "Penalidade",
            "Deslocamento reduzido",
        ],
        "EQUIPAMENTO - ITENS": ["Nome do item", "Quantidade", "Peso", "Descrição"],
        MAGIAS: [
            "Nome da magia",
            "Círculo",
            "Escola",
            "Execução",
            "Alcance",
            "Alvo",
            "Duração",
            "Resistência",
            "Descrição",
        ],
        INVENTÁRIO: ["Dinheiro (TO, TP, TC)", "Carga leve/média/pesada", "Peso total transportado"],
        HISTÓRIA: [
            "Aparência",
            "Personalidade",
            "História/Background",
            "Objetivos",
            "Medos",
            "Ideais",
            "Defeitos",
            "Anotações",
        ],
    };

    Object.entries(templateStructure).forEach(([section, fields]) => {
        console.log(`\n${section}:`);
        fields.forEach((field) => {
            console.log(`  ✓ ${field}`);
        });
    });

    console.log("\n" + "=".repeat(70));
    console.log("\n✅ Análise concluída!\n");
}

main().catch(console.error);
