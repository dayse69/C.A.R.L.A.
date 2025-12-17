/**
 * Comando /ficha
 * Gerenciamento completo de fichas de personagens
 * Subcomandos: criar, ver, editar, listar
 */

import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { CharacterRepository } from "../../../../database/CharacterRepository.js";
import { criarMenuAbas } from "../../../../discord/responders/selects/ficha-menu.js";
import { criarEmbedConfirmacao, criarEmbedErro } from "../../../../ui/embeds/fichaEmbeds.js";

const command = createCommand({
    name: "ficha",
    description: "Gerenciar suas fichas de personagens",
    type: ApplicationCommandType.ChatInput,
});

command.subcommand({
    name: "ver",
    description: "Ver sua ficha de personagem",
    options: [
        {
            name: "personagem",
            description: "Nome do personagem (deixe em branco para o último usado)",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        // Responder imediatamente para evitar timeout
        await interaction.deferReply({ ephemeral: false });

        try {
            const nomePersonagem = interaction.options.getString("personagem");

            let personagem;

            if (nomePersonagem) {
                // Buscar por nome específico
                personagem = await CharacterRepository.findByUserAndName(
                    interaction.user.id,
                    nomePersonagem
                );

                if (!personagem) {
                    const embedErro = criarEmbedErro(
                        "Personagem não encontrado",
                        `Você não possui um personagem chamado **${nomePersonagem}**.`
                    );
                    await interaction.editReply({
                        embeds: [embedErro],
                    });
                    return;
                }
            } else {
                // Buscar o mais recente
                const personagens = await CharacterRepository.findByUser(interaction.user.id);

                if (personagens.length === 0) {
                    const embedErro = criarEmbedErro(
                        "Nenhuma ficha encontrada",
                        "Você não possui nenhuma ficha. Use `/ficha criar` para criar uma!"
                    );
                    await interaction.editReply({
                        embeds: [embedErro],
                    });
                    return;
                }

                personagem = personagens[0];
            }

            // Criar menu de seleção
            const personagemId = (personagem as any)._id?.toString() || (personagem as any).id;
            const menu = criarMenuAbas(personagemId, "profile");

            // Usar profile card por padrão (mais bonito)
            const { criarProfileCard } = await import("../../../../ui/cards/profileCard.js");
            const embed = criarProfileCard(personagem as any);
            await interaction.editReply({
                embeds: [embed],
                components: [menu],
            });
        } catch (erro) {
            console.error(erro);
            const embedErro = criarEmbedErro(
                "Erro ao carregar ficha",
                "Não foi possível carregar sua ficha."
            );
            await interaction.editReply({
                embeds: [embedErro],
            });
        }
    },
});

command.subcommand({
    name: "editar",
    description: "Editar sua ficha de personagem",
    options: [
        {
            name: "personagem",
            description: "Nome do personagem",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    async run(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const nome = interaction.options.getString("personagem", true);
            const personagem = await CharacterRepository.findByUserAndName(
                interaction.user.id,
                nome
            );
            if (!personagem) {
                const embedErro = criarEmbedErro(
                    "Personagem não encontrado",
                    `Você não possui um personagem chamado **${nome}**.`
                );
                await interaction.editReply({ embeds: [embedErro] });
                return;
            }

            const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } =
                await import("discord.js");
            const charId = (personagem as any)._id || (personagem as any).id;
            const modal = new ModalBuilder()
                .setCustomId(`editar_ficha_modal/${charId}`)
                .setTitle("✏️ Editar Ficha");

            const historico = personagem.historia?.historico || "";
            const descricaoInput = new TextInputBuilder()
                .setCustomId("descricao")
                .setLabel("Histórico")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(500)
                .setRequired(false)
                .setValue(historico);

            const nivelInput = new TextInputBuilder()
                .setCustomId("nivel")
                .setLabel("Nível")
                .setStyle(TextInputStyle.Short)
                .setMaxLength(2)
                .setRequired(false)
                .setValue(String(personagem.nivelTotal || 1));

            modal.addComponents(
                new ActionRowBuilder<any>().addComponents(descricaoInput as any),
                new ActionRowBuilder<any>().addComponents(nivelInput as any)
            );

            await interaction.showModal(modal);
        } catch (erro) {
            console.error(erro);
            const embedErro = criarEmbedErro(
                "Erro ao abrir editor",
                "Não foi possível abrir o editor de ficha."
            );
            await interaction.editReply({ embeds: [embedErro] });
        }
    },
});

command.subcommand({
    name: "listar",
    description: "Listar todas as suas fichas",
    async run(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const minhasPersonagens = await CharacterRepository.findByUser(interaction.user.id);

            if (minhasPersonagens.length === 0) {
                const embedErro = criarEmbedErro(
                    "Nenhuma ficha encontrada",
                    "Você ainda não possui nenhuma ficha. Use `/criar` para criar uma!"
                );
                await interaction.editReply({ embeds: [embedErro] });
                return;
            }

            const ITEMS_PER_PAGE = 5;
            const totalPages = Math.ceil(minhasPersonagens.length / ITEMS_PER_PAGE);
            const page = 0;

            const start = page * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const pageItems = minhasPersonagens.slice(start, end);

            const lista = pageItems
                .map((p: any) => {
                    const classes = Array.isArray(p.classes) ? p.classes : [];
                    const classesText =
                        classes.length > 0
                            ? classes.map((c: any) => `${c.nome} ${c.nivel}`).join(" / ")
                            : p.classe || "Classe desconhecida";
                    const nivelTotal = p.nivelTotal || p.nivel || 1;
                    return `🔮 **${p.nome}** - ${p.raca} ${classesText} (Nv ${nivelTotal})`;
                })
                .join("\n");

            const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } =
                await import("discord.js");
            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle("📜 Suas Fichas")
                .setDescription(lista)
                .setFooter({
                    text: `Página ${page + 1}/${totalPages} • Total: ${minhasPersonagens.length} fichas`,
                });

            const components = [];
            if (totalPages > 1) {
                const row = new ActionRowBuilder<any>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ficha_page/${interaction.user.id}/${page - 1}`)
                        .setLabel("◀ Anterior")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId(`ficha_page/${interaction.user.id}/${page + 1}`)
                        .setLabel("Próximo ▶")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages - 1)
                );
                components.push(row);
            }

            await interaction.editReply({ embeds: [embed], components });
        } catch (erro) {
            console.error(erro);
            const embedErro = criarEmbedErro(
                "Erro ao listar fichas",
                "Não foi possível listar suas fichas."
            );
            await interaction.editReply({ embeds: [embedErro] });
        }
    },
});

command.subcommand({
    name: "selecionar",
    description: "Marcar uma ficha como ativa",
    options: [
        {
            name: "personagem",
            description: "Nome do personagem",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    async run(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const nome = interaction.options.getString("personagem", true);
            const personagem = await CharacterRepository.findByUserAndName(
                interaction.user.id,
                nome
            );
            if (!personagem) {
                const embedErro = criarEmbedErro(
                    "Personagem não encontrado",
                    `Você não possui um personagem chamado **${nome}**.`
                );
                await interaction.editReply({ embeds: [embedErro] });
                return;
            }

            await CharacterRepository.update((personagem as any)._id || personagem.id, {
                atualizadoEm: new Date(),
            } as any);

            const embedSucesso = criarEmbedConfirmacao(
                "✨ Ficha Ativada",
                `**${nome}** agora é sua ficha ativa.`
            );
            await interaction.editReply({ embeds: [embedSucesso] });
        } catch (erro) {
            console.error(erro);
            const embedErro = criarEmbedErro(
                "Erro ao selecionar ficha",
                "Não foi possível marcar como ativa."
            );
            await interaction.editReply({ embeds: [embedErro] });
        }
    },
});

export default command;
