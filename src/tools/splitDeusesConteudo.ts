import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface ConteudoExtraido {
    poderesConcedidos: Array<{ deus: string; nome: string; conteudo: string }>;
    frade: { nome: string; conteudo: string } | null;
    linhagens: Array<{ nome: string; tipo: string; conteudo: string }>;
    magias: Array<{ nome: string; deus: string; conteudo: string }>;
    itens: Array<{ nome: string; deus: string; tipo: string; conteudo: string }>;
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

function extrairConteudo(texto: string): ConteudoExtraido {
    const resultado: ConteudoExtraido = {
        poderesConcedidos: [],
        frade: null,
        linhagens: [],
        magias: [],
        itens: [],
    };

    const linhas = texto.split("\n");

    // Deuses maiores para associar poderes
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

    let deusAtual = "";
    let emBlocoPoderesConcedidos = false;
    let emBlocoFrade = false;
    let emBlocoLinhagens = false;
    let emBlocoMagias = false;
    let emBlocoItens = false;
    let conteudoAtual = "";

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];

        // Detecta deus atual
        if (deusesNomes.some((d) => linha === d)) {
            deusAtual = linha;
            continue;
        }

        // Detecta seção de Poderes Concedidos
        if (/^Poderes\s+(Concedidos|Específicos)/i.test(linha)) {
            emBlocoPoderesConcedidos = true;
            emBlocoFrade = false;
            emBlocoLinhagens = false;
            emBlocoMagias = false;
            emBlocoItens = false;
            continue;
        }

        // Detecta seção de Classe Frade
        if (/^Frade|^Classe.*Frade/i.test(linha)) {
            emBlocoPoderesConcedidos = false;
            emBlocoFrade = true;
            emBlocoLinhagens = false;
            emBlocoMagias = false;
            emBlocoItens = false;
            conteudoAtual = "";
            continue;
        }

        // Detecta seção de Linhagens
        if (/^Linhagens?|^Abençoada|^Suraggel/i.test(linha)) {
            emBlocoPoderesConcedidos = false;
            emBlocoFrade = false;
            emBlocoLinhagens = true;
            emBlocoMagias = false;
            emBlocoItens = false;
            continue;
        }

        // Detecta seção de Magias
        if (/^Magias?|^Novos? Feitiços?/i.test(linha)) {
            emBlocoPoderesConcedidos = false;
            emBlocoFrade = false;
            emBlocoLinhagens = false;
            emBlocoMagias = true;
            emBlocoItens = false;
            continue;
        }

        // Detecta seção de Itens
        if (/^Itens?|^Artefatos?|^Armas?|^Armaduras?/i.test(linha)) {
            emBlocoPoderesConcedidos = false;
            emBlocoFrade = false;
            emBlocoLinhagens = false;
            emBlocoMagias = false;
            emBlocoItens = true;
            continue;
        }

        // Processa poderes concedidos
        if (
            emBlocoPoderesConcedidos &&
            deusAtual &&
            /^[A-ZÀ-Ú][a-záàâãéêíóôõúçñ\s]+$/.test(linha) &&
            linha.length < 60
        ) {
            resultado.poderesConcedidos.push({
                deus: deusAtual,
                nome: linha,
                conteudo: "", // Será preenchido com próximas linhas
            });
            continue;
        }

        // Processa Frade
        if (emBlocoFrade && linha.length > 0) {
            conteudoAtual += (conteudoAtual ? "\n" : "") + linha;
            if (conteudoAtual.length > 500) {
                resultado.frade = {
                    nome: "Frade",
                    conteudo: conteudoAtual,
                };
            }
            continue;
        }

        // Processa Linhagens
        if (emBlocoLinhagens && /^(Abençoada|Suraggel|de\s+\w+)/i.test(linha)) {
            resultado.linhagens.push({
                nome: linha,
                tipo: /abençoada/i.test(linha) ? "abençoada" : "suraggel",
                conteudo: "",
            });
            continue;
        }

        // Processa Magias
        if (emBlocoMagias && /^[A-ZÀ-Ú][a-záàâãéêíóôõúçñ\s]+$/.test(linha) && linha.length < 60) {
            resultado.magias.push({
                nome: linha,
                deus: deusAtual,
                conteudo: "",
            });
            continue;
        }

        // Processa Itens
        if (emBlocoItens && /^[A-ZÀ-Ú][a-záàâãéêíóôõúçñ\s]+$/.test(linha) && linha.length < 60) {
            resultado.itens.push({
                nome: linha,
                deus: deusAtual,
                tipo: "item",
                conteudo: "",
            });
            continue;
        }
    }

    return resultado;
}

export function splitDeusesConteudo(): void {
    const inputPath = join(process.cwd(), "data", "import", "T20 - Deuses de Arton.txt");
    const outputBase = join(process.cwd(), "data", "import", "deuses-arton-conteudo");

    if (!existsSync(inputPath)) {
        console.error(`❌ Arquivo não encontrado: ${inputPath}`);
        return;
    }

    console.log("📖 Lendo Deuses de Arton (conteúdo específico)...");
    let conteudo = readFileSync(inputPath, "utf-8");

    console.log("🧹 Limpando formatação...");
    conteudo = limparFormatacao(conteudo);

    console.log("✂️  Extraindo conteúdo...");
    const extraido = extrairConteudo(conteudo);

    console.log("\n📂 Salvando arquivos...\n");

    // Salva poderes concedidos
    if (extraido.poderesConcedidos.length > 0) {
        const dirPoderes = join(outputBase, "poderes-concedidos");
        if (!existsSync(dirPoderes)) {
            mkdirSync(dirPoderes, { recursive: true });
        }

        for (const poder of extraido.poderesConcedidos) {
            const nomeArquivo = `${poder.deus.toLowerCase()}-${poder.nome.toLowerCase().replace(/\s+/g, "_")}.txt`;
            const caminhoArquivo = join(dirPoderes, nomeArquivo);
            const conteudoArquivo = `TIPO: poder_concedido\nNOME: ${poder.nome}\nDEUS: ${poder.deus}\nSUBTIPO: concedido\n---\n${poder.conteudo}`;

            writeFileSync(caminhoArquivo, conteudoArquivo, "utf-8");
            console.log(`✅ PODER: ${poder.deus} - ${poder.nome}`);
        }
    }

    // Salva Frade
    if (extraido.frade) {
        const dirClasses = join(outputBase, "classes");
        if (!existsSync(dirClasses)) {
            mkdirSync(dirClasses, { recursive: true });
        }

        const caminhoArquivo = join(dirClasses, "frade.txt");
        const conteudoArquivo = `TIPO: classe\nNOME: Frade\nSUBTIPO: divina\n---\n${extraido.frade.conteudo}`;

        writeFileSync(caminhoArquivo, conteudoArquivo, "utf-8");
        console.log(`✅ CLASSE: Frade`);
    }

    // Salva Linhagens
    if (extraido.linhagens.length > 0) {
        const dirLinhagens = join(outputBase, "linhagens");
        if (!existsSync(dirLinhagens)) {
            mkdirSync(dirLinhagens, { recursive: true });
        }

        for (const linhagem of extraido.linhagens) {
            const nomeArquivo = `${linhagem.nome.toLowerCase().replace(/\s+/g, "_")}.txt`;
            const caminhoArquivo = join(dirLinhagens, nomeArquivo);
            const conteudoArquivo = `TIPO: linhagem\nNOME: ${linhagem.nome}\nSUBTIPO: ${linhagem.tipo}\n---\n${linhagem.conteudo}`;

            writeFileSync(caminhoArquivo, conteudoArquivo, "utf-8");
            console.log(`✅ LINHAGEM: ${linhagem.nome} (${linhagem.tipo})`);
        }
    }

    // Salva Magias
    if (extraido.magias.length > 0) {
        const dirMagias = join(outputBase, "magias");
        if (!existsSync(dirMagias)) {
            mkdirSync(dirMagias, { recursive: true });
        }

        for (const magia of extraido.magias) {
            const nomeArquivo = `${magia.nome.toLowerCase().replace(/\s+/g, "_")}.txt`;
            const caminhoArquivo = join(dirMagias, nomeArquivo);
            const conteudoArquivo = `TIPO: magia\nNOME: ${magia.nome}\nDEUS: ${magia.deus}\n---\n${magia.conteudo}`;

            writeFileSync(caminhoArquivo, conteudoArquivo, "utf-8");
            console.log(`✅ MAGIA: ${magia.deus} - ${magia.nome}`);
        }
    }

    // Salva Itens
    if (extraido.itens.length > 0) {
        const dirItens = join(outputBase, "itens");
        if (!existsSync(dirItens)) {
            mkdirSync(dirItens, { recursive: true });
        }

        for (const item of extraido.itens) {
            const nomeArquivo = `${item.nome.toLowerCase().replace(/\s+/g, "_")}.txt`;
            const caminhoArquivo = join(dirItens, nomeArquivo);
            const conteudoArquivo = `TIPO: item\nNOME: ${item.nome}\nDEUS: ${item.deus}\n---\n${item.conteudo}`;

            writeFileSync(caminhoArquivo, conteudoArquivo, "utf-8");
            console.log(`✅ ITEM: ${item.deus} - ${item.nome}`);
        }
    }

    console.log(`\n✨ Extração concluída!`);
    console.log(`📊 Total extraído:`);
    console.log(`   - Poderes concedidos: ${extraido.poderesConcedidos.length}`);
    console.log(`   - Classes: ${extraido.frade ? 1 : 0}`);
    console.log(`   - Linhagens: ${extraido.linhagens.length}`);
    console.log(`   - Magias: ${extraido.magias.length}`);
    console.log(`   - Itens: ${extraido.itens.length}`);
    console.log(`\n📁 Saídos em: ${outputBase}`);
    console.log(`\n🚀 Próximo passo: npm run import:txt`);
}

if (process.argv[1]?.includes("splitDeusesConteudo")) {
    splitDeusesConteudo();
}
