import { EmbedBuilder } from "discord.js";
import { logger } from "../utils/logger.js";
/**
 * Formata características de uma classe em embeds detalhadas para thread
 */
function buildClassCharacteristicsEmbeds(classData) {
    const embeds = [];
    // Embed 1: Descrição e Atributos
    const descEmbed = new EmbedBuilder()
        .setColor("#D946EF")
        .setTitle(`${classData.name || classData.nome}`)
        .setDescription(classData.description || classData.descricao || "Sem descrição disponível")
        .addFields({
        name: "🎯 Atributo Primário",
        value: classData.primaryAttribute || classData.atributo_primario || "Não especificado",
        inline: true,
    }, {
        name: "❤️ Pontos de Vida (PV)",
        value: `${classData.pv || classData.vida || 0}`,
        inline: true,
    }, {
        name: "✨ Pontos de Magia (PM)",
        value: `${classData.pm || classData.magia || 0}`,
        inline: true,
    })
        .setFooter({ text: "C.A.R.L.A • Características de Classe" })
        .setTimestamp();
    embeds.push(descEmbed);
    // Embed 2: Habilidades Iniciais
    const skillsText = classData.initialSkills || classData.habilidades_iniciais || "Não especificadas";
    const skillsEmbed = new EmbedBuilder()
        .setColor("#BA68C8")
        .setTitle("📚 Perícias Iniciais")
        .setDescription(skillsText)
        .setFooter({ text: "Comece com essas perícias treinadas" })
        .setTimestamp();
    embeds.push(skillsEmbed);
    // Embed 3: Campos adicionais personalizados (se houver)
    const customFields = Object.entries(classData)
        .filter(([key]) => ![
        "id",
        "name",
        "nome",
        "description",
        "descricao",
        "primaryAttribute",
        "atributo_primario",
        "pv",
        "vida",
        "pm",
        "magia",
        "initialSkills",
        "habilidades_iniciais",
    ].includes(key))
        .slice(0, 5);
    if (customFields.length > 0) {
        const customEmbed = new EmbedBuilder()
            .setColor("#9C27B0")
            .setTitle("⚔️ Características Adicionais");
        for (const [key, value] of customFields) {
            const fieldName = key
                .replace(/_/g, " ")
                .replace(/([A-Z])/g, " $1")
                .trim()
                .toUpperCase();
            const fieldValue = (value || "—").toString().slice(0, 1024);
            customEmbed.addFields({ name: fieldName, value: fieldValue, inline: true });
        }
        customEmbed.setFooter({ text: "Características específicas desta classe" }).setTimestamp();
        embeds.push(customEmbed);
    }
    return embeds;
}
/**
 * Publica uma classe em um thread/tópico com suas características
 */
export async function publishClassToThread(channel, classData, delayMs = 300) {
    const className = classData.name || classData.nome || "Classe Desconhecida";
    try {
        console.log(`[ClassThreadPublisher] Publicando classe: ${className}`);
        // Cria thread/tópico com o nome da classe
        const thread = await channel.threads.create({
            name: `📖 ${className}`.slice(0, 100), // Discord limita a 100 caracteres
            autoArchiveDuration: 10080, // 7 dias
        });
        // Aguarda um pouco antes de enviar
        if (delayMs > 0)
            await new Promise((r) => setTimeout(r, delayMs));
        // Gera embeds com características
        const embeds = buildClassCharacteristicsEmbeds(classData);
        // Envia cada embed em uma mensagem separada
        for (const embed of embeds) {
            await thread.send({ embeds: [embed] });
            if (delayMs > 0)
                await new Promise((r) => setTimeout(r, delayMs));
        }
        console.log(`  ✅ Tópico criado para ${className}`);
    }
    catch (err) {
        logger.error(`[ClassThreadPublisher] Erro ao publicar ${className}:`, err);
        throw err;
    }
}
/**
 * Publica múltiplas classes em threads dentro de um canal
 */
export async function publishAllClassesToThreads(channel, classes, delayMs = 500) {
    console.log(`[ClassThreadPublisher] Iniciando publicação de ${classes.length} classes em threads...`);
    let published = 0;
    for (const classData of classes) {
        try {
            await publishClassToThread(channel, classData, delayMs);
            published++;
        }
        catch (err) {
            const className = classData.name || classData.nome || "Desconhecida";
            console.warn(`[ClassThreadPublisher] Falha ao publicar ${className}, continuando...`);
        }
    }
    console.log(`[ClassThreadPublisher] ✅ Publicação concluída: ${published}/${classes.length} classes`);
    return published;
}
