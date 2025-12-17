import fs from "fs";
import path from "path";
function slugify(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function readTxtFiles(importDir) {
    const entries = fs.readdirSync(importDir, { withFileTypes: true });
    const files = [];
    for (const e of entries) {
        const p = path.join(importDir, e.name);
        if (e.isFile() && p.toLowerCase().endsWith(".txt")) {
            const content = fs.readFileSync(p, "utf-8");
            files.push({ file: e.name, content });
        }
    }
    return files;
}
function extractSections(content) {
    const lines = content.split(/\r?\n/);
    const sections = [];
    let currentSection = null;
    let buffer = [];
    let bufferLength = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Detectar título: maiúsculas, 3-60 chars, sem números, ou terminado em ":"
        const isAllCapsTitle = /^[A-ZÁÉÍÓÚÂÊÎÔÛÇ\s\-]{3,60}$/.test(line) &&
            line.length > 2 &&
            !line.includes(":") &&
            line.split(" ").length <= 8;
        const isTitleWithColon = /^[A-Za-záéíóúâêîôûç\s\-]{3,60}\s*:\s*$/.test(line);
        if ((isAllCapsTitle || isTitleWithColon) && currentSection && bufferLength < 500) {
            // Salvar seção anterior
            currentSection.description = buffer.join(" ").trim() || undefined;
            sections.push(currentSection);
            buffer = [];
            bufferLength = 0;
            const titleText = line.replace(/:$/, "").trim();
            currentSection = { title: titleText };
        }
        else if ((isAllCapsTitle || isTitleWithColon) && !currentSection) {
            // Começar nova seção
            const titleText = line.replace(/:$/, "").trim();
            currentSection = { title: titleText };
            buffer = [];
            bufferLength = 0;
        }
        else if (currentSection && line && line.length > 0) {
            // Acumular conteúdo (max 300 chars por linha para evitar blocos enormes)
            if (bufferLength < 400) {
                buffer.push(line);
                bufferLength += line.length;
                extractMetadata(line, currentSection);
            }
        }
    }
    // Salvar última seção
    if (currentSection && bufferLength > 10) {
        currentSection.description = buffer.join(" ").trim() || undefined;
        sections.push(currentSection);
    }
    return sections;
}
function extractMetadata(line, section) {
    // Procurar padrões de Atributo Primário
    const attrMatch = line.match(/(?:atributo(?:\s+prim[aá]rio)?|primary\s+attr|atr\.)\s*[:=]?\s*([A-Za-záéíóúâêîôûç\s,ou]+?)(?:\s*$|[.;])/i);
    if (attrMatch)
        section.primaryAttribute = attrMatch[1].trim();
    // Procurar padrões de Pontos de Vida (PV)
    const pvMatch = line.match(/(?:pv|points?\s+of\s+life|vida)\s*[:=]?\s*(\d+)/i);
    if (pvMatch)
        section.pv = parseInt(pvMatch[1], 10);
    // Procurar padrões de Pontos de Mana (PM)
    const pmMatch = line.match(/(?:pm|points?\s+of\s+mana|mana)\s*[:=]?\s*(\d+)/i);
    if (pmMatch)
        section.pm = parseInt(pmMatch[1], 10);
    // Procurar perícias iniciais
    const skillsMatch = line.match(/(?:perícias?|skills?|inicial)\s*[:=]?\s*(.+?)(?:\s*$|[.;])/i);
    if (skillsMatch)
        section.initialSkills = skillsMatch[1].trim();
    // Procurar bônus de atributo (para raças)
    const bonusMatch = line.match(/(?:atributo\s+base|attribute\s+bonus|bônus)\s*[:=]?\s*([+\-]?\s*[A-Za-záéíóúâêîôûç,\s]+)/i);
    if (bonusMatch)
        section.attributeBonus = bonusMatch[1].trim();
    // Procurar habilidades
    const abilitiesMatch = line.match(/(?:habilidades?|abilities?)\s*[:=]?\s*(.+?)(?:\s*$|[.;])/i);
    if (abilitiesMatch)
        section.abilities = abilitiesMatch[1].trim();
    // Procurar categoria
    const categoryMatch = line.match(/(?:categoria|category|tipo)\s*[:=]?\s*(.+?)(?:\s*$|[.;])/i);
    if (categoryMatch)
        section.category = categoryMatch[1].trim();
    // Procurar raridade
    const rarityMatch = line.match(/(?:raridade|rarity)\s*[:=]?\s*(comum|incomum|raro|lendário|mundano|aprimado|mágico)/i);
    if (rarityMatch)
        section.rarity = rarityMatch[1].trim();
    // Procurar custo
    const costMatch = line.match(/(?:custo|cost|preço|price)\s*[:=]?\s*([\d,T$\s]+)/i);
    if (costMatch)
        section.cost = costMatch[1].trim();
}
function buildClassTemplatesFromSections(sections) {
    const templates = [];
    for (const section of sections) {
        const name = section.title.replace(/\s+/g, " ").trim();
        // Filtrar nomes muito curtos ou que parecem ser subtítulos
        if (name.length < 3 || /^(descrição|descriçao|details?|informações)$/i.test(name)) {
            continue;
        }
        const id = slugify(name);
        templates.push({
            id,
            name,
            description: section.description || undefined,
            primaryAttribute: section.primaryAttribute || undefined,
            pv: section.pv || undefined,
            pm: section.pm || undefined,
            initialSkills: section.initialSkills || undefined,
        });
    }
    return templates;
}
function buildRaceTemplatesFromSections(sections) {
    const templates = [];
    for (const section of sections) {
        const name = section.title.replace(/\s+/g, " ").trim();
        if (name.length < 3 || /^(descrição|descriçao|details?|informações)$/i.test(name)) {
            continue;
        }
        const id = slugify(name);
        templates.push({
            id,
            name,
            description: section.description || undefined,
            attributeBonus: section.attributeBonus || undefined,
            abilities: section.abilities || undefined,
        });
    }
    return templates;
}
function buildItemTemplatesFromSections(sections) {
    const templates = [];
    for (const section of sections) {
        const name = section.title.replace(/\s+/g, " ").trim();
        if (name.length < 3 || /^(descrição|descriçao|details?|informações)$/i.test(name)) {
            continue;
        }
        const id = slugify(name);
        templates.push({
            id,
            name,
            description: section.description || undefined,
            category: section.category || undefined,
            rarity: section.rarity || undefined,
            cost: section.cost || undefined,
        });
    }
    return templates;
}
function ensureDir(dir) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}
function main() {
    const root = process.cwd();
    const importDir = path.join(root, "data", "import");
    const outDir = path.join(root, "data", "templates");
    ensureDir(outDir);
    const args = process.argv.slice(2);
    const type = args[0] || "classes";
    const files = readTxtFiles(importDir);
    const allSections = files.flatMap((f) => extractSections(f.content));
    if (type === "classes") {
        const templates = buildClassTemplatesFromSections(allSections);
        const output = {
            generatedAt: new Date().toISOString(),
            sourceFiles: files.map((f) => f.file),
            classes: templates,
        };
        fs.writeFileSync(path.join(outDir, "classes.templates.json"), JSON.stringify(output, null, 2), "utf-8");
        console.log(`✅ Templates de classes gerados: ${path.join("data", "templates", "classes.templates.json")}`);
        console.log(`📊 Total: ${templates.length}`);
    }
    else if (type === "races") {
        const templates = buildRaceTemplatesFromSections(allSections);
        const output = {
            generatedAt: new Date().toISOString(),
            sourceFiles: files.map((f) => f.file),
            races: templates,
        };
        fs.writeFileSync(path.join(outDir, "races.templates.json"), JSON.stringify(output, null, 2), "utf-8");
        console.log(`✅ Templates de raças gerados: ${path.join("data", "templates", "races.templates.json")}`);
        console.log(`📊 Total: ${templates.length}`);
    }
    else if (type === "items") {
        const templates = buildItemTemplatesFromSections(allSections);
        const output = {
            generatedAt: new Date().toISOString(),
            sourceFiles: files.map((f) => f.file),
            items: templates,
        };
        fs.writeFileSync(path.join(outDir, "items.templates.json"), JSON.stringify(output, null, 2), "utf-8");
        console.log(`✅ Templates de itens gerados: ${path.join("data", "templates", "items.templates.json")}`);
        console.log(`📊 Total: ${templates.length}`);
    }
    else {
        logger.error(`❌ Tipo desconhecido: ${type}. Use: classes, races ou items`);
        process.exit(1);
    }
}
// Executa sempre que chamado via tsx/npm script
main();
