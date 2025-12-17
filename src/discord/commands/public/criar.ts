/**
 * Comando /criar
 * Sistema unificado de criação: fichas, campanhas e conteúdo do Acervo do Golem
 */

import { createCommand } from "#base";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { CharacterRepository } from "../../../database/CharacterRepository.js";
import { criarMenuAbas } from "../../responders/selects/ficha-menu.js";
import {
    converterParaCharacter,
    extrairTextoPDF,
    parsearFichaPDF,
} from "../../../services/pdfParserService.js";
import { criarProfileCard } from "../../../ui/cards/profileCard.js";

function sanitizeForCustomId(value: string) {
    // Custom IDs não podem ter '/' e caracteres especiais; normaliza para hífen
    return (value || "").replace(/[^a-zA-Z0-9_-]/g, "-");
}

createCommand({
    name: "criar",
    description: "Criar nova ficha, campanha ou conteúdo do Acervo do Golem",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "nome",
            description: "Nome do item a ser criado",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "origem",
            description: "Origem do personagem (opcional)",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "raca",
            description: "Raça do personagem (opcional)",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "classe",
            description: "Classe do personagem (opcional)",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "pdf",
            description: "Anexe o PDF da ficha para importar",
            type: ApplicationCommandOptionType.Attachment,
            required: false,
        },
    ],
    dmPermission: false,
    async run(interaction) {
        try {
            const nome = interaction.options.getString("nome", true).trim();
            const origem = interaction.options.getString("origem")?.trim();
            const raca = (interaction.options.getString("raca") || "").trim();
            const classe = (interaction.options.getString("classe") || "").trim();
            const pdfAttachment = interaction.options.getAttachment("pdf");

            console.log(
                `[criar] command invoked by user=${interaction.user?.id} guild=${interaction.guild?.id} nome=${nome}`
            );

            const safeNome = sanitizeForCustomId(nome);
            const safeOrigem = sanitizeForCustomId(origem || "sem_origem");
            const safeRaca = sanitizeForCustomId(raca || "sem_raca");
            const safeClasse = sanitizeForCustomId(classe || "sem_classe");

            console.log(`[criar] sanitized values: nome=${safeNome} origem=${safeOrigem}`);

            // Se PDF foi anexado, importar ficha diretamente
            if (pdfAttachment) {
                // Validar tipo
                const isPdf =
                    (pdfAttachment.contentType || "").includes("pdf") ||
                    pdfAttachment.name?.toLowerCase().endsWith(".pdf");
                if (!isPdf) {
                    await interaction.reply({
                        content: "❌ O arquivo anexado não parece ser um PDF.",
                        ephemeral: true,
                    });
                    return;
                }

                await interaction.deferReply({ ephemeral: false });
                console.log(
                    `[criar] importando PDF da ficha: ${pdfAttachment.name} url=${pdfAttachment.url}`
                );

                // Baixar para arquivo temporário
                const tmpDir = os.tmpdir();
                const tmpFile = path.join(
                    tmpDir,
                    `${Date.now()}-${sanitizeForCustomId(pdfAttachment.name || "ficha")}.pdf`
                );
                const res = await fetch(pdfAttachment.url);
                if (!res.ok) {
                    throw new Error(`Falha ao baixar PDF: ${res.status} ${res.statusText}`);
                }
                const arrayBuffer = await res.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(tmpFile, buffer);

                // Extrair e parsear
                const texto = await extrairTextoPDF(tmpFile);
                const fichaExtraida = parsearFichaPDF(texto);
                // Sobrescrever nome se veio no comando
                if (nome) fichaExtraida.nome = nome;
                if (raca) fichaExtraida.raca = raca;
                if (classe) fichaExtraida.classe = classe;

                const character = converterParaCharacter(fichaExtraida as any, interaction.user.id);
                (character as any).origem = origem || undefined;
                (character as any).categoria = "ficha_personagem";

                const existente = await CharacterRepository.findByUserAndName(
                    interaction.user.id,
                    character.nome
                );
                if (existente) {
                    await interaction.editReply({
                        content: `❌ Você já possui um personagem chamado **${character.nome}**.`,
                    });
                    try {
                        fs.unlinkSync(tmpFile);
                    } catch {}
                    return;
                }

                const id = await CharacterRepository.create(character as any);
                console.log(`[criar] ficha importada de PDF criada id=${id}`);

                // Exibir card e menu
                const embed = criarProfileCard({ ...(character as any), _id: id } as any);
                const menu = criarMenuAbas(id, "profile");
                await interaction.editReply({
                    content: "✨ Ficha importada do PDF com sucesso!",
                    embeds: [embed],
                    components: [menu],
                });
                try {
                    fs.unlinkSync(tmpFile);
                } catch {}
                return;
            }

            // Criar embed de seleção (fluxo padrão)
            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle("✦ SISTEMA DE CRIAÇÃO C.A.R.L.A ✦")
                .setDescription(
                    "```\n" +
                        "╔════════════════════════════════════════════════════╗\n" +
                        "║     O que deseja criar?                            ║\n" +
                        "╚════════════════════════════════════════════════════╝\n" +
                        "```\n\n" +
                        `📝 **Nome:** ${nome}\n` +
                        (origem ? `📜 **Origem:** ${origem}\n` : "") +
                        "\n" +
                        "Selecione o **tipo de criação** no menu abaixo:\n\n" +
                        "**🎭 Opções Disponíveis:**\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "📜 **Ficha de Personagem** - Criar novo personagem jogável\n" +
                        "🗺️ **Campanha** - Criar nova campanha/aventura\n\n" +
                        "**📚 Conteúdo do Acervo do Golem:**\n" +
                        "🧬 Raça | ⚔️ Classe | 🎭 Classe Alternativa\n" +
                        "✨ Poder Geral | 🔱 Deus | 🎖️ Distinção\n" +
                        "🏛️ Base | 🌟 Domínio | 📦 Item"
                )
                .setFooter({
                    text: "C.A.R.L.A // Sistema de criação iniciado",
                })
                .setTimestamp();

            // Criar select menu com todas as opções
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(
                    `criar_tipo_select/${safeNome}/${safeOrigem}/${safeRaca}/${safeClasse}`
                )
                .setPlaceholder("🔮 Selecione o tipo de criação...")
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions([
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Ficha de Personagem")
                        .setDescription("Criar um novo personagem jogável")
                        .setValue("ficha")
                        .setEmoji("📜"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Campanha")
                        .setDescription("Criar uma nova campanha ou aventura")
                        .setValue("campanha")
                        .setEmoji("🗺️"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Origem")
                        .setDescription("Adicionar nova origem ao Acervo")
                        .setValue("acervo_origem")
                        .setEmoji("📜"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Raça")
                        .setDescription("Adicionar nova raça ao Acervo")
                        .setValue("acervo_raca")
                        .setEmoji("🧬"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Classe")
                        .setDescription("Adicionar nova classe ao Acervo")
                        .setValue("acervo_classe")
                        .setEmoji("⚔️"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Classe Alternativa")
                        .setDescription("Adicionar classe alternativa ao Acervo")
                        .setValue("acervo_classe_alternativa")
                        .setEmoji("🎭"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Poder Geral")
                        .setDescription("Adicionar poder geral ao Acervo")
                        .setValue("acervo_poder")
                        .setEmoji("✨"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Deus")
                        .setDescription("Adicionar divindade ao Acervo")
                        .setValue("acervo_deus")
                        .setEmoji("🔱"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Distinção")
                        .setDescription("Adicionar distinção ao Acervo")
                        .setValue("acervo_distincao")
                        .setEmoji("🎖️"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Base")
                        .setDescription("Adicionar base ao Acervo")
                        .setValue("acervo_base")
                        .setEmoji("🏛️"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Domínio")
                        .setDescription("Adicionar domínio ao Acervo")
                        .setValue("acervo_dominio")
                        .setEmoji("🌟"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Item")
                        .setDescription("Adicionar item ao Acervo")
                        .setValue("acervo_item")
                        .setEmoji("📦"),
                ]);

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: false,
            });
            console.log(`[criar] replied with menu for nome=${nome}`);
        } catch (err) {
            console.error("[criar] falha ao responder comando", err);
            try {
                if (!interaction.replied) {
                    await interaction.reply({
                        content: "❌ Não foi possível iniciar o fluxo de criação.",
                        ephemeral: true,
                    });
                }
            } catch {}
        }
    },
});
