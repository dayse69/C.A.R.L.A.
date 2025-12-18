import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * Importa mensagens de um canal Discord e as estrutura em JSON
 * Parseia mensagens procurando por padrões simples:
 * - Linhas iniciadas com ** são consideradas títulos (nomes)
 * - Resto do conteúdo é descrição
 */
export async function importChannelMessages(channel) {
    const entries = [];
    try {
        console.log(`[ChannelImporter] Iniciando importação do canal ${channel.id}...`);
        // Busca todas as mensagens do canal (máximo 100 por requisição)
        let lastId;
        let totalFetched = 0;
        const maxMessages = 200; // Limite de segurança
        while (totalFetched < maxMessages) {
            const options = { limit: 100 };
            if (lastId)
                options.before = lastId;
            const msgCollection = await channel.messages.fetch(options);
            if (msgCollection.size === 0)
                break;
            msgCollection.forEach((msg) => {
                const entry = parseMessage(msg.content, msg.author.username);
                if (entry && entry.nome) {
                    entries.push(entry);
                    console.log(`  ✓ Importado: ${entry.nome}`);
                }
            });
            totalFetched += msgCollection.size;
            const lastMsg = msgCollection.last();
            if (lastMsg)
                lastId = lastMsg.id;
        }
        console.log(`[ChannelImporter] Total importado: ${entries.length} entradas`);
        return entries;
    }
    catch (err) {
        logger.error(`[ChannelImporter] Erro ao importar canal:`, err);
        return [];
    }
}
function parseMessage(content, authorName) {
    if (!content || content.length < 5)
        return null;
    const lines = content.split("\n").filter((l) => l.trim());
    if (lines.length === 0)
        return null;
    // Procura primeira linha em negrito como título
    let nome = "";
    let description = "";
    let startIdx = 0;
    const firstLine = lines[0];
    if (firstLine.includes("**")) {
        // Extrai conteúdo entre **
        const match = firstLine.match(/\*\*([^*]+)\*\*/);
        if (match) {
            nome = match[1].trim();
            startIdx = 1;
        }
    }
    // Se não achou em negrito, use primeira linha como nome
    if (!nome && lines.length > 0) {
        nome = lines[0].replace(/\*\*/g, "").trim();
        startIdx = 1;
    }
    // Resto é descrição
    if (startIdx < lines.length) {
        description = lines.slice(startIdx).join("\n").trim();
    }
    if (!nome)
        return null;
    return {
        id: nome.toLowerCase().replace(/\s+/g, "_"),
        nome,
        description: description || "Sem descrição disponível",
        tags: ["importado", authorName.toLowerCase()],
    };
}
/**
 * Salva as entradas importadas em um JSON dedicado
 */
export function saveImportedData(categoryName, entries) {
    const projectRoot = path.resolve(__dirname, "../..");
    const acervoDir = path.join(projectRoot, "data/compendium");
    // Cria diretório se não existir
    if (!fs.existsSync(acervoDir)) {
        fs.mkdirSync(acervoDir, { recursive: true });
    }
    const fileName = `compendium_${categoryName.toLowerCase().replace(/\s+/g, "_")}.json`;
    const filePath = path.join(acervoDir, fileName);
    const data = {
        categoria: categoryName,
        versao: "1.0",
        importadoEm: new Date().toISOString(),
        total: entries.length,
        entradas: entries,
    };
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        console.log(`[ChannelImporter] ✅ Arquivo salvo: ${fileName}`);
        return filePath;
    }
    catch (err) {
        logger.error(`[ChannelImporter] ❌ Erro ao salvar arquivo:`, err);
        throw err;
    }
}
/**
 * Carrega dados importados de um arquivo de categoria
 */
export function loadImportedCategory(categoryName) {
    const projectRoot = path.resolve(__dirname, "../..");
    const fileName = `compendium_${categoryName.toLowerCase().replace(/\s+/g, "_")}.json`;
    const filePath = path.join(projectRoot, "data/compendium", fileName);
    try {
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            return data.entradas || [];
        }
    }
    catch (err) {
        console.warn(`[ChannelImporter] Aviso ao carregar ${fileName}:`, err);
    }
    return [];
}
