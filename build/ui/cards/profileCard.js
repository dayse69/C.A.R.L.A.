/**
 * Profile Card Visual System
 * Cria cards visuais bonitos como o Discord profile card
 */
import { EmbedBuilder } from "discord.js";
import { COLORS } from "../../utils/constants.js";
/**
 * Cria um embed de profile card visual
 * Similar ao card do Discord que você mostrou
 */
export function criarProfileCard(character) {
    // Verificação defensiva para dados antigos
    const classes = Array.isArray(character.classes) ? character.classes : [];
    const classePrincipal = classes.length > 0 ? classes[0].nome : character.classe || "Aventureiro";
    const nivelTotal = character.nivelTotal || character.nivel || 1;
    // Calcular XP baseado no nível
    const xpAtual = nivelTotal * 1000;
    const xpProximo = (nivelTotal + 1) * 1000;
    // PV e PM atuais
    const pvAtual = character.recursos?.pv?.atual ?? 0;
    const pvMaximo = character.recursos?.pv?.maximo ?? 12;
    const pmAtual = character.recursos?.pm?.atual ?? 0;
    const pmMaximo = character.recursos?.pm?.maximo ?? 10;
    // Criar barra de progresso visual
    const criarBarra = (atual, maximo, tamanho = 10) => {
        const porcentagem = Math.floor((atual / maximo) * tamanho);
        const preenchido = "█".repeat(porcentagem);
        const vazio = "░".repeat(tamanho - porcentagem);
        return `${preenchido}${vazio}`;
    };
    const embed = new EmbedBuilder()
        .setColor(COLORS.PRIMARY)
        .setTitle(`✦ ${character.nome.toUpperCase()} ✦`)
        .setDescription(`**${character.raca}** • ${classePrincipal}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `\`\`\`ansi\n` +
        `[2;36m╔═══════════════════════════════╗[0m\n` +
        `[2;36m║[0m  [1;37mNÍVEL ${nivelTotal}[0m                       [2;36m║[0m\n` +
        `[2;36m╚═══════════════════════════════╝[0m\n` +
        `\`\`\`\n` +
        `\n` +
        `**XP** [Experiência Global]\n` +
        `\`${criarBarra(xpAtual, xpProximo, 15)}\` \`${xpAtual}/${xpProximo}\`\n` +
        `\n` +
        `**❤️ Pontos de Vida**\n` +
        `\`${criarBarra(pvAtual, pvMaximo, 15)}\` \`${pvAtual}/${pvMaximo}\`\n` +
        `\n` +
        `**🔵 Pontos de Magia**\n` +
        `\`${criarBarra(pmAtual, pmMaximo, 15)}\` \`${pmAtual}/${pmMaximo}\`\n` +
        `\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`)
        .addFields({
        name: "🛡️ Sobre",
        value: character.historia?.aparencia || "Um misterioso aventureiro de Arton",
        inline: false,
    }, {
        name: "⚔️ Defesa",
        value: `\`${character.recursos?.defesa ?? 10}\``,
        inline: true,
    }, {
        name: "👣 Deslocamento",
        value: `\`${character.recursos?.deslocamento ?? 9}m\``,
        inline: true,
    }, {
        name: "💰 Ouro",
        value: `\`${character.ouro || 0} TO\``,
        inline: true,
    })
        .setThumbnail("https://i.imgur.com/placeholder.png") // Adicionar avatar personalizado depois
        .setFooter({
        text: `ID: ${character._id || "unknown"} • Use o menu para navegar`,
    })
        .setTimestamp();
    return embed;
}
/**
 * Cria um card de combate visual
 */
export function criarCombateCard(character) {
    const pvAtual = character.recursos?.pv?.atual ?? 0;
    const pvMaximo = character.recursos?.pv?.maximo ?? 12;
    const pmAtual = character.recursos?.pm?.atual ?? 0;
    const pmMaximo = character.recursos?.pm?.maximo ?? 10;
    const criarBarra = (atual, maximo) => {
        const porcentagem = Math.floor((atual / maximo) * 10);
        return "█".repeat(porcentagem) + "░".repeat(10 - porcentagem);
    };
    return new EmbedBuilder()
        .setColor(COLORS.ACCENT)
        .setTitle(`⚔️ ${character.nome} - Arsenal de Combate`)
        .setDescription(`\`\`\`ansi\n` +
        `[2;31m╔═══════════════════════════════╗[0m\n` +
        `[2;31m║[0m  [1;37mESTATÍSTICAS DE BATALHA[0m     [2;31m║[0m\n` +
        `[2;31m╚═══════════════════════════════╝[0m\n` +
        `\`\`\`\n` +
        `\n` +
        `**❤️ Pontos de Vida**\n` +
        `\`${criarBarra(pvAtual, pvMaximo)}\` **${pvAtual}/${pvMaximo}**\n` +
        `\n` +
        `**🔵 Pontos de Magia**\n` +
        `\`${criarBarra(pmAtual, pmMaximo)}\` **${pmAtual}/${pmMaximo}**\n` +
        `\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`)
        .addFields({
        name: "🛡️ Defesa",
        value: `\`\`\`\n${character.recursos?.defesa ?? 10}\n\`\`\``,
        inline: true,
    }, {
        name: "👣 Deslocamento",
        value: `\`\`\`\n${character.recursos?.deslocamento ?? 9}m\n\`\`\``,
        inline: true,
    }, {
        name: "⚔️ Iniciativa",
        value: `\`\`\`\n+${character.pericias?.iniciativa ?? 0}\n\`\`\``,
        inline: true,
    }, {
        name: "🔥 Resistências",
        value: `Fortitude: \`${character.pericias?.fortitude ?? 0}\`\n` +
            `Reflexos: \`${character.pericias?.reflexos ?? 0}\`\n` +
            `Vontade: \`${character.pericias?.vontade ?? 0}\``,
        inline: false,
    })
        .setFooter({ text: "Use /rolar ataque para atacar" })
        .setTimestamp();
}
/**
 * Cria card de perícias visual
 */
export function criarPericiasCard(character) {
    const pericias = character.pericias || {};
    // Agrupar perícias por tipo
    const periciasArray = Object.entries(pericias)
        .filter(([key]) => !["fortitude", "reflexos", "vontade", "iniciativa"].includes(key))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15); // Top 15 perícias
    const formatarPericia = (nome, valor) => {
        const stars = valor >= 5 ? "⭐⭐⭐" : valor >= 3 ? "⭐⭐" : valor >= 1 ? "⭐" : "○";
        return `${stars} **${nome.charAt(0).toUpperCase() + nome.slice(1)}**: \`+${valor}\``;
    };
    return new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle(`🎯 ${character.nome} - Competências`)
        .setDescription(`\`\`\`ansi\n` +
        `[2;32m╔═══════════════════════════════╗[0m\n` +
        `[2;32m║[0m  [1;37mPERÍCIAS TREINADAS[0m          [2;32m║[0m\n` +
        `[2;32m╚═══════════════════════════════╝[0m\n` +
        `\`\`\`\n` +
        `\n` +
        periciasArray
            .map(([nome, valor]) => formatarPericia(nome, valor))
            .join("\n"))
        .setFooter({ text: `Total: ${periciasArray.length} perícias | Use /rolar pericia` })
        .setTimestamp();
}
