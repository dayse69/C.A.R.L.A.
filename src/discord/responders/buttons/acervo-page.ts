/**
 * Responder para botões de paginação do Acervo
 */

import { createResponder, ResponderType } from "#base";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from "discord.js";
import { readFileSync } from "fs";
import { join } from "path";

// Carregar dados do acervo
function carregarAcervo() {
    try {
        const acervoPath = join(process.cwd(), "data", "compendium", "acervo-do-golem.json");
        const acervoData = readFileSync(acervoPath, "utf-8");
        return JSON.parse(acervoData);
    } catch (error) {
        console.error("❌ Erro ao carregar acervo:", error);
        return null;
    }
}

// Criar embed para Classes com paginação
function criarEmbedClasses(classes: any[], page: number = 0) {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(classes.length / itemsPerPage);
    const currentPage = Math.max(0, Math.min(page, totalPages - 1));
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = classes.slice(start, end);

    const embed = new EmbedBuilder()
        .setColor("#8B00FF")
        .setTitle("⚔️ CLASSES")
        .setDescription(
            "```\n" +
                "╔════════════════════════════════════════════════════╗\n" +
                "║     Caminhos de Poder                              ║\n" +
                "╚════════════════════════════════════════════════════╝\n" +
                "```\n\n" +
                "Conheça as classes principais do sistema Tormenta 20.\n"
        )
        .setFooter({
            text: `C.A.R.L.A // ${classes.length} classes catalogadas | Página ${currentPage + 1}/${totalPages}`,
        })
        .setTimestamp();

    pageItems.forEach((classe) => {
        embed.addFields({
            name: `⚔️ ${classe.nome}`,
            value: `${classe.descricao}\n**PV Base:** ${classe.pv_base || "N/A"}${classe.pm_base ? ` | **PM Base:** ${classe.pm_base}` : ""}`,
            inline: false,
        });
    });

    return { embed, totalPages, currentPage };
}

// Criar embed para Classes Alternativas com paginação
function criarEmbedClassesAlternativas(classes: any[], page: number = 0) {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(classes.length / itemsPerPage);
    const currentPage = Math.max(0, Math.min(page, totalPages - 1));
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = classes.slice(start, end);

    const embed = new EmbedBuilder()
        .setColor("#8B00FF")
        .setTitle("🎭 CLASSES ALTERNATIVAS")
        .setDescription(
            "```\n" +
                "╔════════════════════════════════════════════════════╗\n" +
                "║     Especializações Únicas                         ║\n" +
                "╚════════════════════════════════════════════════════╝\n" +
                "```\n\n" +
                "Caminhos alternativos e especializações avançadas.\n"
        )
        .setFooter({
            text: `C.A.R.L.A // ${classes.length} especializações catalogadas | Página ${currentPage + 1}/${totalPages}`,
        })
        .setTimestamp();

    pageItems.forEach((classe) => {
        embed.addFields({
            name: `🎭 ${classe.nome}`,
            value: `${classe.descricao}\n**PV Base:** ${classe.pv_base || "N/A"}${classe.pm_base ? ` | **PM Base:** ${classe.pm_base}` : ""}`,
            inline: false,
        });
    });

    return { embed, totalPages, currentPage };
}

createResponder({
    customId: "acervo_page/:categoria/:page",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        await interaction.deferUpdate();

        const [_, categoria, pageStr] = interaction.customId.split("/");
        const targetPage = parseInt(pageStr, 10);

        // Carregar acervo
        const acervo = carregarAcervo();
        if (!acervo) {
            await interaction.editReply({
                content: "❌ Erro ao carregar dados do Acervo.",
                components: [],
            });
            return;
        }

        // Criar embed baseado na categoria
        let embedResult: any;

        switch (categoria) {
            case "classes":
                embedResult = criarEmbedClasses(acervo.classes, targetPage);
                break;
            case "classes_alternativas":
                embedResult = criarEmbedClassesAlternativas(
                    acervo.classes_alternativas,
                    targetPage
                );
                break;
            default:
                await interaction.editReply({
                    content: "❌ Categoria não suporta paginação.",
                    components: [],
                });
                return;
        }

        // Recriar o select menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("compendium_category_select")
            .setPlaceholder("🔮 Selecione outra categoria...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                { label: "Origens", value: "origens", emoji: "📜" },
                { label: "Raças", value: "racas", emoji: "🧬" },
                { label: "Classes", value: "classes", emoji: "⚔️" },
                { label: "Classes Alternativas", value: "classes_alternativas", emoji: "🎭" },
                { label: "Poderes Gerais", value: "poderes_gerais", emoji: "✨" },
                { label: "Deuses Maiores", value: "deuses_maiores", emoji: "🔱" },
                { label: "Deuses Menores", value: "deuses_menores", emoji: "🕯️" },
                { label: "Deuses do Servidor", value: "deuses_servidor", emoji: "⚡" },
                { label: "Distinções", value: "distincoes", emoji: "🎖️" },
                { label: "Bases", value: "bases", emoji: "🏛️" },
                { label: "Domínios", value: "dominios", emoji: "🌟" },
            ]);

        const rows: any[] = [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
        ];

        // Adicionar botões de paginação
        const { currentPage, totalPages } = embedResult;
        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`acervo_page/${categoria}/${currentPage - 1}`)
                .setLabel("◀ Anterior")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId(`acervo_page/${categoria}/${currentPage + 1}`)
                .setLabel("Próxima ▶")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage >= totalPages - 1)
        );
        rows.push(buttonRow);

        await interaction.editReply({
            embeds: [embedResult.embed],
            components: rows,
        });
    },
});
