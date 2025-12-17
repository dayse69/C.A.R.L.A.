import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
import { CharacterRepository } from "../../../database/CharacterRepository.js";
createResponder({
    customId: "editar_ficha_modal/:characterId",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        const [_, characterId] = interaction.customId.split("/");
        const descricao = interaction.fields.getTextInputValue("descricao") || "";
        const nivelStr = interaction.fields.getTextInputValue("nivel") || "1";
        const nivel = Math.max(1, Math.min(20, parseInt(nivelStr, 10) || 1));
        try {
            const personagem = await CharacterRepository.findById(characterId);
            if (!personagem) {
                await interaction.reply({
                    content: "❌ Personagem não encontrado.",
                    ephemeral: true,
                });
                return;
            }
            const charId = characterId;
            await CharacterRepository.update(charId, {
                historia: {
                    ...personagem.historia,
                    historico: descricao,
                },
                nivelTotal: nivel,
            });
            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle("✏️ Ficha Atualizada")
                .setDescription(`**${personagem.nome}** foi atualizado com sucesso.`)
                .addFields({ name: "Nível", value: String(nivel), inline: true }, { name: "Descrição", value: descricao || "(sem descrição)", inline: false })
                .setFooter({ text: "C.A.R.L.A // Atualização de ficha" });
            await interaction.reply({ embeds: [embed], ephemeral: false });
        }
        catch (err) {
            console.error("Erro editar ficha:", err);
            await interaction.reply({
                content: "❌ Erro ao atualizar ficha.",
                ephemeral: true,
            });
        }
    },
});
