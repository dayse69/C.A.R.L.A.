import { EmbedBuilder } from "discord.js";
/**
 * Formata características de uma entrada em embeds, adaptadas por categoria
 */
function buildEntryCharacteristicsEmbeds(categoria, entry) {
    const embeds = [];
    const name = entry.name || entry.nome || "Desconhecido";
    // Mapa de cores por categoria
    const colorMap = {
        racas: "#9C27B0",
        classes: "#D946EF",
        origens: "#FF6F00",
        poderes: "#00BCD4",
        deuses_maiores: "#FFD700",
        deuses_menores: "#C0C0C0",
        distinoes: "#FF1493",
        bases: "#8B4513",
        dominios: "#9370DB",
    };
    const emojiMap = {
        racas: "🧬",
        classes: "⚔️",
        origens: "📜",
        poderes: "✨",
        deuses_maiores: "👑",
        deuses_menores: "🕯️",
        distinoes: "🎖️",
        bases: "🏛️",
        dominios: "🌟",
    };
    const color = colorMap[categoria] || "#D946EF";
    const emoji = emojiMap[categoria] || "📖";
    // Embed 1: Descrição principal
    const description = entry.description ||
        entry.descricao ||
        entry.conteudo ||
        entry.content ||
        "Sem descrição disponível";
    const mainEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${emoji} ${name}`)
        .setDescription(description.slice(0, 4096))
        .setFooter({ text: `C.A.R.L.A • ${categoria.toUpperCase()}` })
        .setTimestamp();
    embeds.push(mainEmbed);
    // Embed 2+: Campos adicionais
    const excludedFields = [
        "id",
        "name",
        "nome",
        "description",
        "descricao",
        "conteudo",
        "content",
        "tags",
        "categoria",
        "versao",
        "importadoEm",
        "total",
        "entradas",
    ];
    const additionalFields = Object.entries(entry)
        .filter(([key]) => !excludedFields.includes(key))
        .slice(0, 25);
    if (additionalFields.length > 0) {
        let currentEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${emoji} ${name} • Detalhes`);
        let fieldCount = 0;
        for (const [key, value] of additionalFields) {
            if (!value || (typeof value === "string" && value.trim() === ""))
                continue;
            const fieldName = key
                .replace(/_/g, " ")
                .replace(/([A-Z])/g, " $1")
                .trim()
                .toUpperCase()
                .slice(0, 256);
            const fieldValue = (Array.isArray(value) ? value.join(", ") : String(value)).slice(0, 1024);
            currentEmbed.addFields({ name: fieldName, value: fieldValue, inline: false });
            fieldCount++;
            // Discord limita a 25 fields por embed; cria novo se necessário
            if (fieldCount >= 25) {
                currentEmbed.setFooter({ text: `Página ${embeds.length}` });
                embeds.push(currentEmbed);
                currentEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(`${emoji} ${name} • Detalhes (cont.)`);
                fieldCount = 0;
            }
        }
        if (fieldCount > 0) {
            currentEmbed.setFooter({ text: `Página ${embeds.length}` });
            embeds.push(currentEmbed);
        }
    }
    return embeds;
}
/**
 * Publica uma entrada em um thread/tópico com suas características
 */
export async function publishEntryToThread(channel, categoria, entry, delayMs = 300) {
    const name = entry.name || entry.nome || "Desconhecido";
    try {
        console.log(`[ThreadPublisher] Publicando ${categoria}: ${name}`);
        // Cria thread/tópico
        const threadName = `📖 ${name}`.slice(0, 100);
        const thread = await channel.threads.create({
            name: threadName,
            autoArchiveDuration: 10080, // 7 dias
        });
        if (delayMs > 0)
            await new Promise((r) => setTimeout(r, delayMs));
        // Gera embeds com características
        const embeds = buildEntryCharacteristicsEmbeds(categoria, entry);
        // Envia cada embed em uma mensagem
        for (const embed of embeds) {
            await thread.send({ embeds: [embed] });
            if (delayMs > 0)
                await new Promise((r) => setTimeout(r, delayMs));
        }
        console.log(`  ✅ Tópico criado para ${name}`);
    }
    catch (err) {
        logger.error(`[ThreadPublisher] Erro ao publicar ${name}:`, err);
        throw err;
    }
}
/**
 * Publica múltiplas entradas em threads dentro de um canal
 */
export async function publishAllEntriesToThreads(channel, categoria, entries, delayMs = 500) {
    console.log(`[ThreadPublisher] Iniciando publicação de ${entries.length} entradas (${categoria}) em threads...`);
    let published = 0;
    for (const entry of entries) {
        try {
            await publishEntryToThread(channel, categoria, entry, delayMs);
            published++;
        }
        catch (err) {
            const name = entry.name || entry.nome || "Desconhecido";
            console.warn(`[ThreadPublisher] Falha ao publicar ${name}, continuando...`);
        }
    }
    console.log(`[ThreadPublisher] ✅ Publicação concluída: ${published}/${entries.length} entradas`);
    return published;
}
