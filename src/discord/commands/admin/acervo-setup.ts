import { createCommand } from "#base";
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";
import { ensureChannels, syncAcervo } from "../../../services/acervoPublisherService.js";
import { hasPermission } from "../../../utils/permissions.js";

createCommand({
    name: "acervo_setup",
    description: "Cria/atualiza canais e sincroniza o Acervo automaticamente",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "prefixo",
            description: "Prefixo dos canais (padrão: acervo)",
            type: 3,
            required: false,
        },
        {
            name: "modo",
            description: "Modo de sincronização (completo ou incremental)",
            type: 3,
            required: false,
            choices: [
                { name: "completo", value: "completo" },
                { name: "incremental", value: "incremental" },
                { name: "canais", value: "canais" },
            ],
        },
    ],
    async run(interaction) {
        const guild = interaction.guild!;
        const prefixo = interaction.options.getString("prefixo") || "acervo";
        const modo = interaction.options.getString("modo") || "completo";
        if (!hasPermission(interaction.member, PermissionFlagsBits.Administrator)) {
            await interaction.reply({
                content: "❌ Permissão necessária: Administrator",
                ephemeral: true,
            });
            return;
        }

        await interaction.reply({ content: "🛠️ Iniciando setup do Acervo...", ephemeral: true });
        try {
            const { createdChannels, updatedChannels, deletedChannels } = await ensureChannels(
                guild,
                prefixo
            );

            if (modo === "canais") {
                // Apenas gestão de canais
            } else if (modo === "incremental") {
                await syncAcervo(guild, { mode: "incremental", delayMs: 150 });
            } else {
                await syncAcervo(guild, { mode: "full", delayMs: 300 });
            }

            let summary = `✅ Setup concluído!\n\n**Categoria:** 📚 acervo\n`;
            summary += `\n🔧 **Modo:** ${modo}`;

            if (createdChannels.length > 0) {
                summary += `\n✨ **Novos Canais:**\n${createdChannels
                    .map((c) => `  • #${c}`)
                    .join("\n")}`;
            }

            if (updatedChannels.length > 0) {
                summary += `\n🔄 **Canais Atualizados:**\n${updatedChannels
                    .map((c) => `  • #${c}`)
                    .join("\n")}`;
            }

            if (deletedChannels.length > 0) {
                summary += `\n🗑️ **Canais Removidos:**\n${deletedChannels
                    .map((c) => `  • #${c}`)
                    .join("\n")}`;
            }

            if (
                createdChannels.length === 0 &&
                updatedChannels.length === 0 &&
                deletedChannels.length === 0
            ) {
                summary += `\n✓ Tudo já estava atualizado!`;
            }

            await interaction.followUp({
                content: summary,
                ephemeral: true,
            });
        } catch (err) {
            console.error("[AcervoSetup] erro:", err);
            await interaction.followUp({
                content: "❌ Erro ao configurar o Acervo.",
                ephemeral: true,
            });
        }
    },
});
