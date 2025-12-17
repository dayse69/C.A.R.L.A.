import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
    name: "t20-roll",
    description: "Faz um teste de d20 para Tormenta 20",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "quantidade",
            description: "Quantidade de dados d20 para rolar (padrão: 1)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 1,
            maxValue: 5,
        },
        {
            name: "descricao",
            description: "Descrição do teste (ex: Ataque, Percepção)",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        const quantidade = interaction.options.getInteger("quantidade") ?? 1;
        const descricao = interaction.options.getString("descricao") ?? "Teste genérico";

        // Rolar dados
        const rolls = Array(quantidade)
            .fill(0)
            .map(() => Math.floor(Math.random() * 20) + 1);
        const total = rolls.reduce((a, b) => a + b, 0);
        const media = Math.round(total / quantidade);

        // Criar embed
        const embed = new EmbedBuilder()
            .setColor("#4A90E2")
            .setTitle(`🎲 Teste de Tormenta 20`)
            .setDescription(`**${descricao}**`)
            .addFields(
                {
                    name: "Dados",
                    value: rolls.map((r, i) => `d${i + 1}: **${r}**`).join("\n"),
                    inline: false,
                },
                {
                    name: "Total",
                    value: `**${total}**`,
                    inline: true,
                },
                {
                    name: "Média",
                    value: `**${media}**`,
                    inline: true,
                }
            )
            .setFooter({ text: interaction.user.username })
            .setTimestamp();

        // Adicionar feedback visual
        if (rolls.length === 1) {
            if (rolls[0] === 20) {
                embed.setColor("#00FF00");
                embed.setDescription(`**${descricao}** ✨ SUCESSO CRÍTICO!`);
            } else if (rolls[0] === 1) {
                embed.setColor("#FF0000");
                embed.setDescription(`**${descricao}** 💀 FRACASSO CRÍTICO!`);
            }
        }

        await interaction.reply({
            embeds: [embed],
        });
    },
});
