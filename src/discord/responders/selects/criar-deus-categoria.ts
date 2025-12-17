import { createResponder, ResponderType } from "#base";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

createResponder({
    customId: "criar_deus_categoria_select/:nome",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        await interaction.deferUpdate();
        const [_, nome] = interaction.customId.split("/");
        const categoria = interaction.values[0]; // maiores|menores|servidores

        const modal = new ModalBuilder()
            .setCustomId(`criar_acervo_modal/acervo_deus_${categoria}/${nome}`)
            .setTitle(`🕯️ Criar Divindade (${categoria})`);

        const descricaoInput = new TextInputBuilder()
            .setCustomId("descricao")
            .setLabel("Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(700);

        const atributosInput = new TextInputBuilder()
            .setCustomId("atributos")
            .setLabel("Domínios/Aspectos (opcional)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(400);

        const requisitosInput = new TextInputBuilder()
            .setCustomId("requisitos")
            .setLabel("Culto/Ordem (opcional)")
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
