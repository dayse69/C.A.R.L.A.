import { createResponder, ResponderType } from "#base";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

createResponder({
    customId: "criar_poder_categoria_select/:nome",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        await interaction.deferUpdate();
        const [_, nome] = interaction.customId.split("/");
        const categoria = interaction.values[0]; // racial|combate|destino|magia|tormenta|concedido

        const modal = new ModalBuilder()
            .setCustomId(`criar_acervo_modal/acervo_poder_${categoria}/${nome}`)
            .setTitle(`✨ Criar Poder (${categoria})`);

        const descricaoInput = new TextInputBuilder()
            .setCustomId("descricao")
            .setLabel("Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(700);

        const requisitosInput = new TextInputBuilder()
            .setCustomId("requisitos")
            .setLabel("Requisitos (opcional)")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const atributosInput = new TextInputBuilder()
            .setCustomId("atributos")
            .setLabel("Efeitos/Bônus (opcional)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(400);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(descricaoInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(requisitosInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(atributosInput)
        );

        await interaction.showModal(modal);
    },
});
