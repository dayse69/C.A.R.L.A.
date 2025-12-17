import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
import { CampaignRepository } from "../../../database/CampaignRepository.js";
createResponder({
    customId: "criar_campanha_modal/:nome",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        console.log(`[criar] campanha modal submit by user=${interaction.user?.id} customId=${interaction.customId}`);
        const [_, nome] = interaction.customId.split("/");
        const descricao = interaction.fields.getTextInputValue("descricao") || "";
        const ambientacao = interaction.fields.getTextInputValue("ambientacao") || "";
        const nivelInicial = interaction.fields.getTextInputValue("nivel_inicial") || "1";
        try {
            const existente = await CampaignRepository.findByMasterAndName(interaction.user.id, nome);
            if (existente) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF006E")
                            .setTitle("❌ Campanha já existe")
                            .setDescription(`Você já possui uma campanha chamada **${nome}**.`),
                    ],
                    ephemeral: true,
                });
                return;
            }
            const campanha = {
                mestre: interaction.user.id,
                nome,
                descricao,
                membros: [
                    {
                        userId: interaction.user.id,
                        personagem: "",
                        role: "Mestre",
                        adicionadoEm: new Date(),
                    },
                ],
                configurações: {
                    sistemaDeDados: "D20",
                    dificuldadeBase: "Média",
                    nivelXP: `Inicial ${nivelInicial || "1"}`,
                },
                progresso: {
                    sessõesRealizadas: 0,
                    dataÚltimaSessão: new Date(),
                    notasGerais: "",
                },
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            };
            const saved = await CampaignRepository.create(campanha);
            console.log(`[criar] campanha criada user=${interaction.user.id} nome=${nome} id=${saved?._id}`);
            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle("🗺️ Campanha Criada")
                .setDescription(`📜 **${nome}** criada com sucesso.\n\n` +
                (descricao ? `📝 ${descricao}\n` : "") +
                (ambientacao ? `🌍 Ambientação: **${ambientacao}**\n` : "") +
                `⚔️ Nível Inicial: **${nivelInicial}**`)
                .setFooter({ text: `C.A.R.L.A // Campanha ${saved._id}` });
            await interaction.reply({ embeds: [embed], ephemeral: false });
        }
        catch (err) {
            console.error("Erro criar campanha:", err);
            await interaction.reply({ content: "❌ Erro ao criar campanha.", ephemeral: true });
        }
    },
});
