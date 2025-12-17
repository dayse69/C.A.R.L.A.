import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
import { CampaignRepository } from "../../../database/CampaignRepository.js";
createResponder({
    customId: "editar_campanha_modal/:campaignId",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        const [_, campaignId] = interaction.customId.split("/");
        const descricao = interaction.fields.getTextInputValue("descricao") || "";
        const ambientacao = interaction.fields.getTextInputValue("ambientacao") || "";
        try {
            const campanha = await CampaignRepository.findById(campaignId);
            if (!campanha) {
                await interaction.reply({
                    content: "❌ Campanha não encontrada.",
                    ephemeral: true,
                });
                return;
            }
            await CampaignRepository.update(campaignId, {
                descricao,
                ambientacao: ambientacao || campanha.ambientacao,
            });
            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle("✏️ Campanha Atualizada")
                .setDescription(`**${campanha.nome}** foi atualizado com sucesso.`)
                .addFields({
                name: "Descrição",
                value: descricao.substring(0, 100) + "...",
                inline: false,
            })
                .setFooter({ text: "C.A.R.L.A // Atualização de campanha" });
            await interaction.reply({ embeds: [embed], ephemeral: false });
        }
        catch (err) {
            console.error("Erro editar campanha:", err);
            await interaction.reply({ content: "❌ Erro ao atualizar campanha.", ephemeral: true });
        }
    },
});
