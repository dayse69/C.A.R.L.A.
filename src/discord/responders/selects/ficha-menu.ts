/**
 * Responder para menu de seleção de abas de ficha
 * Interface mais bonita e prática que botões
 */

import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { CharacterRepository } from "../../../database/CharacterRepository.js";
import {
    criarCombateCard,
    criarPericiasCard,
    criarProfileCard,
} from "../../../ui/cards/profileCard.js";
import {
    criarEmbedErro,
    criarEmbedGeralFicha,
    criarEmbedInventarioFicha,
    criarEmbedMagiasFicha,
    criarEmbedNotasFicha,
    criarEmbedPoderesFicha,
    criarEmbedReacoesFicha,
    criarEmbedStatusFicha,
    criarEmbedXPFicha,
} from "../../../ui/embeds/fichaEmbeds.js";
import { createResponder, ResponderType } from "../../base/index.js";

// Mapeamento de abas para funções de embed
const embedFunctions = {
    profile: criarProfileCard, // Novo card visual
    geral: criarEmbedGeralFicha,
    combate: criarCombateCard, // Novo card de combate
    pericias: criarPericiasCard, // Novo card de perícias
    poderes: criarEmbedPoderesFicha,
    magias: criarEmbedMagiasFicha,
    inventario: criarEmbedInventarioFicha,
    notas: criarEmbedNotasFicha,
    status: criarEmbedStatusFicha, // Condições e efeitos
    xp: criarEmbedXPFicha, // Experiência e progressão
    reacoes: criarEmbedReacoesFicha, // Reações de combate
};

// Criar menu de abas
function criarMenuAbas(personagemId: string, abaAtual: string) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`ficha_menu/${personagemId}`)
        .setPlaceholder("🎴 Escolha uma visualização...")
        .addOptions(
            {
                label: "🎴 Profile Card",
                value: "profile",
                description: "Card visual estilo Discord",
                emoji: "✨",
                default: abaAtual === "profile",
            },
            {
                label: "📜 Geral",
                value: "geral",
                description: "Informações gerais e atributos",
                default: abaAtual === "geral",
            },
            {
                label: "⚔️ Combate",
                value: "combate",
                description: "Arsenal e estatísticas de batalha",
                default: abaAtual === "combate",
            },
            {
                label: "🎯 Perícias",
                value: "pericias",
                description: "Competências e habilidades",
                default: abaAtual === "pericias",
            },
            {
                label: "✨ Poderes",
                value: "poderes",
                description: "Habilidades especiais",
                default: abaAtual === "poderes",
            },
            {
                label: "📖 Magias",
                value: "magias",
                description: "Grimório de magia",
                default: abaAtual === "magias",
            },
            {
                label: "🎒 Inventário",
                value: "inventario",
                description: "Itens e equipamentos",
                default: abaAtual === "inventario",
            },
            {
                label: "📝 Notas",
                value: "notas",
                description: "Anotações e histórico",
                default: abaAtual === "notas",
            },
            {
                label: "🔮 Status",
                value: "status",
                description: "Condições e efeitos ativos",
                default: abaAtual === "status",
            },
            {
                label: "📊 Experiência",
                value: "xp",
                description: "Progressão e níveis",
                default: abaAtual === "xp",
            },
            {
                label: "⚡ Reações",
                value: "reacoes",
                description: "Habilidades reagentes",
                default: abaAtual === "reacoes",
            }
        );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}

// Responder para o menu de seleção
createResponder({
    customId: "ficha_menu/:personagemId",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        await interaction.deferUpdate();

        const personagemId = interaction.customId.split("/")[1];
        const abaEscolhida = interaction.values[0];

        console.log(`[Ficha Menu] Personagem ID: ${personagemId}, Aba: ${abaEscolhida}`);

        // Validar aba
        if (!(abaEscolhida in embedFunctions)) {
            await interaction.editReply({
                content: "❌ Aba inválida!",
                components: [],
            });
            return;
        }

        try {
            // Buscar personagem no banco pelo ID
            const personagem = await CharacterRepository.findById(personagemId);
            console.log(`[Ficha Menu] Personagem encontrado:`, personagem ? "Sim" : "Não");

            if (!personagem) {
                console.log(`[Ficha Menu] ERRO: Personagem não encontrado com ID: ${personagemId}`);
                const embedErro = criarEmbedErro(
                    "Ficha não encontrada",
                    `Personagem não encontrado.`
                );
                await interaction.editReply({
                    embeds: [embedErro],
                    components: [],
                });
                return;
            }

            // Criar embed da aba selecionada
            const embedFunction = embedFunctions[abaEscolhida as keyof typeof embedFunctions];
            const embed = embedFunction(personagem as any);

            // Criar menu com a aba atual destacada
            const menu = criarMenuAbas(personagemId, abaEscolhida);

            // Atualizar mensagem
            await interaction.editReply({
                embeds: [embed],
                components: [menu],
            });

            console.log(`[Ficha Menu] Aba atualizada com sucesso: ${abaEscolhida}`);
        } catch (erro) {
            console.error("Erro ao trocar aba da ficha:", erro);
            await interaction.editReply({
                content: "❌ Erro ao carregar aba da ficha!",
                components: [],
            });
        }
    },
});

export { criarMenuAbas };
