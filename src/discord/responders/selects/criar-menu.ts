/**
 * Responder para select menu do comando /criar
 * Processa a seleção do tipo de criação
 */

import { createResponder, ResponderType } from "#base";
import {
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";

function buildAcervoModal(tipo: string, nome: string, titulo: string) {
    const modal = new ModalBuilder()
        .setCustomId(`criar_acervo_modal/${tipo}/${nome}`)
        .setTitle(titulo);

    const descInput = new TextInputBuilder()
        .setCustomId("descricao")
        .setLabel("Descrição")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(700);

    const atributosInput = new TextInputBuilder()
        .setCustomId("atributos")
        .setLabel("Atributos/Bônus (opcional)")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(400);

    const requisitosInput = new TextInputBuilder()
        .setCustomId("requisitos")
        .setLabel("Requisitos/Notas (opcional)")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(atributosInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(requisitosInput)
    );

    return { modal };
}

createResponder({
    customId: "criar_tipo_select/:nome/:origem/:raca/:classe",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        console.log(`\n🎯 [CRIAR-MENU] ===== RESPONDER TRIGGERED =====`);
        const start = Date.now();
        console.log(`🎯 [CRIAR-MENU] customId: ${interaction.customId}`);
        console.log(`🎯 [CRIAR-MENU] values: ${interaction.values?.join(",")}`);

        try {
            const [_, nome, origemRaw, racaRaw, classeRaw] = interaction.customId.split("/");
            const origem = origemRaw === "sem_origem" ? null : origemRaw;
            const racaSel = racaRaw === "sem_raca" ? null : racaRaw;
            const classeSel = classeRaw === "sem_classe" ? null : classeRaw;
            const tipoSelecionado = interaction.values[0];

            console.log(
                `🎯 [CRIAR-MENU] tipo=${tipoSelecionado}, nome=${nome}, origem=${origem}, raca=${racaSel}, classe=${classeSel}`
            );

            // Roteamento baseado no tipo selecionado
            // Observação: não deferimos update aqui porque precisamos chamar showModal
            // imediatamente; deferUpdate impediria showModal.

            switch (tipoSelecionado) {
                case "ficha":
                    console.log("🎯 [CRIAR-MENU] → Case 'ficha' matched");
                    const tFicha = Date.now();
                    await handleCriarFicha(interaction, nome, origem, racaSel, classeSel);
                    console.log(
                        `🎯 [CRIAR-MENU] → Modal shown for ficha (elapsed ${Date.now() - tFicha}ms)`
                    );
                    break;
                case "campanha":
                    console.log("🎯 [CRIAR-MENU] → Case 'campanha' matched");
                    const tCamp = Date.now();
                    await handleCriarCampanha(interaction, nome);
                    console.log(
                        `🎯 [CRIAR-MENU] → Modal shown for campanha (elapsed ${Date.now() - tCamp}ms)`
                    );
                    break;
                case "acervo_poder": {
                    console.log("🎯 [CRIAR-MENU] → Case 'acervo_poder' matched");
                    await interaction.deferUpdate();
                    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`criar_poder_categoria_select/${nome}`)
                            .setPlaceholder("✨ Selecione a categoria do poder...")
                            .addOptions(
                                { label: "Racial", value: "racial", emoji: "🧬" },
                                { label: "Combate", value: "combate", emoji: "⚔️" },
                                { label: "Destino", value: "destino", emoji: "🎯" },
                                { label: "Magia", value: "magia", emoji: "🪄" },
                                { label: "Tormenta", value: "tormenta", emoji: "🌪️" },
                                { label: "Concedido", value: "concedido", emoji: "🙏" }
                            )
                    );

                    const embed = new EmbedBuilder()
                        .setColor("#8B00FF")
                        .setTitle("✨ Criar Poder Geral")
                        .setDescription(
                            "Escolha a categoria do poder e, em seguida, preencha o modal."
                        );

                    await interaction.update({ content: "", embeds: [embed], components: [row] });
                    console.log("🎯 [CRIAR-MENU] → Categoria select sent for power");
                    break;
                }
                case "acervo_origem": {
                    console.log("🎯 [CRIAR-MENU] → Case 'acervo_origem' matched");
                    const { modal } = buildAcervoModal("acervo_origem", nome, "📜 Criar Origem");
                    await interaction.showModal(modal);
                    console.log("🎯 [CRIAR-MENU] → Modal shown for origin");
                    break;
                }
                case "acervo_raca": {
                    console.log("🎯 [CRIAR-MENU] → Case 'acervo_raca' matched");
                    const { modal } = buildAcervoModal("acervo_raca", nome, "🧬 Criar Raça");
                    await interaction.showModal(modal);
                    console.log("🎯 [CRIAR-MENU] → Modal shown for race");
                    break;
                }
                case "acervo_classe": {
                    console.log("🎯 [CRIAR-MENU] → Case 'acervo_classe' matched");
                    const { modal } = buildAcervoModal("acervo_classe", nome, "⚔️ Criar Classe");
                    await interaction.showModal(modal);
                    console.log("🎯 [CRIAR-MENU] → Modal shown for class");
                    break;
                }
                case "acervo_classe_alternativa": {
                    console.log("🎯 [CRIAR-MENU] → Case 'acervo_classe_alternativa' matched");
                    const { modal } = buildAcervoModal(
                        "acervo_classe_alternativa",
                        nome,
                        "🎭 Criar Classe Alternativa"
                    );
                    await interaction.showModal(modal);
                    console.log("🎯 [CRIAR-MENU] → Modal shown for alt class");
                    break;
                }
                case "acervo_deus": {
                    console.log("🎯 [CRIAR-MENU] → Case 'acervo_deus' matched");
                    await interaction.deferUpdate();
                    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`criar_deus_categoria_select/${nome}`)
                            .setPlaceholder("🕯️ Selecione a categoria do deus...")
                            .addOptions(
                                { label: "Maiores", value: "maiores", emoji: "🌟" },
                                { label: "Menores", value: "menores", emoji: "✨" },
                                { label: "Servidores", value: "servidores", emoji: "🛡️" }
                            )
                    );

                    const embed = new EmbedBuilder()
                        .setColor("#8B00FF")
                        .setTitle("🕯️ Criar Divindade")
                        .setDescription("Escolha a categoria e, em seguida, preencha o modal.");

                    await interaction.update({ content: "", embeds: [embed], components: [row] });
                    console.log("🎯 [CRIAR-MENU] → Categoria select sent for god");
                    break;
                }
                case "acervo_distincao":
                case "acervo_base":
                case "acervo_dominio":
                case "acervo_item": {
                    console.log(
                        "🎯 [CRIAR-MENU] → Case 'acervo_item/distincao/base/dominio' matched"
                    );
                    await interaction.deferUpdate();
                    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`criar_item_categoria_select/${nome}`)
                            .setPlaceholder("📦 Selecione a categoria do item...")
                            .addOptions(
                                { label: "Mundanos", value: "mundanos", emoji: "🧰" },
                                { label: "Consumíveis", value: "consumiveis", emoji: "🧪" },
                                { label: "Mágicos", value: "magicos", emoji: "✨" },
                                { label: "Aprimorados", value: "aprimorados", emoji: "🛠️" }
                            )
                    );

                    const embed = new EmbedBuilder()
                        .setColor("#8B00FF")
                        .setTitle("📦 Criar Item do Acervo")
                        .setDescription(
                            "Escolha a categoria do item e, em seguida, preencha o modal."
                        );

                    await interaction.update({ content: "", embeds: [embed], components: [row] });
                    console.log("🎯 [CRIAR-MENU] → Categoria select sent for item");
                    break;
                }
                default:
                    console.warn(`🎯 [CRIAR-MENU] ❌ Tipo desconhecido: ${tipoSelecionado}`);
                    await interaction.update({
                        content: "❌ Tipo de criação não reconhecido.",
                        embeds: [],
                        components: [],
                    });
            }
        } catch (err) {
            console.error(`🎯 [CRIAR-MENU] ❌ ERRO CAPTURADO:`, err);
            if (err instanceof Error) {
                console.error(`🎯 [CRIAR-MENU] ❌ Mensagem: ${err.message}`);
                console.error(`🎯 [CRIAR-MENU] ❌ Stack:\n${err.stack}`);
            }
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({
                        content: "❌ Interação falhou. Verifique os logs do bot.",
                        components: [],
                    });
                } else {
                    await interaction.update({
                        content: "❌ Interação falhou. Verifique os logs do bot.",
                        embeds: [],
                        components: [],
                    });
                }
            } catch (updateErr) {
                console.error(`🎯 [CRIAR-MENU] ❌ ERRO ao responder falha:`, updateErr);
            }
        }
        console.log(`🎯 [CRIAR-MENU] total handler elapsed ${Date.now() - start}ms`);
    },
});

// Handler para criar ficha de personagem
async function handleCriarFicha(
    interaction: any,
    nome: string,
    origem: string | null,
    racaSel?: string | null,
    classeSel?: string | null
) {
    const modal = new ModalBuilder()
        .setCustomId(`criar_ficha_modal/${nome}/${origem || "sem_origem"}`)
        .setTitle("📜 Criar Ficha de Personagem");

    const racaInput = new TextInputBuilder()
        .setCustomId("raca")
        .setLabel("Raça")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ex: Humano, Elfo, Anão...")
        .setRequired(false);
    if (racaSel) racaInput.setValue(racaSel);

    const classeInput = new TextInputBuilder()
        .setCustomId("classe")
        .setLabel("Classe")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ex: Guerreiro, Mago, Clérigo...")
        .setRequired(false);
    if (classeSel) classeInput.setValue(classeSel);

    const nivelInput = new TextInputBuilder()
        .setCustomId("nivel")
        .setLabel("Nível Inicial")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("1-20 (padrão: 1)")
        .setRequired(false)
        .setMaxLength(2);

    const descricaoInput = new TextInputBuilder()
        .setCustomId("descricao")
        .setLabel("Descrição breve (opcional)")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("História, aparência, personalidade...")
        .setRequired(false)
        .setMaxLength(500);

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(racaInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(classeInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(nivelInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(descricaoInput)
    );

    const t = Date.now();
    await interaction.showModal(modal);
    console.log(`🎯 [CRIAR-MENU] handleCriarFicha showModal elapsed ${Date.now() - t}ms`);
}

// Handler para criar campanha
async function handleCriarCampanha(interaction: any, nome: string) {
    const modal = new ModalBuilder()
        .setCustomId(`criar_campanha_modal/${nome}`)
        .setTitle("🗺️ Criar Nova Campanha");

    const descricaoInput = new TextInputBuilder()
        .setCustomId("descricao")
        .setLabel("Descrição da Campanha")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Descreva a campanha, setting, tema...")
        .setRequired(true)
        .setMaxLength(1000);

    const ambientacaoInput = new TextInputBuilder()
        .setCustomId("ambientacao")
        .setLabel("Ambientação")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ex: Arton, Reino de Jade, etc.")
        .setRequired(false);

    const nivelInicialInput = new TextInputBuilder()
        .setCustomId("nivel_inicial")
        .setLabel("Nível Inicial dos Jogadores")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("1-20 (padrão: 1)")
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(descricaoInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(ambientacaoInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(nivelInicialInput)
    );

    const t = Date.now();
    await interaction.showModal(modal);
    console.log(`🎯 [CRIAR-MENU] handleCriarCampanha showModal elapsed ${Date.now() - t}ms`);
}

// (fluxo de acervo genérico removido; usamos categoria específica para itens)
