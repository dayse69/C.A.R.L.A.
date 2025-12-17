import { createCommand } from "#base";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { CampaignRepository } from "../../../database/CampaignRepository.js";

createCommand({
    name: "campanha",
    description: "Gerenciar campanhas",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    async run(interaction) {
        const sub = interaction.options.getSubcommand();
        if (sub === "listar") {
            await interaction.deferReply({ ephemeral: true });
            try {
                const campanhas = await CampaignRepository.findByMaster(interaction.user.id);
                if (campanhas.length === 0) {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("#8B00FF")
                                .setTitle("Campanhas")
                                .setDescription(
                                    "Você não tem campanhas. Use `/criar` para criar uma!"
                                ),
                        ],
                    });
                    return;
                }

                const ITEMS_PER_PAGE = 5;
                const totalPages = Math.ceil(campanhas.length / ITEMS_PER_PAGE);
                const page = 0;
                const start = page * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;
                const pageItems = campanhas.slice(start, end);

                const lista = pageItems
                    .map((c: any) => `🗺️ **${c.nome}** - ${c.membros?.length || 1} membro(s)`)
                    .join("\n");
                const embed = new EmbedBuilder()
                    .setColor("#8B00FF")
                    .setTitle("🗺️ Suas Campanhas")
                    .setDescription(lista)
                    .setFooter({
                        text: `Página ${page + 1}/${totalPages} • Total: ${campanhas.length}`,
                    });

                const components = [];
                if (totalPages > 1) {
                    const { ButtonBuilder, ButtonStyle } = await import("discord.js");
                    const row = new ActionRowBuilder<any>().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`campanha_page/${interaction.user.id}/${page - 1}`)
                            .setLabel("◀ Anterior")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId(`campanha_page/${interaction.user.id}/${page + 1}`)
                            .setLabel("Próximo ▶")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page >= totalPages - 1)
                    );
                    components.push(row);
                }

                await interaction.editReply({ embeds: [embed], components });
            } catch (err) {
                await interaction.editReply({ content: "❌ Erro ao listar campanhas." });
            }
        } else if (sub === "ver") {
            const nome = interaction.options.getString("nome", true);
            const campanha = await CampaignRepository.findByMasterAndName(
                interaction.user.id,
                nome
            );
            if (!campanha) {
                await interaction.reply({
                    content: `❌ Campanha **${nome}** não encontrada.`,
                    ephemeral: true,
                });
                return;
            }
            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle(`🗺️ ${campanha.nome}`)
                .setDescription(campanha.descricao || "")
                .addFields(
                    { name: "Mestre", value: `<@${campanha.mestre}>`, inline: true },
                    { name: "Membros", value: String(campanha.membros?.length || 1), inline: true }
                )
                .setFooter({ text: `C.A.R.L.A // Campanha ${(campanha as any)._id}` });
            await interaction.reply({ embeds: [embed], ephemeral: false });
        } else if (sub === "editar") {
            const nome = interaction.options.getString("nome", true);
            const campanha = await CampaignRepository.findByMasterAndName(
                interaction.user.id,
                nome
            );
            if (!campanha) {
                await interaction.reply({
                    content: `❌ Campanha **${nome}** não encontrada.`,
                    ephemeral: true,
                });
                return;
            }

            const modal = new ModalBuilder()
                .setCustomId(`editar_campanha_modal/${(campanha as any)._id}`)
                .setTitle("✏️ Editar Campanha");

            const descricaoInput = new TextInputBuilder()
                .setCustomId("descricao")
                .setLabel("Descrição")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(1000)
                .setRequired(true)
                .setValue(campanha.descricao || "");

            const ambientacaoInput = new TextInputBuilder()
                .setCustomId("ambientacao")
                .setLabel("Ambientação")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue((campanha as any).ambientacao || "");

            modal.addComponents(
                new ActionRowBuilder<any>().addComponents(descricaoInput),
                new ActionRowBuilder<any>().addComponents(ambientacaoInput)
            );

            await interaction.showModal(modal);
        }
    },
    options: [
        {
            type: 1,
            name: "listar",
            description: "Lista suas campanhas",
        },
        {
            type: 1,
            name: "ver",
            description: "Veja detalhes de uma campanha",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "nome",
                    description: "Nome da campanha",
                    required: true,
                },
            ],
        },
        {
            type: 1,
            name: "editar",
            description: "Editar uma campanha",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "nome",
                    description: "Nome da campanha",
                    required: true,
                },
            ],
        },
    ],
});
