/**
 * Comando /rolar
 * Sistema de rolagens de dados para Tormenta 20
 */
import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";
import { rolarAtaque, rolarD20, rolarMultiplosDados, rolarPericia, } from "../../../../services/rollService.js";
import { COLORS, EMOJIS } from "../../../../utils/constants.js";
const command = createCommand({
    name: "rolar",
    description: "Rolar dados para testes",
    type: ApplicationCommandType.ChatInput,
});
command.subcommand({
    name: "d20",
    description: "Rolar um d20 (teste básico)",
    options: [
        {
            name: "descricao",
            description: "O que você está tentando fazer",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        await interaction.deferReply();
        const descricao = interaction.options.getString("descricao") ?? "Teste";
        const resultado = rolarD20();
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle(`${EMOJIS.DICE} ${descricao}`)
            .setDescription(`\`\`\`\nD20: ${resultado}\n\`\`\``)
            .addFields({
            name: resultado === 20 ? "✨ CRÍTICO!" : resultado === 1 ? "💀 FALHA!" : "Resultado",
            value: resultado.toString(),
        })
            .setFooter({ text: interaction.user.username })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
});
command.subcommand({
    name: "multiplo",
    description: "Rolar múltiplos dados (ex: 3d6)",
    options: [
        {
            name: "quantidade",
            description: "Quantidade de dados",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: 1,
            maxValue: 20,
        },
        {
            name: "tipo",
            description: "Tipo de dado",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "d4", value: "d4" },
                { name: "d6", value: "d6" },
                { name: "d8", value: "d8" },
                { name: "d10", value: "d10" },
                { name: "d12", value: "d12" },
                { name: "d20", value: "d20" },
                { name: "d100", value: "d100" },
            ],
        },
        {
            name: "descricao",
            description: "O que você está rolando",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        await interaction.deferReply();
        const quantidade = interaction.options.getInteger("quantidade") ?? 1;
        const tipo = interaction.options.getString("tipo") ?? "d6";
        const descricao = interaction.options.getString("descricao") ?? "Rolagem";
        const resultado = rolarMultiplosDados(quantidade, tipo);
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle(`${EMOJIS.DICE} ${descricao}`)
            .addFields({
            name: "Rolagem",
            value: `${quantidade}${tipo}: [${resultado.rolls.join(", ")}]`,
            inline: false,
        }, {
            name: "Total",
            value: `\`${resultado.total}\``,
            inline: true,
        })
            .setFooter({ text: interaction.user.username })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
});
command.subcommand({
    name: "pericia",
    description: "Rolar teste de perícia",
    options: [
        {
            name: "modificador",
            description: "Modificador da perícia",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: -10,
            maxValue: 20,
        },
        {
            name: "descricao",
            description: "Nome da perícia ou teste",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        await interaction.deferReply();
        const modificador = interaction.options.getInteger("modificador") ?? 0;
        const descricao = interaction.options.getString("descricao") ?? "Teste de Perícia";
        const resultado = rolarPericia(modificador, descricao);
        const emoji = resultado.tipo === "critico"
            ? "✨"
            : resultado.tipo === "falha_critica"
                ? "💀"
                : EMOJIS.DICE;
        const embed = new EmbedBuilder()
            .setColor((resultado.tipo === "critico"
            ? COLORS.SUCCESS
            : resultado.tipo === "falha_critica"
                ? COLORS.ACCENT
                : COLORS.PRIMARY))
            .setTitle(`${emoji} ${descricao}`)
            .setDescription(`\`\`\`\n${resultado.detalhes}\n\`\`\``)
            .setFooter({ text: interaction.user.username })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
});
command.subcommand({
    name: "ataque",
    description: "Rolar um ataque",
    options: [
        {
            name: "bônus_ataque",
            description: "Bônus de ataque",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: -10,
            maxValue: 20,
        },
        {
            name: "bônus_dano",
            description: "Bônus de dano",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: "dado_dano",
            description: "Tipo de dado de dano",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "d4", value: "d4" },
                { name: "d6", value: "d6" },
                { name: "d8", value: "d8" },
                { name: "d10", value: "d10" },
                { name: "d12", value: "d12" },
            ],
        },
    ],
    async run(interaction) {
        await interaction.deferReply();
        const bônus_ataque = interaction.options.getInteger("bônus_ataque") ?? 0;
        const bônus_dano = interaction.options.getInteger("bônus_dano") ?? 0;
        const dado_dano = interaction.options.getString("dado_dano") ?? "d6";
        const resultado = rolarAtaque(bônus_ataque, bônus_dano, dado_dano);
        const emoji = resultado.tipo === "critico"
            ? "✨"
            : resultado.tipo === "falha_critica"
                ? "💀"
                : EMOJIS.SWORD;
        const embed = new EmbedBuilder()
            .setColor((resultado.tipo === "critico"
            ? COLORS.SUCCESS
            : resultado.tipo === "falha_critica"
                ? COLORS.ACCENT
                : COLORS.PRIMARY))
            .setTitle(`${emoji} Ataque`)
            .setDescription(`\`\`\`\n${resultado.detalhes}\n\`\`\``)
            .setFooter({ text: interaction.user.username })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
});
export default command;
