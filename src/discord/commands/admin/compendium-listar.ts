import { createCommand } from "#base";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits,
} from "discord.js";
import { compendiumManager } from "../../../services/compendiumManagerService.js";

createCommand({
    name: "compendium_listar",
    description: "Lista entradas do Compêndio com paginação",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: [
        {
            name: "categoria",
            description: "Categoria a listar",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: "pagina",
            description: "Número da página",
            type: ApplicationCommandOptionType.Integer,
            required: false,
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
        const page = interaction.options.getInteger("pagina") || 1;

        try {
            const result = compendiumManager.listEntries(categoria, page, 5);

            if (result.entries.length === 0) {
                await interaction.reply({
                    content: `📭 Nenhuma entrada na categoria \`${categoria}\` página ${page}.`,
                    ephemeral: true,
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor("#9C27B0")
                .setTitle(`📚 Compêndio: ${categoria.toUpperCase()}`)
                .setDescription(
                    result.entries.map((e, i) => `${i + 1}. **${e.nome || e.name}**`).join("\n")
                )
                .setFooter({
                    text: `Página ${result.page}/${result.totalPages} • Total: ${result.total} entradas`,
                })
                .setTimestamp();

            const buttons = new ActionRowBuilder<ButtonBuilder>();

            if (result.page > 1) {
                buttons.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`compendium_list/${categoria}/1`)
                        .setLabel("⏮ Primeira")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`compendium_list/${categoria}/${result.page - 1}`)
                        .setLabel("⬅ Anterior")
                        .setStyle(ButtonStyle.Primary)
                );
            }

            if (result.page < result.totalPages) {
                buttons.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`compendium_list/${categoria}/${result.page + 1}`)
                        .setLabel("Próxima ➡")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`compendium_list/${categoria}/${result.totalPages}`)
                        .setLabel("Última ⏭")
                        .setStyle(ButtonStyle.Secondary)
                );
            }

            const components = buttons.components.length > 0 ? [buttons] : [];

            await interaction.reply({
                embeds: [embed],
                components,
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
