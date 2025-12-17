import { createResponder, ResponderType } from "#base";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { CharacterRepository } from "../../../database/CharacterRepository.js";

createResponder({
    customId: "ficha_page/:userId/:page",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const [_, userId, pageStr] = interaction.customId.split("/");
        const page = parseInt(pageStr, 10);

        if (interaction.user.id !== userId) {
            await interaction.reply({ content: "❌ Esta paginação não é sua.", ephemeral: true });
            return;
        }

        await interaction.deferUpdate();

        try {
            const minhasPersonagens = await CharacterRepository.findByUser(userId);
            const ITEMS_PER_PAGE = 5;
            const totalPages = Math.ceil(minhasPersonagens.length / ITEMS_PER_PAGE);

            const start = page * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const pageItems = minhasPersonagens.slice(start, end);

            const lista = pageItems
                .map((p: any) => {
                    const classes = Array.isArray(p.classes) ? p.classes : [];
                    const classesText =
                        classes.length > 0
                            ? classes.map((c: any) => `${c.nome} ${c.nivel}`).join(" / ")
                            : p.classe || "Classe desconhecida";
                    const nivelTotal = p.nivelTotal || p.nivel || 1;
                    return `🔮 **${p.nome}** - ${p.raca} ${classesText} (Nv ${nivelTotal})`;
                })
                .join("\n");

            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle("📜 Suas Fichas")
                .setDescription(lista)
                .setFooter({
                    text: `Página ${page + 1}/${totalPages} • Total: ${minhasPersonagens.length} fichas`,
                });

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`ficha_page/${userId}/${page - 1}`)
                    .setLabel("◀ Anterior")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId(`ficha_page/${userId}/${page + 1}`)
                    .setLabel("Próximo ▶")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page >= totalPages - 1)
            );

            await interaction.editReply({ embeds: [embed], components: [row] });
        } catch (err) {
            console.error("Erro paginação ficha:", err);
        }
    },
});
