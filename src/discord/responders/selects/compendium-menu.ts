/**
 * Responder para select menu do Acervo do Golem
 * Exibe dados do compêndio de Tormenta 20
 */

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from "discord.js";
import { readFileSync } from "fs";
import { join } from "path";
import { createResponder, ResponderType } from "../../base/index.js";

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

// Criar embed de erro
function criarEmbedErro(mensagem: string) {
    return new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("❌ Erro no Acervo")
        .setDescription(mensagem)
        .setFooter({ text: "C.A.R.L.A // Erro ao acessar dados" })
        .setTimestamp();
}

// Criar embed para categoria vazia
function criarEmbedVazio(categoria: string) {
    return new EmbedBuilder()
        .setColor("#8B00FF")
        .setTitle(`✦ ${categoria.toUpperCase()} ✦`)
        .setDescription(
            "```\n" +
                "╔════════════════════════════════════════════════════╗\n" +
                "║     Seção em Construção                            ║\n" +
                "╚════════════════════════════════════════════════════╝\n" +
                "```\n\n" +
                "🔮 **Status:** Esta categoria ainda não possui dados cadastrados.\n\n" +
                "📝 **Próximos Passos:**\n" +
                "• Aguardando importação de dados\n" +
                "• Conteúdo será adicionado em breve\n" +
                "• Utilize outras categorias disponíveis"
        )
        .setFooter({ text: "C.A.R.L.A // Categoria vazia" })
        .setTimestamp();
}

// Criar embed para Origens
function criarEmbedOrigens(origens: any[]) {
    if (!origens || origens.length === 0) {
        return criarEmbedVazio("Origens");
    }

    const embed = new EmbedBuilder()
        .setColor("#8B00FF")
        .setTitle("📜 ORIGENS")
        .setDescription(
            "```\n" +
                "╔════════════════════════════════════════════════════╗\n" +
                "║     Histórias de Onde Você Veio                   ║\n" +
                "╚════════════════════════════════════════════════════╝\n" +
                "```\n\n" +
                "As origens definem o passado e a história inicial do seu personagem.\n"
        )
        .setFooter({ text: `C.A.R.L.A // ${origens.length} origens catalogadas` })
        .setTimestamp();

    // Adicionar até 10 origens
    origens.slice(0, 10).forEach((origem) => {
        embed.addFields({
            name: `📜 ${origem.nome}`,
            value: origem.descricao || "Sem descrição",
            inline: false,
        });
    });

    return embed;
}

// Criar embed para Raças
function criarEmbedRacas(racas: any[]) {
    if (!racas || racas.length === 0) {
        return criarEmbedVazio("Raças");
    }

    const embed = new EmbedBuilder()
        .setColor("#8B00FF")
        .setTitle("🧬 RAÇAS")
        .setDescription(
            "```\n" +
                "╔════════════════════════════════════════════════════╗\n" +
                "║     Povos de Arton                                 ║\n" +
                "╚════════════════════════════════════════════════════╝\n" +
                "```\n\n" +
                "Explore as raças jogáveis de Tormenta 20.\n"
        )
        .setFooter({ text: `C.A.R.L.A // ${racas.length} raças catalogadas` })
        .setTimestamp();

    // Adicionar até 10 raças
    racas.slice(0, 10).forEach((raca) => {
        const bonus = raca.bonus
            ? Object.entries(raca.bonus)
                  .map(([attr, val]) => `${attr}: ${val}`)
                  .join(", ")
            : "N/A";
        embed.addFields({
            name: `🧬 ${raca.nome}`,
            value: `${raca.descricao}\n**Bônus:** ${bonus}`,
            inline: false,
        });
    });

    return embed;
}

// Criar embed para Classes com paginação
function criarEmbedClasses(classes: any[], page: number = 0) {
    if (!classes || classes.length === 0) {
        return { embed: criarEmbedVazio("Classes"), totalPages: 1 };
    }

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
            text: `C.A.R.L.A // ${classes.length} classes catalogadas | Página ${
                currentPage + 1
            }/${totalPages}`,
        })
        .setTimestamp();

    // Adicionar classes da página atual
    pageItems.forEach((classe) => {
        embed.addFields({
            name: `⚔️ ${classe.nome}`,
            value: `${classe.descricao}\n**PV Base:** ${classe.pv_base || "N/A"}${
                classe.pm_base ? ` | **PM Base:** ${classe.pm_base}` : ""
            }`,
            inline: false,
        });
    });

    return { embed, totalPages, currentPage };
}

// Criar embed para Classes Alternativas com paginação
function criarEmbedClassesAlternativas(classes: any[], page: number = 0) {
    if (!classes || classes.length === 0) {
        return { embed: criarEmbedVazio("Classes Alternativas"), totalPages: 1 };
    }

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
            text: `C.A.R.L.A // ${classes.length} especializações catalogadas | Página ${
                currentPage + 1
            }/${totalPages}`,
        })
        .setTimestamp();

    pageItems.forEach((classe) => {
        embed.addFields({
            name: `🎭 ${classe.nome}`,
            value: `${classe.descricao}\n**PV Base:** ${classe.pv_base || "N/A"}${
                classe.pm_base ? ` | **PM Base:** ${classe.pm_base}` : ""
            }`,
            inline: false,
        });
    });

    return { embed, totalPages, currentPage };
}

// Criar embed para Poderes Gerais
function criarEmbedPoderesGerais(poderes: any) {
    if (!poderes || typeof poderes !== "object") {
        return criarEmbedVazio("Poderes Gerais");
    }

    const categorias = ["racial", "combate", "destino", "magia", "tormenta", "concedido"];
    const totalPoderes = categorias.reduce((acc, cat) => acc + (poderes[cat]?.length || 0), 0);

    if (totalPoderes === 0) {
        return criarEmbedVazio("Poderes Gerais");
    }

    const embed = new EmbedBuilder()
        .setColor("#8B00FF")
        .setTitle("✨ PODERES GERAIS")
        .setDescription(
            "```\n" +
                "╔════════════════════════════════════════════════════╗\n" +
                "║     Habilidades Especiais por Categoria           ║\n" +
                "╚════════════════════════════════════════════════════╝\n" +
                "```\n\n" +
                "Os poderes gerais são habilidades que seu personagem pode adquirir.\n\n" +
                "**📚 Categorias:**\n"
        )
        .setFooter({ text: `C.A.R.L.A // ${totalPoderes} poderes catalogados` })
        .setTimestamp();

    categorias.forEach((categoria) => {
        const poderCategoria = poderes[categoria] || [];
        const count = poderCategoria.length;
        const emoji = {
            racial: "🧬",
            combate: "⚔️",
            destino: "🌟",
            magia: "🔮",
            tormenta: "🌪️",
            concedido: "🎁",
        }[categoria];

        embed.addFields({
            name: `${emoji} ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`,
            value: count > 0 ? `${count} poderes disponíveis` : "Nenhum poder cadastrado",
            inline: true,
        });
    });

    return embed;
}

// Criar embed para Deuses
function criarEmbedDeuses(deuses: any[], tipo: string) {
    if (!deuses || deuses.length === 0) {
        return criarEmbedVazio(`Deuses ${tipo}`);
    }

    const emojiMap: { [key: string]: string } = {
        Maiores: "🔱",
        Menores: "🕯️",
        "do Servidor": "⚡",
    };

    const emoji = emojiMap[tipo] || "✦";

    const embed = new EmbedBuilder()
        .setColor("#8B00FF")
        .setTitle(`${emoji} DEUSES ${tipo.toUpperCase()}`)
        .setDescription(
            "```\n" +
                "╔════════════════════════════════════════════════════╗\n" +
                `║     Panteão ${tipo}                                ║\n` +
                "╚════════════════════════════════════════════════════╝\n" +
                "```\n\n" +
                "Divindades e suas esferas de influência.\n"
        )
        .setFooter({ text: `C.A.R.L.A // ${deuses.length} divindades catalogadas` })
        .setTimestamp();

    deuses.slice(0, 10).forEach((deus) => {
        embed.addFields({
            name: `${emoji} ${deus.nome}`,
            value: `${deus.descricao}\n**Domínio:** ${deus.dominio || "N/A"}\n**Alinhamento:** ${
                deus.alinhamento || "N/A"
            }`,
            inline: false,
        });
    });

    return embed;
}

// Criar embed para Distinções
function criarEmbedDistincoes(distincoes: any[]) {
    if (!distincoes || distincoes.length === 0) {
        return criarEmbedVazio("Distinções");
    }

    const embed = new EmbedBuilder()
        .setColor("#8B00FF")
        .setTitle("🎖️ DISTINÇÕES")
        .setDescription(
            "```\n" +
                "╔════════════════════════════════════════════════════╗\n" +
                "║     Feitos e Talentos Especiais                   ║\n" +
                "╚════════════════════════════════════════════════════╝\n" +
                "```\n\n" +
                "Distinções são características especiais que definem seu personagem.\n"
        )
        .setFooter({ text: `C.A.R.L.A // ${distincoes.length} distinções catalogadas` })
        .setTimestamp();

    distincoes.slice(0, 10).forEach((distincao) => {
        const requisitos = distincao.requisitos || "Nenhum";
        const beneficios = distincao.beneficios ? distincao.beneficios.join(", ") : "N/A";
        embed.addFields({
            name: `🎖️ ${distincao.nome}`,
            value: `${distincao.descricao}\n**Requisitos:** ${requisitos}\n**Benefícios:** ${beneficios}`,
            inline: false,
        });
    });

    return embed;
}

// Criar embed genérico para categorias sem função específica
function criarEmbedGenerico(categoria: string, dados: any[]) {
    if (!dados || dados.length === 0) {
        return criarEmbedVazio(categoria);
    }

    const embed = new EmbedBuilder()
        .setColor("#8B00FF")
        .setTitle(`✦ ${categoria.toUpperCase()} ✦`)
        .setDescription(
            "```\n" +
                "╔════════════════════════════════════════════════════╗\n" +
                `║     ${categoria}                                   ║\n` +
                "╚════════════════════════════════════════════════════╝\n" +
                "```\n"
        )
        .setFooter({ text: `C.A.R.L.A // ${dados.length} itens catalogados` })
        .setTimestamp();

    dados.slice(0, 10).forEach((item) => {
        embed.addFields({
            name: item.nome || "Item sem nome",
            value: item.descricao || "Sem descrição",
            inline: false,
        });
    });

    return embed;
}

createResponder({
    customId: "compendium_category_select",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        await interaction.deferUpdate();

        const categoria = interaction.values[0];

        // Carregar acervo
        const acervo = carregarAcervo();
        if (!acervo) {
            await interaction.editReply({
                embeds: [criarEmbedErro("Não foi possível carregar os dados do Acervo do Golem.")],
                components: [],
            });
            return;
        }

        // Criar embed baseado na categoria selecionada
        let embedResult: any;
        let hasMultiplePages = false;

        switch (categoria) {
            case "origens":
                embedResult = { embed: criarEmbedOrigens(acervo.origens), totalPages: 1 };
                break;
            case "racas":
                embedResult = { embed: criarEmbedRacas(acervo.racas), totalPages: 1 };
                break;
            case "classes":
                embedResult = criarEmbedClasses(acervo.classes, 0);
                hasMultiplePages = embedResult.totalPages > 1;
                break;
            case "classes_alternativas":
                embedResult = criarEmbedClassesAlternativas(acervo.classes_alternativas, 0);
                hasMultiplePages = embedResult.totalPages > 1;
                break;
            case "poderes_gerais":
                embedResult = {
                    embed: criarEmbedPoderesGerais(acervo.poderes_gerais),
                    totalPages: 1,
                };
                break;
            case "deuses_maiores":
                embedResult = {
                    embed: criarEmbedDeuses(acervo.deuses_maiores, "Maiores"),
                    totalPages: 1,
                };
                break;
            case "deuses_menores":
                embedResult = {
                    embed: criarEmbedDeuses(acervo.deuses_menores, "Menores"),
                    totalPages: 1,
                };
                break;
            case "deuses_servidor":
                embedResult = {
                    embed: criarEmbedDeuses(acervo.deuses_servidor, "do Servidor"),
                    totalPages: 1,
                };
                break;
            case "distincoes":
                embedResult = { embed: criarEmbedDistincoes(acervo.distincoes), totalPages: 1 };
                break;
            case "bases":
                embedResult = { embed: criarEmbedGenerico("Bases", acervo.bases), totalPages: 1 };
                break;
            case "dominios":
                embedResult = {
                    embed: criarEmbedGenerico("Domínios", acervo.dominios),
                    totalPages: 1,
                };
                break;
            default:
                embedResult = {
                    embed: criarEmbedErro("Categoria não reconhecida."),
                    totalPages: 1,
                };
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

        // Adicionar botões de paginação se necessário
        if (hasMultiplePages && embedResult.totalPages > 1) {
            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`acervo_page/${categoria}/0`)
                    .setLabel("◀ Anterior")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId(`acervo_page/${categoria}/1`)
                    .setLabel("Próxima ▶")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(embedResult.totalPages <= 1)
            );
            rows.push(buttonRow);
        }

        await interaction.editReply({
            embeds: [embedResult.embed],
            components: rows,
        });
    },
});
