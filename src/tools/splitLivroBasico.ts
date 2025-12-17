import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface SplitSection {
    tipo: string;
    nome: string;
    conteudo: string;
}

/**
 * Limpa formatação excessiva do arquivo (tabulações, espaços extras)
 */
function limparFormatacao(texto: string): string {
    return texto
        .replace(/\t+/g, " ")
        .replace(/\x00/g, "")
        .split("\n")
        .map((line) => line.replace(/\s+$/g, "").trim())
        .filter((line) => line.length > 0)
        .join("\n");
}

/**
 * Normaliza case inconsistente do T20
 * "RAçA" -> "Raça", "ClAssE" -> "Classe"
 */
function normalizarCase(texto: string): string {
    return texto
        .replace(/RAçA/gi, "Raça")
        .replace(/ClAssE/gi, "Classe")
        .replace(/CApíTulO/gi, "Capítulo")
        .replace(/hABilidAdEs/gi, "Habilidades")
        .replace(/DEscRiçãO/gi, "Descrição");
}

/**
 * Detecta e extrai seções por tipo
 * Retorna array de {tipo, nome, conteudo}
 */
function extrairSecoes(texto: string): SplitSection[] {
    const secoes: SplitSection[] = [];
    const linhas = texto.split("\n");

    let secaoAtual = "";
    let tipoAtual = "";
    let conteudoAtual = "";
    let emBlocoRaca = false;
    let emBlocoClasse = false;
    let emBlocoPoder = false;
    let emBloqueDeus = false;

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];

        // Detecta seção principal de Raças
        if (/^Raças/.test(linha) && !emBlocoRaca) {
            if (conteudoAtual.trim()) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            tipoAtual = "raca";
            conteudoAtual = "";
            emBlocoRaca = true;
            emBlocoClasse = false;
            emBlocoPoder = false;
            emBloqueDeus = false;
            continue;
        }

        // Detecta seção de Classes
        if (/^Classes/i.test(linha) && !emBlocoClasse && /\s+DEscRiçãO/i.test(linha)) {
            if (conteudoAtual.trim()) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            tipoAtual = "classe";
            conteudoAtual = "";
            emBlocoRaca = false;
            emBlocoClasse = true;
            emBlocoPoder = false;
            emBloqueDeus = false;
            continue;
        }

        // Detecta seção de Poderes
        if (/^Poderes?\s+(gerais|gerais\s+|específicos)?/i.test(linha) && !emBlocoPoder) {
            if (conteudoAtual.trim()) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            tipoAtual = "poder";
            conteudoAtual = "";
            emBlocoRaca = false;
            emBlocoClasse = false;
            emBlocoPoder = true;
            emBloqueDeus = false;
            continue;
        }

        // Detecta seção de Deuses
        if (/^(Deuses|Divindades)/i.test(linha) && !emBloqueDeus) {
            if (conteudoAtual.trim()) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            tipoAtual = "deus";
            conteudoAtual = "";
            emBlocoRaca = false;
            emBlocoClasse = false;
            emBlocoPoder = false;
            emBloqueDeus = true;
            continue;
        }

        // Detecta quebra de item dentro da seção
        // Padrão: linha que começa com maiúscula, sem tabs, comprimento moderado (nome de item)
        if (
            tipoAtual &&
            conteudoAtual.trim() &&
            /^[A-ZÀ-Ú][a-záàâãéêíóôõúçñ\s]+(\/[A-Z][a-záàâãéêíóôõúçñ\s]+)?$/.test(linha) &&
            linha.length < 100 &&
            !linha.includes("Capítulo")
        ) {
            // Salva item anterior se houver conteúdo
            if (secaoAtual && conteudoAtual.trim()) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            secaoAtual = linha;
            conteudoAtual = "";
            continue;
        }

        // Acumula conteúdo
        if (tipoAtual) {
            conteudoAtual += (conteudoAtual ? "\n" : "") + linha;
        }
    }

    // Salva último item
    if (conteudoAtual.trim() && tipoAtual) {
        secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
    }

    return secoes;
}

/**
 * Converte nome para ID seguro (minúsculas, underscores)
 */
function nomeParaId(nome: string): string {
    return nome
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w_áàâãéêíóôõúçñ]/g, "")
        .slice(0, 50);
}

/**
 * Cria header com metadados
 */
function criarHeader(tipo: string, nome: string): string {
    return `TIPO: ${tipo}
NOME: ${nome}
---
`;
}

/**
 * Executa o split do Livro Básico
 */
export function splitLivroBasico(): void {
    const inputPath = join(process.cwd(), "data", "import", "T20 - Livro Básico.txt");
    const outputBase = join(process.cwd(), "data", "import", "livro-basico");

    if (!existsSync(inputPath)) {
        logger.error(`❌ Arquivo não encontrado: ${inputPath}`);
        return;
    }

    console.log("📖 Lendo Livro Básico...");
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

    console.log(`\n🚀 Próximo passo: npm run import`);
}

// Executar se for main
if (process.argv[1]?.includes("splitLivroBasico")) {
    splitLivroBasico();
}
