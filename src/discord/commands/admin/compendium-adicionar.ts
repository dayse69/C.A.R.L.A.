import { createCommand } from "#base";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";

createCommand({
    name: "compendium_adicionar",
    description: "Adiciona uma nova entrada ao Compêndio",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: [
        {
            name: "categoria",
            description: "Categoria da entrada",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: "nome",
            description: "Nome/Título da entrada",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    async autocomplete(interaction) {
        const categorias = [
            "racas",
            "classes",
            "origens",
            "poderes",
            "deuses_maiores",
            "deuses_menores",
            "biblioteca_esquecimento",
        ];
        const focused = interaction.options.getFocused(true);
        const filtered = categorias.filter((c) =>
            c.toLowerCase().includes(focused.value.toLowerCase())
        );
        await interaction.respond(filtered.map((c) => ({ name: c, value: c })));
    },
    async run(interaction) {
        const categoria = interaction.options.getString("categoria", true);
        const nome = interaction.options.getString("nome", true);

        // Cria modal para detalhes
        const modal = new ModalBuilder()
            .setCustomId(`compendium_add_modal/${categoria}/${nome}`)
            .setTitle(`Adicionar: ${nome}`);

        const descField = new TextInputBuilder()
            .setCustomId("descricao")
            .setLabel("Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Digite a descrição detalhada...")
            .setRequired(true)
            .setMaxLength(4000);

        const detalhesField = new TextInputBuilder()
            .setCustomId("detalhes")
            .setLabel("Detalhes Adicionais (opcional)")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Ex: atributo:Força, pv:20, ou qualquer outro campo...")
            .setRequired(false)
            .setMaxLength(2000);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(descField),
            new ActionRowBuilder<TextInputBuilder>().addComponents(detalhesField)
        );

        await interaction.showModal(modal);
    },
});
