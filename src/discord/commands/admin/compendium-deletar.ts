import { createCommand } from "#base";
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    EmbedBuilder,
    PermissionFlagsBits,
} from "discord.js";
import { compendiumManager } from "../../../services/compendiumManagerService.js";

createCommand({
    name: "compendium_deletar",
    description: "Deleta uma entrada do Compêndio",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "categoria",
            description: "Categoria",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: "nome",
            description: "Nome ou ID da entrada",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    async autocomplete(interaction) {
        const categorias = [
            "racas",
            "classes",
            "origens",
            "poderes",
            "deuses_maiores",
            "deuses_menores",
            "biblioteca_esquecimento",
        ];
        const focused = interaction.options.getFocused(true);
        const filtered = categorias.filter((c) =>
            c.toLowerCase().includes(focused.value.toLowerCase())
        );
        await interaction.respond(filtered.map((c) => ({ name: c, value: c })));
    },
    async run(interaction) {
        const categoria = interaction.options.getString("categoria", true);
        const nome = interaction.options.getString("nome", true);

        try {
            const deleted = compendiumManager.deleteEntry(categoria, nome);

            if (!deleted) {
                await interaction.reply({
                    content: `❌ Entrada \`${nome}\` não encontrada em \`${categoria}\`.`,
                    ephemeral: true,
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`✅ Entrada Deletada`)
                .addFields(
                    { name: "Categoria", value: categoria, inline: true },
                    { name: "Nome", value: nome, inline: true }
                )
                .setFooter({ text: "Entrada removida do Compêndio" })
                .setTimestamp();

            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        } catch (err: any) {
            await interaction.reply({
                content: `❌ Erro: ${err.message}`,
                ephemeral: true,
            });
        }
    },
});
