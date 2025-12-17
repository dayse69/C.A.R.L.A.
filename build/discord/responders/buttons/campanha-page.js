import { createResponder, ResponderType } from "#base";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { CampaignRepository } from "../../../database/CampaignRepository.js";
createResponder({
    customId: "campanha_page/:userId/:page",
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
            const campanhas = await CampaignRepository.findByMaster(userId);
            const ITEMS_PER_PAGE = 5;
            const totalPages = Math.ceil(campanhas.length / ITEMS_PER_PAGE);
            const start = page * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const pageItems = campanhas.slice(start, end);
            const lista = pageItems
                .map((c) => `🗺️ **${c.nome}** - ${c.membros?.length || 1} membro(s)`)
                .join("\n");
            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle("🗺️ Suas Campanhas")
                .setDescription(lista)
                .setFooter({
                text: `Página ${page + 1}/${totalPages} • Total: ${campanhas.length}`,
            });
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setCustomId(`campanha_page/${userId}/${page - 1}`)
                .setLabel("◀ Anterior")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0), new ButtonBuilder()
                .setCustomId(`campanha_page/${userId}/${page + 1}`)
                .setLabel("Próximo ▶")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page >= totalPages - 1));
            await interaction.editReply({ embeds: [embed], components: [row] });
        }
        catch (err) {
            console.error("Erro paginação campanha:", err);
        }
    },
});
