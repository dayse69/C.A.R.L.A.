import { createCommand } from "#base";
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    EmbedBuilder,
    PermissionFlagsBits,
} from "discord.js";
import { compendiumManager } from "../../../services/compendiumManagerService.js";

createCommand({
    name: "compendium_buscar",
    description: "Busca uma entrada no Compêndio",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: [
        {
            name: "categoria",
            description: "Categoria a buscar",
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
            const entry = compendiumManager.findEntry(categoria, nome);

            if (!entry) {
                await interaction.reply({
                    content: `❌ Entrada \`${nome}\` não encontrada em \`${categoria}\`.`,
                    ephemeral: true,
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor("#D946EF")
                .setTitle(`${entry.nome || entry.name}`)
                .setDescription(entry.description || entry.descricao || "Sem descrição")
                .setFooter({ text: `Categoria: ${categoria} • ID: ${entry.id}` })
                .setTimestamp();

            // Adiciona campos adicionais
            const fields = Object.entries(entry)
                .filter(
                    ([key]) =>
                        !["id", "nome", "name", "description", "descricao", "conteudo"].includes(
                            key
                        )
                )
                .slice(0, 10);

            for (const [key, value] of fields) {
                const fieldName = key
                    .replace(/_/g, " ")
                    .replace(/([A-Z])/g, " $1")
                    .trim()
                    .toUpperCase();
                embed.addFields({
                    name: fieldName,
                    value: String(value).slice(0, 256),
                    inline: true,
                });
            }

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
