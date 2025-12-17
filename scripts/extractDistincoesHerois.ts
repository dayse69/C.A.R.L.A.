import fs from "fs";
import path from "path";
// Importa diretamente a lib para evitar bloco de debug do index (pdf-parse tenta ler arquivo de teste se module.parent não existe)
import pdf from "pdf-parse/lib/pdf-parse.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    const pdfPath = path.join(__dirname, "../data/import/T20 - Heróis de Arton.pdf");
    if (!fs.existsSync(pdfPath)) {
        console.error("PDF não encontrado:", pdfPath);
        process.exit(1);
    }

    const buffer = fs.readFileSync(pdfPath);
    console.log("[distincoes] lido PDF", pdfPath, "bytes:", buffer.length);
    const parsed = await pdf(buffer);
    const text = parsed.text;

    const startMarker = "Capítulo 2: Distinções";
    const endMarker = "Capítulo 3"; // fim do capítulo

    const startIdx = text.indexOf(startMarker);
    if (startIdx < 0) {
        console.error("Marcador de início não encontrado (Distinções 107)");
        process.exit(1);
    }

    const endIdx = text.lastIndexOf(endMarker);
    const slice = text.substring(startIdx, endIdx > startIdx ? endIdx : text.length);

    const outRaw = path.join(__dirname, "../data/import/distincoes_herois_raw.txt");
    fs.writeFileSync(outRaw, slice, "utf-8");
    console.log("Distinções extraídas (bruto):", outRaw, "chars:", slice.length);

    // Heurística simples de cabeçalhos: linha com nome e em seguida a palavra Distinções + número de página (quando presente no TOC)
    const entries: { titulo: string; pageHint?: string; bloco: string }[] = [];
    const lines = slice.split(/\n+/);
    let current: { titulo: string; pageHint?: string; bloco: string } | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // detecta cabeçalho tipo "Aeronauta Goblin Distinções 107"
        const m = line.match(/^(.+?)\s+Distinções\s+(\d+)/);
        if (m) {
            if (current) entries.push(current);
            current = { titulo: m[1].trim(), pageHint: m[2], bloco: "" };
            continue;
        }
        if (current) {
            current.bloco += line + "\n";
        }
    }
    if (current) entries.push(current);

    const outJson = path.join(__dirname, "../data/compendium/compendium_distincoes_raw.json");
    fs.writeFileSync(
        outJson,
        JSON.stringify(
            {
                categoria: "distincoes_raw",
                versao: "1.0",
                atualizadoEm: new Date().toISOString(),
                total: entries.length,
                entradas: entries,
            },
            null,
            2
        ),
        "utf-8"
    );
    console.log("Heurística gerou entradas:", entries.length, "=>", outJson);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
