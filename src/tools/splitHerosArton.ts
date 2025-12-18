import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { logger } from "../utils/logger.js";

interface SplitSection {
    tipo: string;
    nome: string;
    conteudo: string;
}

function limparFormatacao(texto: string): string {
    return texto
        .replace(/\t+/g, " ")
        .replace(/\x00/g, "")
        .split("\n")
        .map((line) => line.replace(/\s+$/g, "").trim())
        .filter((line) => line.length > 0)
        .join("\n");
}

function normalizarCase(texto: string): string {
    return texto
        .replace(/RAçA/gi, "Raça")
        .replace(/ClAssE/gi, "Classe")
        .replace(/CApíTulO/gi, "Capítulo")
        .replace(/DISTiNçãO/gi, "Distinção")
        .replace(/POdeRES/gi, "Poderes");
}

function extrairSecoes(texto: string): SplitSection[] {
    const secoes: SplitSection[] = [];
    const linhas = texto.split("\n");

    let tipoAtual = "";
    let secaoAtual = "";
    let conteudoAtual = "";
    let emBlocoRaca = false;
    let emBlocoDistincao = false;

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];

        // Detecta seção "Novas Raças"
        if (/^(Novas\s+Raças|Duende|Eiradaan|Moreau|Dragonata)/i.test(linha)) {
            if (conteudoAtual.trim() && tipoAtual) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            if (/^(Duende|Eiradaan|Moreau|Dragonata)/i.test(linha)) {
                tipoAtual = "raca";
                secaoAtual = linha;
                conteudoAtual = "";
                emBlocoRaca = true;
            } else {
                tipoAtual = "";
                secaoAtual = "";
                conteudoAtual = "";
            }
            continue;
        }

        // Detecta seção de Distinções
        if (/^(Distinções|Ordem|Cavaleiros?|Caçadores?|Irmandade)/i.test(linha) && emBlocoRaca) {
            if (conteudoAtual.trim() && tipoAtual) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            tipoAtual = "distincao";
            secaoAtual = linha;
            conteudoAtual = "";
            emBlocoRaca = false;
            emBlocoDistincao = true;
            continue;
        }

        // Detecta quebra de item (nova raça/distinção)
        if (
            emBlocoRaca &&
            /^[A-ZÀ-Ú][a-záàâãéêíóôõúçñ\s\-]+$/.test(linha) &&
            linha.length < 80 &&
            !linha.includes("Capítulo") &&
            !linha.includes("CAPÍTULO") &&
            !linha.includes("Tabela") &&
            !linha.includes("Habilidades")
        ) {
            if (secaoAtual && conteudoAtual.trim()) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            secaoAtual = linha;
            conteudoAtual = "";
            tipoAtual = "raca";
            continue;
        }

        // Detecta quebra de distinção
        if (
            emBlocoDistincao &&
            /^[A-ZÀ-Ú][a-záàâãéêíóôõúçñ\s\-]+$/.test(linha) &&
            linha.length < 80 &&
            !linha.includes("Capítulo") &&
            !linha.includes("CAPÍTULO") &&
            !linha.includes("Tabela")
        ) {
            if (secaoAtual && conteudoAtual.trim()) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            secaoAtual = linha;
            conteudoAtual = "";
            tipoAtual = "distincao";
            continue;
        }

        // Acumula conteúdo
        if (tipoAtual) {
            conteudoAtual += (conteudoAtual ? "\n" : "") + linha;
        }
    }

    if (conteudoAtual.trim() && tipoAtual) {
        secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
    }

    return secoes;
}

function nomeParaId(nome: string): string {
    return nome
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w_áàâãéêíóôõúçñ]/g, "")
        .slice(0, 50);
}

function criarHeader(tipo: string, nome: string): string {
    return `TIPO: ${tipo}
NOME: ${nome}
---
`;
}

export function splitHerosArton(): void {
    const inputPath = join(process.cwd(), "data", "import", "T20 - Heróis de Arton.txt");
    const outputBase = join(process.cwd(), "data", "import", "herois-arton");

    if (!existsSync(inputPath)) {
        logger.error(`❌ Arquivo não encontrado: ${inputPath}`);
        return;
    }

    console.log("📖 Lendo Heróis de Arton...");
    let conteudo = readFileSync(inputPath, "utf-8");

    console.log("🧹 Limpando formatação...");
    conteudo = limparFormatacao(conteudo);
    conteudo = normalizarCase(conteudo);

    console.log("✂️  Extraindo seções...");
    const secoes = extrairSecoes(conteudo);

    const tiposMap = new Map<string, SplitSection[]>();
    for (const secao of secoes) {
        if (!tiposMap.has(secao.tipo)) {
            tiposMap.set(secao.tipo, []);
        }
        tiposMap.get(secao.tipo)!.push(secao);
    }

    console.log("\n📂 Salvando arquivos organizados...\n");

    let totalArquivos = 0;
    for (const [tipo, itens] of tiposMap) {
        const dirTipo = join(outputBase, tipo);
        if (!existsSync(dirTipo)) {
            mkdirSync(dirTipo, { recursive: true });
        }

        for (const secao of itens) {
            const id = nomeParaId(secao.nome);
            const nomeArquivo = `${id}.txt`;
            const caminhoArquivo = join(dirTipo, nomeArquivo);

            const conteudoArquivo = criarHeader(tipo, secao.nome) + secao.conteudo;

            writeFileSync(caminhoArquivo, conteudoArquivo, "utf-8");
            console.log(`✅ ${tipo.toUpperCase()}: ${secao.nome} → ${nomeArquivo}`);
            totalArquivos++;
        }
    }

    console.log(`\n✨ Split concluído!`);
    console.log(`📊 Total de arquivos: ${totalArquivos}`);
    console.log(`📁 Saídos em: ${outputBase}`);
    console.log(`\n📝 Resumo por tipo:`);

    for (const [tipo, itens] of tiposMap) {
        console.log(`   - ${tipo}: ${itens.length} item(ns)`);
    }

    console.log(`\n🚀 Próximo passo: npm run import:txt`);
}

if (process.argv[1]?.includes("splitHerosArton")) {
    splitHerosArton();
}
