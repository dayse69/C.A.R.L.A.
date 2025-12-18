import {
    ActionRowBuilder,
    ApplicationCommandType,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { createCommand } from "../../base/index.js";

createCommand({
    name: "compendium",
    description: "Acesse o Acervo do Golem - Compêndio completo de Tormenta 20",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    async run(interaction) {
        // Criar embed principal
        const embed = new EmbedBuilder()
            .setColor("#8B00FF") // Roxo arcano
            .setTitle("✦ ACERVO DO GOLEM ✦")
            .setDescription(
                "```\n" +
                    "╔════════════════════════════════════════════════════╗\n" +
                    "║     Compêndio Completo de Tormenta 20              ║\n" +
                    "║     Base de Conhecimento C.A.R.L.A                 ║\n" +
                    "╚════════════════════════════════════════════════════╝\n" +
                    "```\n\n" +
                    "Selecione uma **categoria** no menu abaixo para explorar o conhecimento arquivado:\n\n" +
                    "🔮 **Categorias Disponíveis:**\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "📜 **Origens** - Histórias de onde você veio\n" +
                    "🧬 **Raças** - Povos de Arton\n" +
                    "⚔️ **Classes** - Caminhos de poder\n" +
                    "🎭 **Classes Alternativas** - Especializações únicas\n" +
                    "✨ **Poderes Gerais** - Habilidades especiais\n" +
                    "🔱 **Deuses Maiores** - Panteão principal\n" +
                    "🕯️ **Deuses Menores** - Divindades secundárias\n" +
                    "⚡ **Deuses do Servidor** - Divindades customizadas\n" +
                    "🎖️ **Distinções** - Feitos e talentos\n" +
                    "🏛️ **Bases** - Origens de poder\n" +
                    "🌟 **Domínios** - Esferas de influência"
            )
            .setFooter({
                text: "C.A.R.L.A // Acervo sincronizado | Análise disponível",
            })
            .setTimestamp();

        // Criar select menu com categorias
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("compendium_category_select")
            .setPlaceholder("🔮 Selecione uma categoria do Acervo...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                new StringSelectMenuOptionBuilder()
                    .setLabel("Origens")
                    .setDescription("Descubra as origens dos personagens de Arton")
                    .setValue("origens")
                    .setEmoji("📜"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Raças")
                    .setDescription("Explore as raças jogáveis de Tormenta 20")
                    .setValue("racas")
                    .setEmoji("🧬"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Classes")
                    .setDescription("Conheça as classes principais do sistema")
                    .setValue("classes")
                    .setEmoji("⚔️"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Classes Alternativas")
                    .setDescription("Especializações e caminhos alternativos")
                    .setValue("classes_alternativas")
                    .setEmoji("🎭"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Poderes Gerais")
                    .setDescription("Habilidades especiais por categoria")
                    .setValue("poderes_gerais")
                    .setEmoji("✨"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Deuses Maiores")
                    .setDescription("Panteão principal de Arton")
                    .setValue("deuses_maiores")
                    .setEmoji("🔱"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Deuses Menores")
                    .setDescription("Divindades secundárias e cultos")
                    .setValue("deuses_menores")
                    .setEmoji("🕯️"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Deuses do Servidor")
                    .setDescription("Divindades customizadas para este servidor")
                    .setValue("deuses_servidor")
                    .setEmoji("⚡"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Distinções")
                    .setDescription("Feitos, talentos e características especiais")
                    .setValue("distincoes")
                    .setEmoji("🎖️"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Bases")
                    .setDescription("Origens de poder e fundações")
                    .setValue("bases")
                    .setEmoji("🏛️"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Domínios")
                    .setDescription("Esferas de influência divina")
                    .setValue("dominios")
                    .setEmoji("🌟"),
            ]);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false,
        });
    },
});
