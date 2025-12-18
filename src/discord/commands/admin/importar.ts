import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { runImport } from "../../../tools/importTxt.js";
import { hasPermission } from "../../../utils/permissions.js";

export const data = new SlashCommandBuilder()
    .setName("importar")
    .setDescription("Executa a importação de TXT/PDF para o Acervo do Golem (admin)");

export async function execute(interaction: any) {
    const member = interaction.member;
    if (!hasPermission(member, PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: "❌ Permissão necessária: Administrator",
            ephemeral: true,
        });
    }
    await interaction.deferReply({ ephemeral: true });
    try {
        const report = await runImport();
        const { filesProcessed, duplicatesIgnored, summary } = report;
        const total =
            summary.racas +
            summary.classes +
            summary.poderes +
            summary.itens +
            summary.deuses +
            summary.dominios +
            summary.bases +
            summary.distincoes;
        const embed = new EmbedBuilder()
            .setColor("#8B00FF")
            .setTitle("📚 Importação de Acervo Concluída")
            .setDescription(
                `Foram processados \`${filesProcessed}\` arquivo(s) do diretório \`data/import/\`.`
            )
            .addFields(
                { name: "📊 Total de Entidades", value: `\`\`\`${total}\`\`\``, inline: true },
                { name: "🧬 Raças", value: `${summary.racas}`, inline: true },
                { name: "⚔️ Classes", value: `${summary.classes}`, inline: true },
                { name: "✨ Poderes Gerais", value: `${summary.poderes}`, inline: true },
                { name: "📦 Itens", value: `${summary.itens}`, inline: true },
                { name: "🕯️ Divindades", value: `${summary.deuses}`, inline: true },
                { name: "🎭 Domínios", value: `${summary.dominios}`, inline: true },
                { name: "📜 Bases", value: `${summary.bases}`, inline: true },
                { name: "🏆 Distinções", value: `${summary.distincoes}`, inline: true }
            );
        if (duplicatesIgnored.length > 0) {
            const dupsPreview = duplicatesIgnored.slice(0, 10).join("\n");
            const dupsMsg =
                duplicatesIgnored.length > 10
                    ? `${dupsPreview}\n... e mais ${duplicatesIgnored.length - 10}`
                    : dupsPreview;
            embed.addFields({
                name: `⚠️ Itens Duplicados/Ignorados (${duplicatesIgnored.length})`,
                value: `\`\`\`${dupsMsg}\`\`\``,
                inline: false,
            });
        }
        embed.setTimestamp();
        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        return interaction.editReply({
            content: `❌ Erro na importação:\n\`\`\`\n${errorMsg}\n\`\`\``,
        });
    }
}
