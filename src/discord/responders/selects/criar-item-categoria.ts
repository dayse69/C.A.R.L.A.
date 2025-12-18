import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { createResponder, ResponderType } from "../../base/index.js";

createResponder({
    customId: "criar_item_categoria_select/:nome",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        await interaction.deferUpdate();
        const [_, nome] = interaction.customId.split("/");
        const categoria = interaction.values[0]; // mundanos | consumiveis | magicos | aprimorados

        const modal = new ModalBuilder()
            .setCustomId(`criar_acervo_modal/acervo_item_${categoria}/${nome}`)
            .setTitle(`📦 Criar Item (${categoria})`);

        const descricaoInput = new TextInputBuilder()
            .setCustomId("descricao")
            .setLabel("Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500);

        const atributosInput = new TextInputBuilder()
            .setCustomId("atributos")
            .setLabel("Atributos/Bônus (opcional)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(300);

        const requisitosInput = new TextInputBuilder()
            .setCustomId("requisitos")
            .setLabel("Requisitos (opcional)")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(descricaoInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(atributosInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(requisitosInput)
        );

        await interaction.showModal(modal);
    },
});
