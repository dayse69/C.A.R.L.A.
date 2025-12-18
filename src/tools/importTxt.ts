import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { logger } from "../utils/logger.js";
let pdfParse: ((data: Buffer) => Promise<{ text: string }>) | null = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("pdf-parse");
    pdfParse = (mod.default || mod) as (data: Buffer) => Promise<{ text: string }>;
} catch {
    pdfParse = null;
}

// Basic parsers for supported formats
function parseKeyValue(txt: string) {
    const obj: Record<string, string> = {};
    txt.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^\s*([A-Za-z_ÁÀÂÃÉÊÍÓÔÕÚÇÜ]+)\s*:\s*(.+)\s*$/);
        if (m) obj[m[1].toUpperCase()] = m[2];
    });
    return obj;
}

function parseJsonText(txt: string) {
    try {
        return JSON.parse(txt);
    } catch {
        return null;
    }
}

function parseMarkdownLike(txt: string) {
    const obj: Record<string, any> = {};
    const lines = txt.split(/\r?\n/);
    let section = "";
    for (const line of lines) {
        const h = line.match(/^\s*#{1,6}\s*(.+)$/);
        if (h) {
            section = h[1].trim().toUpperCase();
            continue;
        }
        if (!line.trim()) continue;
        obj[section || "DESCRICAO"] =
            (obj[section || "DESCRICAO"] || "") + (obj[section || "DESCRICAO"] ? "\n" : "") + line;
    }
    return obj;
}

function normalizeItem(base: any, nomeFallback: string) {
    const nome = base.NOME || base.nome || nomeFallback;
    const descricao = base.DESCRICAO || base.descricao || base.DESCRIÇÃO || "";
    const tipo = (base.TIPO || base.tipo || "").toString().toLowerCase();
    const subtipo = (base.SUBTIPO || base.subtipo || "").toString().toLowerCase();
    return {
        id: String(nome || nomeFallback)
            .toLowerCase()
            .replace(/\s+/g, "_"),
        nome: nome || nomeFallback,
        descricao,
        tipo,
        subtipo,
        ...base,
    };
}

function loadAcervo() {
    const p = join(process.cwd(), "data", "compendium", "acervo-do-golem.json");
    const json = JSON.parse(readFileSync(p, "utf-8"));
    return { path: p, json };
}

function saveAcervo(path: string, json: any) {
    writeFileSync(path, JSON.stringify(json, null, 2), "utf-8");
}

function collectFiles(dir: string): string[] {
    const entries = readdirSync(dir);
    const files: string[] = [];
    for (const e of entries) {
        const full = join(dir, e);
        const st = statSync(full);
        if (st.isDirectory()) files.push(...collectFiles(full));
        else if (st.isFile() && /\.(txt|pdf)$/i.test(e)) files.push(full);
    }
    return files;
}

function parseTxtFile(path: string) {
    const raw = readFileSync(path, "utf-8");
    // Try JSON
    const asJson = parseJsonText(raw);
    if (asJson) return normalizeItem(asJson, baseName(path));
    // Try key:value
    const kv = parseKeyValue(raw);
    if (Object.keys(kv).length) return normalizeItem(kv, baseName(path));
    // Fallback markdown-like
    const md = parseMarkdownLike(raw);
    return normalizeItem(md, baseName(path));
}

function baseName(p: string) {
    const n = p.split(/\\\//).pop() || p;
    return n.replace(/\.txt$/i, "").replace(/\.pdf$/i, "");
}

function ensureArrays(obj: any) {
    obj.origens ||= [];
    obj.racas ||= [];
    obj.classes ||= [];
    obj.classes_alternativas ||= [];
    obj.poderes_gerais ||= {
        racial: [],
        combate: [],
        destino: [],
        magia: [],
        tormenta: [],
        concedido: [],
    };
    obj.deuses_maiores ||= [];
    obj.deuses_menores ||= [];
    obj.deuses_servidores ||= [];
    obj.distincoes ||= [];
    obj.bases ||= [];
    obj.dominios ||= [];
    obj.itens ||= { mundanos: [], consumiveis: [], magicos: [], aprimorados: [] };
}

function pushUnique(arr: any[], item: any) {
    const exists = arr.some((x) => (x.nome || x.id) === (item.nome || item.id));
    if (!exists) arr.push(item);
}

function mapToCategory(root: string, item: any, acervo: any) {
    const lower = root.toLowerCase();
    const tipo = (item.tipo || "").toLowerCase();
    const subtipo = (item.subtipo || "").toLowerCase();
    applyTemplate(item);

    // Explicit folder routing first
    if (lower.includes("classes")) return pushUnique(acervo.classes, item);
    if (lower.includes("races")) return pushUnique(acervo.racas, item);
    if (lower.includes("spells"))
        return pushUnique(acervo.compendium_spells ?? (acervo.compendium_spells = []), item);

    // Powers mapping by tipo/subtipo
    if (lower.includes("powers") || tipo.includes("poder") || tipo.includes("power")) {
        const map: Record<string, any[]> = {
            racial: acervo.poderes_gerais.racial,
            combate: acervo.poderes_gerais.combate,
            destino: acervo.poderes_gerais.destino,
            magia: acervo.poderes_gerais.magia,
            tormenta: acervo.poderes_gerais.tormenta,
            concedido: acervo.poderes_gerais.concedido,
        };
        const key = (subtipo || tipo || "destino").replace(/[^a-z]/g, "");
        const target = map[key] || acervo.poderes_gerais.destino;
        return pushUnique(target, item);
    }

    // Items mapping by tipo/subtipo
    if (lower.includes("items") || tipo.includes("item")) {
        const map: Record<string, any[]> = {
            mundano: acervo.itens.mundanos,
            consumivel: acervo.itens.consumiveis,
            magico: acervo.itens.magicos,
            aprimorado: acervo.itens.aprimorados,
        };
        const key = (subtipo || tipo || "mundano").replace(/[^a-z]/g, "");
        const target = map[key] || acervo.itens.mundanos;
        return pushUnique(target, item);
    }

    // Deuses mapping
    if (tipo.includes("deus") || lower.includes("deuses")) {
        if (subtipo.includes("maior")) return pushUnique(acervo.deuses_maiores, item);
        if (subtipo.includes("menor")) return pushUnique(acervo.deuses_menores, item);
        return pushUnique(acervo.deuses_servidores, item);
    }

    // Fallback by folder names
    if (lower.includes("herois")) return pushUnique(acervo.distincoes, item);
    if (lower.includes("dominios")) return pushUnique(acervo.dominios, item);
    if (lower.includes("bases")) return pushUnique(acervo.bases, item);

    // Unknown -> distincoes
    return pushUnique(acervo.distincoes, item);
}

function summarize(acervo: any) {
    const sum = {
        racas: (acervo.racas || []).length,
        classes: (acervo.classes || []).length,
        poderes: acervo.poderes_gerais
            ? Object.entries(acervo.poderes_gerais).reduce(
                  (acc: number, [, arr]: any) => acc + ((arr as any[]) || []).length,
                  0
              )
            : 0,
        itens: acervo.itens
            ? (acervo.itens.mundanos || []).length +
              (acervo.itens.consumiveis || []).length +
              (acervo.itens.magicos || []).length +
              (acervo.itens.aprimorados || []).length
            : 0,
        deuses:
            (acervo.deuses_maiores || []).length +
            (acervo.deuses_menores || []).length +
            (acervo.deuses_servidores || []).length,
        dominios: (acervo.dominios || []).length,
        bases: (acervo.bases || []).length,
        distincoes: (acervo.distincoes || []).length,
    };
    return sum;
}

export interface ImportReport {
    filesProcessed: number;
    duplicatesIgnored: string[];
    summary: {
        racas: number;
        classes: number;
        poderes: number;
        itens: number;
        deuses: number;
        dominios: number;
        bases: number;
        distincoes: number;
    };
}

export async function runImport(): Promise<ImportReport> {
    const importDir = join(process.cwd(), "data", "import");
    const { path, json } = loadAcervo();
    ensureArrays(json);

    const files = collectFiles(importDir);
    let count = 0;
    const duplicates: string[] = [];
    for (const f of files) {
        let item: any | null = null;
        if (f.toLowerCase().endsWith(".pdf")) {
            if (pdfParse) {
                const buf = readFileSync(f);
                const res = await (pdfParse as any)(buf);
                const text = (res?.text as string) || "";
                const asJson = parseJsonText(text);
                if (asJson) item = normalizeItem(asJson, baseName(f));
                else {
                    const kv = parseKeyValue(text);
                    if (Object.keys(kv).length) item = normalizeItem(kv, baseName(f));
                    else item = normalizeItem(parseMarkdownLike(text), baseName(f));
                }
            } else {
                console.warn(`PDF não suportado (biblioteca ausente): ${f}`);
                continue;
            }
        } else {
            item = parseTxtFile(f);
        }
        if (!item) continue;
        const before = summarize(json);
        mapToCategory(f, item, json);
        const after = summarize(json);
        if (JSON.stringify(before) === JSON.stringify(after)) {
            duplicates.push(item.nome || item.id || baseName(f));
        }
        count++;
    }
    saveAcervo(path, json);
    const s = summarize(json);
    console.log(
        `✓ Import concluído: ${count} arquivo(s) -> ${path}\n` +
            `Resumo: raças=${s.racas}, classes=${s.classes}, poderes=${s.poderes}, itens=${s.itens}, deuses=${s.deuses}, dominios=${s.dominios}, bases=${s.bases}, distinções=${s.distincoes}`
    );
    if (duplicates.length) {
        console.log(`Itens possivelmente duplicados/ignorados: ${duplicates.length}`);
        console.log(
            duplicates
                .slice(0, 25)
                .map((d) => ` - ${d}`)
                .join("\n")
        );
        if (duplicates.length > 25) console.log(" ... (lista truncada)");
    }
    return {
        filesProcessed: count,
        duplicatesIgnored: duplicates,
        summary: s,
    };
}

if (process.argv[1]?.includes("importTxt")) {
    runImport().catch((e) => logger.error("Erro na importação:", e));
}

// Template de campos por categoria (TIPO) para normalização automática
function applyTemplate(item: any) {
    const t = (item.tipo || "").toLowerCase();
    switch (t) {
        case "poder":
        case "poder_geral": {
            item.subtipo = (item.subtipo || item.CATEGORIA || item.CAT || "destino").toLowerCase();
            item.descricao = item.descricao || item.DESCRICAO || item.EFEITO || item.TEXTO || "";
            item.requisitos = item.requisitos || item.REQUISITOS || item.REQUISITO || "";
            item.atributos = item.atributos || item.CUSTO || item.BONUS || "";
            break;
        }
        case "item": {
            item.subtipo = (
                item.subtipo ||
                item.CATEGORIA ||
                item.TIPO_ITEM ||
                "mundano"
            ).toLowerCase();
            item.descricao = item.descricao || item.DESCRICAO || item.EFEITO || item.TEXTO || "";
            item.preco = item.preco || item.PRECO || item.CUSTO || "";
            item.dano = item.dano || item.DANO || item.BONUS || "";
            break;
        }
        case "deus":
        case "divindade": {
            item.subtipo = (
                item.subtipo ||
                item.CATEGORIA ||
                item.NATUREZA ||
                "servidor"
            ).toLowerCase();
            item.dominios = item.dominios || item.DOMINIOS || item.DOMÍNIOS || "";
            item.descricao = item.descricao || item.DESCRICAO || item.HISTORIA || item.TEXTO || "";
            break;
        }
        case "raca": {
            item.descricao = item.descricao || item.DESCRICAO || item.TRAÇOS || item.TRACOS || "";
            break;
        }
        case "classe":
        case "classe_alternativa": {
            item.descricao =
                item.descricao || item.DESCRICAO || item.HABILIDADES || item.TEXTO || "";
            break;
        }
        case "origem": {
            item.descricao =
                item.descricao || item.DESCRICAO || item.BACKGROUND || item.TEXTO || "";
            break;
        }
        default: {
            break;
        }
    }
}
