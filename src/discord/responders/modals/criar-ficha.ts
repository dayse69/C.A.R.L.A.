import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
import { CharacterRepository } from "../../../database/CharacterRepository.js";
import {
    getClassNames,
    getRaceNames,
    isValidClass,
    isValidRace,
} from "../../../services/compendiumService.js";
import { criarPersonagem } from "../../../services/fichaService.js";

function buildSuggestionList(values: string[], limit = 5): string {
    return values
        .filter(Boolean)
        .slice(0, limit)
        .map((v) => `• ${v}`)
        .join("\n");
}

createResponder({
    customId: "criar_ficha_modal/:nome/:origem",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        console.log(`\n📝 [CRIAR-FICHA] ===== MODAL SUBMIT =====`);
        console.log(`📝 [CRIAR-FICHA] customId: ${interaction.customId}`);
        console.log(`📝 [CRIAR-FICHA] user: ${interaction.user?.id}`);

        try {
            const [_, nome, origemRaw] = interaction.customId.split("/");
            console.log(`📝 [CRIAR-FICHA] split result: nome=${nome}, origem=${origemRaw}`);

            const origem = origemRaw === "sem_origem" ? null : origemRaw;
            const raca = interaction.fields.getTextInputValue("raca") || "";
            const classe = interaction.fields.getTextInputValue("classe") || "";
            const nivelStr = interaction.fields.getTextInputValue("nivel") || "1";
            const descricao = interaction.fields.getTextInputValue("descricao") || "";
            const nivel = Math.max(1, Math.min(20, parseInt(nivelStr || "1", 10) || 1));

            console.log(
                `📝 [CRIAR-FICHA] fields: raca=${raca}, classe=${classe}, nivel=${nivel}, desc=${descricao?.substring(0, 30)}`
            );
            console.log(
                `📝 [CRIAR-FICHA] payload -> user=${interaction.user?.id} guild=${interaction.guild?.id} nome=${nome} origem=${origem} raca=${raca} classe=${classe} nivel=${nivel} desc_len=${descricao.length}`
            );

            const existente = await CharacterRepository.findByUserAndName(
                interaction.user.id,
                nome
            );
            console.log(`📝 [CRIAR-FICHA] existente check: ${existente ? "EXISTS" : "NOT_EXISTS"}`);

            if (existente) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF006E")
                            .setTitle("❌ Personagem já existe")
                            .setDescription(`Você já possui um personagem chamado **${nome}**.`),
                    ],
                    ephemeral: true,
                });
                return;
            }

            const invalidFields: string[] = [];
            if (raca && !isValidRace(raca)) invalidFields.push("raça");
            if (classe && !isValidClass(classe)) invalidFields.push("classe");

            if (invalidFields.length) {
                const suggestions = [] as string[];
                if (invalidFields.includes("raça")) {
                    const races = buildSuggestionList(getRaceNames());
                    if (races) suggestions.push(`Raças sugeridas:\n${races}`);
                }
                if (invalidFields.includes("classe")) {
                    const classes = buildSuggestionList(getClassNames());
                    if (classes) suggestions.push(`Classes sugeridas:\n${classes}`);
                }

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF9F1C")
                            .setTitle("⚠️ Dados inválidos")
                            .setDescription(
                                `Revise os campos: ${invalidFields.join(", ")}.\n` +
                                    (suggestions.length ? `\n${suggestions.join("\n\n")}` : "")
                            ),
                    ],
                    ephemeral: true,
                });
                return;
            }

            // Validate provided race/class if present
            const racaFinal = raca || "Indefinida";
            const classeFinal = classe || "Aventureiro";

            const novo = criarPersonagem(interaction.user.id, nome, racaFinal, classeFinal, nivel);
            (novo as any).origem = origem || undefined;
            (novo as any).descricao = descricao || undefined;
            (novo as any).categoria = "ficha_personagem";

            await CharacterRepository.create(novo as any);
            console.log(
                `[criar] ficha criada user=${interaction.user.id} nome=${nome} raca=${racaFinal} classe=${classeFinal} nivel=${nivel} backend=CharacterRepository`
            );

            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle("✨ Ficha Criada!")
                .setDescription(
                    `📜 **${nome}** criado com sucesso.\n` +
                        (origem ? `📜 Origem: **${origem}**\n` : "") +
                        (raca ? `🧬 Raça: **${raca}**\n` : "") +
                        (classe ? `⚔️ Classe: **${classe}**\n` : "") +
                        `🛡️ Nível: **${nivel}**\n` +
                        `🏷️ Categoria: Ficha de Personagem`
                )
                .setFooter({ text: "C.A.R.L.A // Criação de ficha" });

            await interaction.reply({ embeds: [embed], ephemeral: false });
        } catch (err) {
            console.error(`📝 [CRIAR-FICHA] ❌ ERRO:`, err);
            if (err instanceof Error) {
                console.error(`📝 [CRIAR-FICHA] ❌ Message: ${err.message}`);
                console.error(`📝 [CRIAR-FICHA] ❌ Stack:\n${err.stack}`);
            }
            try {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF0000")
                            .setTitle("Erro ao criar ficha")
                            .setDescription("Não foi possível criar sua ficha."),
                    ],
                    ephemeral: true,
                });
            } catch (replyErr) {
                console.error(`📝 [CRIAR-FICHA] ❌ ERRO ao responder falha:`, replyErr);
            }
        }
    },
});
