import { createResponder, ResponderType } from "#base";
import { env } from "#env";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
function loadAcervo() {
    const p = join(process.cwd(), "data", "compendium", "acervo-do-golem.json");
    return { path: p, json: JSON.parse(readFileSync(p, "utf-8")) };
}
function normalizeId(value) {
    return value.toLowerCase().trim().replace(/\s+/g, "_");
}
function resolveCollection(json, target) {
    if (target.startsWith("itens.")) {
        const cat = target.split(".")[1];
        if (!json.itens)
            json.itens = { mundanos: [], consumiveis: [], magicos: [], aprimorados: [] };
        return json.itens[cat];
    }
    if (target.startsWith("poderes_gerais.")) {
        const cat = target.split(".")[1];
        if (!json.poderes_gerais)
            json.poderes_gerais = {
                racial: [],
                combate: [],
                destino: [],
                magia: [],
                tormenta: [],
                concedido: [],
            };
        return json.poderes_gerais[cat];
    }
    if (!json[target])
        json[target] = [];
    return json[target];
}
createResponder({
    customId: "criar_acervo_modal/:tipo/:nome",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        console.log(`[criar] acervo modal submit by user=${interaction.user?.id} customId=${interaction.customId}`);
        // Permissões: Admin/ManageGuild, ou IDs permitidos por env
        const roleIds = (env.ALLOW_ACERVO_ROLE_IDS || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const userIds = (env.ALLOW_ACERVO_USER_IDS || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const isAllowedUser = userIds.includes(interaction.user.id);
        const hasPerms = interaction.inGuild()
            ? interaction.memberPermissions?.has(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageGuild)
            : false;
        const hasAllowedRole = interaction.inGuild()
            ? roleIds.some((rid) => interaction.member?.roles &&
                interaction.member.roles.cache?.has?.(rid))
            : false;
        if (!(isAllowedUser || hasPerms || hasAllowedRole)) {
            console.warn(`[criar] acervo denied for user=${interaction.user.id} guild=${interaction.guild?.id}`);
            await interaction.reply({
                content: "❌ Você não tem permissão para criar/editar o Acervo. (Requer Administrador, Gerenciar Servidor, ou cargo/config autorizado)",
                ephemeral: true,
            });
            return;
        }
        const [_, tipo, nome] = interaction.customId.split("/");
        const descricao = interaction.fields.getTextInputValue("descricao") || "";
        const atributos = interaction.fields.getTextInputValue("atributos") || "";
        const requisitos = interaction.fields.getTextInputValue("requisitos") || "";
        const { path, json } = loadAcervo();
        // Mapear tipo para coleção
        const map = {
            acervo_origem: "origens",
            acervo_raca: "racas",
            acervo_classe: "classes",
            acervo_classe_alternativa: "classes_alternativas",
            acervo_poder_racial: "poderes_gerais.racial",
            acervo_poder_combate: "poderes_gerais.combate",
            acervo_poder_destino: "poderes_gerais.destino",
            acervo_poder_magia: "poderes_gerais.magia",
            acervo_poder_tormenta: "poderes_gerais.tormenta",
            acervo_poder_concedido: "poderes_gerais.concedido",
            acervo_deus_maiores: "deuses_maiores",
            acervo_deus_menores: "deuses_menores",
            acervo_deus_servidores: "deuses_servidores",
            acervo_distincao: "distincoes",
            acervo_base: "bases",
            acervo_dominio: "dominios",
            acervo_item_mundanos: "itens.mundanos",
            acervo_item_consumiveis: "itens.consumiveis",
            acervo_item_magicos: "itens.magicos",
            acervo_item_aprimorados: "itens.aprimorados",
        };
        const target = map[tipo];
        if (!target) {
            await interaction.reply({ content: "❌ Tipo de acervo inválido.", ephemeral: true });
            return;
        }
        // Inserção básica
        const item = { id: normalizeId(nome), nome, descricao };
        if (atributos)
            item.atributos = atributos;
        if (requisitos)
            item.requisitos = requisitos;
        const collection = resolveCollection(json, target);
        if (!collection) {
            await interaction.reply({ content: "❌ Coleção não encontrada.", ephemeral: true });
            return;
        }
        const exists = collection.some((entry) => normalizeId(entry?.nome || entry?.name || entry?.id || "") === item.id);
        if (exists) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#FF006E")
                        .setTitle("⚠️ Já existe")
                        .setDescription(`O item **${nome}** já está cadastrado em **${target}**.`),
                ],
                ephemeral: true,
            });
            return;
        }
        collection.push(item);
        writeFileSync(path, JSON.stringify(json, null, 2), "utf-8");
        const embed = new EmbedBuilder()
            .setColor("#8B00FF")
            .setTitle("📚 Acervo Atualizado")
            .setDescription(`Adicionado **${nome}** em **${target}**.\n` +
            `👤 Por: <@${interaction.user.id}>` +
            (interaction.guild ? `\n🏠 Servidor: ${interaction.guild.name}` : ""))
            .setFooter({ text: "C.A.R.L.A // Atualização do Acervo" });
        console.log(`[criar] acervo atualizado tipo=${tipo} nome=${nome}`);
        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
});
