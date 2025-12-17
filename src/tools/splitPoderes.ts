import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Detecta o subtipo de poder baseado em seu nome e conteúdo
 */
function detectarSubtipo(nome: string, conteudo: string): string {
    const nomeUpper = nome.toUpperCase();
    const conteudoUpper = conteudo.toUpperCase();

    // Poderes raciais
    const podoresRaciais = [
        "antenas",
        "membros extras",
        "asas",
        "visão",
        "sentidos",
        "regeneração",
        "respiração",
        "resistência",
        "imunidade",
        "língua da natureza",
        "essência",
        "sangue",
        "raça",
    ];
    if (podoresRaciais.some((p) => nomeUpper.includes(p.toUpperCase()))) {
        return "racial";
    }

    // Poderes de combate
    const podoresCombate = [
        "ataque",
        "esquiva",
        "defesa",
        "luta",
        "arma",
        "combate",
        "golpe",
        "ferimento",
        "crítico",
        "iniciativa",
        "ginete",
        "piqueiro",
        "trespassar",
        "vitalidade",
    ];
    if (podoresCombate.some((p) => nomeUpper.includes(p.toUpperCase()))) {
        return "combate";
    }

    // Poderes de Destino
    const podoresDestino = [
        "sorte",
        "destino",
        "fado",
        "presságio",
        "profecia",
        "visão",
        "intuição",
        "premonição",
    ];
    if (podoresDestino.some((p) => nomeUpper.includes(p.toUpperCase()))) {
        return "destino";
    }

    // Poderes de Magia
    const podoresMagia = [
        "magia",
        "feitiço",
        "encanto",
        "invisibilidade",
        "metamorfose",
        "transmutação",
        "evocação",
        "abjuração",
        "adivinhação",
        "conjuração",
        "arcanista",
        "escola",
        "círculo",
        "canalizar",
    ];
    if (podoresMagia.some((p) => nomeUpper.includes(p.toUpperCase()))) {
        return "magia";
    }

    // Poderes da Tormenta
    const podoresTormenta = [
        "tormenta",
        "aberração",
        "corrução",
        "lefeu",
        "distorção",
        "caos",
        "anomalia",
    ];
    if (podoresTormenta.some((p) => nomeUpper.includes(p.toUpperCase()))) {
        return "tormenta";
    }

    // Poderes Concedidos (divinos)
    const podoresConcedidos = [
        "deus",
        "divino",
        "sagrado",
        "profano",
        "bênção",
        "maldição",
        "clérigo",
        "paladino",
        "druida",
        "canalizar",
        "milagre",
        "fé",
    ];
    if (podoresConcedidos.some((p) => conteudoUpper.includes(p.toUpperCase()))) {
        return "concedido";
    }

    // Padrão: se menciona magia no conteúdo, é magia
    if (conteudoUpper.includes("MAGIA") || conteudoUpper.includes("PM")) {
        return "magia";
    }

    // Padrão: se menciona ataque/combate, é combate
    if (conteudoUpper.includes("ATAQUE") || conteudoUpper.includes("TESTE")) {
        return "combate";
    }

    // Default: destino (categoria genérica)
    return "destino";
}

export function splitPoderes(): void {
    const inputDir = join(process.cwd(), "data", "import", "livro-basico", "poder");

    if (!existsSync(inputDir)) {
        logger.error(`❌ Diretório não encontrado: ${inputDir}`);
        return;
    }

    console.log("📖 Lendo poderes...");
    const files = readdirSync(inputDir).filter((f) => f.endsWith(".txt"));

    let totalProcessados = 0;
    const resumoSubtipos: Record<string, number> = {
        racial: 0,
        combate: 0,
        destino: 0,
        magia: 0,
        tormenta: 0,
        concedido: 0,
    };

    console.log("⚙️  Processando e categorizando...\n");

    for (const file of files) {
        const caminhoArquivo = join(inputDir, file);
        let conteudo = readFileSync(caminhoArquivo, "utf-8");

        // Extrai NOME do header
        const matchNome = conteudo.match(/^NOME:\s*(.+?)$/m);
        const nome = matchNome ? matchNome[1].trim() : file.replace(".txt", "");

        // Detecta subtipo
        const subtipo = detectarSubtipo(nome, conteudo);

        // Adiciona SUBTIPO ao header se não existir
        if (!conteudo.includes("SUBTIPO:")) {
            const novasLinhas = conteudo.split("\n");
            const indexNome = novasLinhas.findIndex((l) => l.startsWith("NOME:"));

            if (indexNome !== -1) {
                novasLinhas.splice(indexNome + 1, 0, `SUBTIPO: ${subtipo}`);
                conteudo = novasLinhas.join("\n");
                writeFileSync(caminhoArquivo, conteudo, "utf-8");
            }
        }

        resumoSubtipos[subtipo as keyof typeof resumoSubtipos]++;
        console.log(`✅ ${nome.substring(0, 40).padEnd(40)} → ${subtipo}`);
        totalProcessados++;
    }

    console.log(`\n✨ Categorização concluída!`);
    console.log(`📊 Total de poderes: ${totalProcessados}`);
    console.log(`\n📝 Resumo por subtipo:`);

    for (const [subtipo, count] of Object.entries(resumoSubtipos)) {
        if (count > 0) {
            console.log(`   - ${subtipo}: ${count} poder(es)`);
        }
    }

    console.log(`\n🚀 Próximo passo: npm run import:txt`);
}

if (process.argv[1]?.includes("splitPoderes")) {
    splitPoderes();
}
