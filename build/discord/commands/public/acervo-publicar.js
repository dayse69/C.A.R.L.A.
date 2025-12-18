import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, PermissionFlagsBits, } from "discord.js";
import { getAllClassesExtended, getAllRacesExtended, getAvailableCategories, getImportedCategory, } from "../../../services/compendiumService.js";
import { publishAllEntriesToThreads } from "../../../services/genericThreadPublisherService.js";
import { hasPermission } from "../../../utils/permissions.js";
async function publishCategoria(categoria, channel, delayMs) {
    let items = [];
    if (categoria === "racas") {
        items = getAllRacesExtended();
    }
    else if (categoria === "classes") {
        items = getAllClassesExtended();
    }
    else {
        // Carrega categoria importada dinamicamente
        items = getImportedCategory(categoria);
    }
    if (items.length === 0) {
        await channel.send({
            content: `⚠️ Nenhuma entrada encontrada para categoria: \`${categoria}\``,
        });
        return;
    }
    // Todas as categorias usam sistema de threads
    await channel.send({
        content: `━━━━━━━━━━━━━━━━━━━━\n📚 Publicação do Acervo: ${categoria.toUpperCase()}\nTotal: ${items.length} entradas\nModo: Tópicos (Um tópico por entrada)\n━━━━━━━━━━━━━━━━━━━━`,
    });
    await publishAllEntriesToThreads(channel, categoria, items, delayMs);
    // Marca como feito
    await channel.send({
        content: `✅ Publicação de ${categoria} concluída! Confira os tópicos acima.`,
    });
}
createCommand({
    name: "acervo_publicar",
    description: "Publica entradas do Acervo em um canal do servidor",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: [
        {
            name: "canal",
            description: "Canal onde publicar",
            type: ApplicationCommandOptionType.Channel,
            required: true,
            channel_types: [ChannelType.GuildText],
        },
        {
            name: "categoria",
            description: "Categoria do Acervo (digite ou escolha na lista)",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: "modo",
            description: "Formato de publicação",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "Resumo", value: "resumo" },
                { name: "Detalhado", value: "detalhado" },
            ],
        },
        {
            name: "intervalo_ms",
            description: "Intervalo entre mensagens (ms)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
    ],
    async autocomplete(interaction) {
        const categories = getAvailableCategories();
        const focused = interaction.options.getFocused(true);
        const filtered = categories.filter((c) => c.toLowerCase().includes(focused.value.toLowerCase()));
        await interaction.respond(filtered.slice(0, 25).map((c) => ({ name: c, value: c })));
    },
    async run(interaction) {
        const targetChannel = interaction.options.getChannel("canal", true);
        const categoria = interaction.options.getString("categoria", true);
        const intervalo = interaction.options.getInteger("intervalo_ms") ?? 750;
        if (!hasPermission(interaction.member, PermissionFlagsBits.ManageGuild)) {
            await interaction.reply({
                content: "❌ Permissão necessária: ManageGuild",
                ephemeral: true,
            });
            return;
        }
        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
            await interaction.reply({
                content: "❌ Selecione um canal de texto válido do servidor.",
                ephemeral: true,
            });
            return;
        }
        // Permission check: bot must be able to send messages in selected channel
        const me = interaction.guild?.members.me;
        const canSend = targetChannel.permissionsFor(me)?.has(PermissionFlagsBits.SendMessages);
        if (!canSend) {
            await interaction.reply({
                content: "❌ Eu não tenho permissão para enviar mensagens nesse canal.",
                ephemeral: true,
            });
            return;
        }
        await interaction.reply({
            content: `🛠️ Iniciando publicação de \`${categoria}\` em ${targetChannel}...`,
            ephemeral: true,
        });
        try {
            await publishCategoria(categoria, targetChannel, Math.max(0, intervalo));
            await interaction.followUp({
                content: `✅ Publicação concluída: ${categoria.toUpperCase()} em ${targetChannel}.`,
                ephemeral: true,
            });
        }
        catch (err) {
            console.error("[AcervoPublicar] erro:", err);
            await interaction.followUp({
                content: "❌ Ocorreu um erro durante a publicação.",
                ephemeral: true,
            });
        }
    },
});
