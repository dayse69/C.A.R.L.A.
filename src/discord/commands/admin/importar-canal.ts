import { createCommand } from "#base";
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";
import {
    importChannelMessages,
    saveImportedData,
} from "../../../services/channelImporterService.js";

createCommand({
    name: "importar_canal",
    description: "Importa mensagens de um canal e adiciona ao Acervo",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "canal",
            description: "Canal de origem das mensagens",
            type: 7, // CHANNEL
            required: true,
        },
        {
            name: "categoria",
            description: "Nome da categoria no Acervo (ex: biblioteca_esquecimento)",
            type: 3, // STRING
            required: true,
        },
    ],
    async run(interaction) {
        const targetChannel = interaction.options.getChannel("canal", true);
        const categoryName = interaction.options.getString("categoria", true);
        if (!hasPermission(interaction.member, PermissionFlagsBits.Administrator)) {
            await interaction.reply({
                content: "❌ Permissão necessária: Administrator",
                ephemeral: true,
            });
            return;
        }

        if (!targetChannel.isTextBased()) {
            await interaction.reply({
                content: "❌ Selecione um canal de texto válido.",
                ephemeral: true,
            });
            return;
        }

        await interaction.reply({
            content: `🔄 Importando mensagens de ${targetChannel}...\nIsso pode levar alguns momentos.`,
            ephemeral: true,
        });

        try {
            const entries = await importChannelMessages(targetChannel as any);

            if (entries.length === 0) {
                await interaction.followUp({
                    content: "❌ Nenhuma mensagem válida encontrada no canal.",
                    ephemeral: true,
                });
                return;
            }

            saveImportedData(categoryName, entries);

            await interaction.followUp({
                content: `✅ Importação concluída!\n• Categoria: \`${categoryName}\`\n• Entradas: ${entries.length}\n• Arquivo: \`compendium_${categoryName.toLowerCase().replace(/\\s+/g, "_")}.json\``,
                ephemeral: true,
            });
        } catch (err) {
            console.error("[ImportarCanal] erro:", err);
            await interaction.followUp({
                content: "❌ Erro ao importar canal. Verifique os logs.",
                ephemeral: true,
            });
        }
    },
});
