import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
function limparFormatacao(texto) {
    return texto
        .replace(/\t+/g, " ")
        .replace(/\x00/g, "")
        .split("\n")
        .map((line) => line.replace(/\s+$/g, "").trim())
        .filter((line) => line.length > 0)
        .join("\n");
}
function normalizarCase(texto) {
    return texto
        .replace(/CApíTulO/gi, "Capítulo")
        .replace(/DEUs/gi, "Deus")
        .replace(/DIVindAdE/gi, "Divindade");
}
function extrairSecoes(texto) {
    const secoes = [];
    const linhas = texto.split("\n");
    let tipoAtual = "";
    let secaoAtual = "";
    let conteudoAtual = "";
    let emBlocoDeuses = false;
    // Lista de deuses maiores conhecidos
    const deusesNomes = [
        "Aharadak",
        "Allihanna",
        "Arsenal",
        "Azgher",
        "Hyninn",
        "Khalmyr",
        "Lena",
        "Marah",
        "Megalokk",
        "Nimb",
        "Oceano",
        "Sszzaas",
        "Tanna-Toh",
        "Tenebra",
        "Thwor",
        "Thyatis",
        "Valkaria",
        "Wynna",
        "Ragnar",
        "Keenn",
    ];
    // Deuses menores conhecidos
    const deusesMenores = [
        "Shiradi",
        "Probo",
        "Parcus",
        "Muhir",
        "Orel",
        "Yazzu",
        "Jairuan",
        "Gizzehi",
        "Allaraz",
        "Kemooz",
        "Dabbus",
        "Galokk",
        "Aucharai",
        "Carvarel",
        "Jhumariel",
        "Margharon",
        "Rhayrivel",
        "Abahddon",
        "Kazidhaan",
        "Lamashtu",
    ];
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        // Detecta início da seção de deuses
        if (/^(Deuses|Panteão|Classes Divinas)/i.test(linha)) {
            if (conteudoAtual.trim() && tipoAtual) {
                secoes.push({ tipo: tipoAtual, nome: secaoAtual, conteudo: conteudoAtual });
            }
            if (/^(Deuses|Panteão)/i.test(linha)) {
                tipoAtual = "deus";
                emBlocoDeuses = true;
            }
            conteudoAtual = "";
            secaoAtual = "";
            continue;
        }
        // Detecta nome de deus (maiúscula, comprimento razoável)
        if (emBlocoDeuses &&
            /^[A-ZÀ-Ú][a-záàâãéêíóôõúçñ\-]+(\s+[a-z]+)?$/.test(linha) &&
            linha.length < 60 &&
            !linha.includes("Capítulo") &&
            !linha.includes("CAPÍTULO")) {
            // Verifica se é nome de deus conhecido ou padrão
            const éDeusConhecido = deusesNomes.some((d) => linha.includes(d));
            const éDeusMenor = deusesMenores.some((d) => linha.includes(d));
            const éAvatar = /avatar/i.test(linha);
            const éAspecto = /aspecto/i.test(linha);
            if ((éDeusConhecido ||
                éDeusMenor ||
                éAvatar ||
                éAspecto ||
                /^[A-ZÀ-Ú][a-záàâãéêíóôõúçñ]+$/.test(linha)) &&
                tipoAtual) {
                if (secaoAtual && conteudoAtual.trim()) {
                    let subtipo;
                    if (deusesNomes.some((d) => secaoAtual.includes(d))) {
                        subtipo = "maior";
                    }
                    else if (deusesMenores.some((d) => secaoAtual.includes(d))) {
                        subtipo = "menor";
                    }
                    else if (/avatar/i.test(secaoAtual)) {
                        subtipo = "avatar";
                    }
                    else if (/aspecto/i.test(secaoAtual)) {
                        subtipo = "aspecto";
                    }
                    secoes.push({
                        tipo: tipoAtual,
                        nome: secaoAtual,
                        subtipo: subtipo,
                        conteudo: conteudoAtual,
                    });
                }
                secaoAtual = linha;
                conteudoAtual = "";
                continue;
            }
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
function nomeParaId(nome) {
    return nome
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w_áàâãéêíóôõúçñ]/g, "")
        .slice(0, 50);
}
function criarHeader(tipo, nome, subtipo) {
    let header = `TIPO: ${tipo}
NOME: ${nome}`;
    if (subtipo) {
        header += `\nSUBTIPO: ${subtipo}`;
    }
    header += `\n---\n`;
    return header;
}
export function splitDeusesArton() {
    const inputPath = join(process.cwd(), "data", "import", "T20 - Deuses de Arton.txt");
    const outputBase = join(process.cwd(), "data", "import", "deuses-arton");
    if (!existsSync(inputPath)) {
        console.error(`❌ Arquivo não encontrado: ${inputPath}`);
        return;
    }
    console.log("📖 Lendo Deuses de Arton...");
    let conteudo = readFileSync(inputPath, "utf-8");
    console.log("🧹 Limpando formatação...");
    conteudo = limparFormatacao(conteudo);
    conteudo = normalizarCase(conteudo);
    console.log("✂️  Extraindo seções...");
    const secoes = extrairSecoes(conteudo);
    const tiposMap = new Map();
    for (const secao of secoes) {
        if (!tiposMap.has(secao.tipo)) {
            tiposMap.set(secao.tipo, []);
        }
        tiposMap.get(secao.tipo).push(secao);
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
            const conteudoArquivo = criarHeader(tipo, secao.nome, secao.subtipo) + secao.conteudo;
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
if (process.argv[1]?.includes("splitDeusesArton")) {
    splitDeusesArton();
}
