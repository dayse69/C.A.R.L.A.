import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
import { compendiumManager } from "../../../services/compendiumManagerService.js";
createResponder({
    customId: "compendium_add_modal/:categoria/:nome",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        try {
            const [_, categoria, nome] = interaction.customId.split("/");
            const descricao = interaction.fields.getTextInputValue("descricao");
            const detalhesRaw = interaction.fields.getTextInputValue("detalhes");
            // Parseia detalhes adicionais
            const details = { nome, description: descricao };
            if (detalhesRaw) {
                const linhas = detalhesRaw.split("\n");
                for (const linha of linhas) {
                    const [key, ...valueParts] = linha.split(":");
                    if (key && valueParts.length > 0) {
                        const value = valueParts.join(":").trim();
                        details[key.trim()] = isNaN(Number(value)) ? value : Number(value);
                    }
                }
            }
            const entry = compendiumManager.addEntry(categoria, details);
            const embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle(`✅ Entrada Adicionada`)
                .addFields({ name: "Categoria", value: categoria, inline: true }, { name: "Nome", value: entry.nome, inline: true }, {
                name: "Descrição",
                value: descricao.slice(0, 100) + "...",
                inline: false,
            })
                .setFooter({ text: "Compêndio atualizado com sucesso" })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        catch (err) {
            await interaction.reply({
                content: `❌ Erro ao adicionar: ${err.message}`,
                ephemeral: true,
            });
        }
    },
});
