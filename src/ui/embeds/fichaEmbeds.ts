/**
 * FichaEmbedBuilder
 * Sistema de fichas com 7 abas navegáveis
 */

import { EmbedBuilder } from "discord.js";
import {
    Character,
    calcularModificador,
    formatarModificador,
} from "../../services/fichaService.js";
import { COLORS, EMOJIS } from "../../utils/constants.js";

/**
 * ABA 1: 🧿 Geral - Identificação e atributos (Tema: A Sombra Escaroluz)
 */
export function criarEmbedGeralFicha(character: Character): EmbedBuilder {
    const mods = {
        FOR: calcularModificador(character.atributos.FOR),
        DES: calcularModificador(character.atributos.DES),
        CON: calcularModificador(character.atributos.CON),
        INT: calcularModificador(character.atributos.INT),
        SAB: calcularModificador(character.atributos.SAB),
        CAR: calcularModificador(character.atributos.CAR),
    };

    const formatarAtributo = (mod: number): string => {
        const emoji = mod > 0 ? "✨" : mod < 0 ? "💔" : "🧿";
        return `${emoji} \`${formatarModificador(mod)}\``;
    };

    // Barra visual de PM
    const pm = character.recursos?.pm || { atual: 0, maximo: 10 };
    const barraPercentual = Math.round((pm.atual / pm.maximo) * 10);
    const barraVisual = "▓".repeat(barraPercentual) + "░".repeat(10 - barraPercentual);

    // Verificação defensiva para dados antigos
    const classes = Array.isArray((character as any).classes) ? (character as any).classes : [];
    const classesText =
        classes.length > 0
            ? classes.map((c: any) => `${c.nome} ${c.nivel}`).join(" / ")
            : (character as any).classe || "Classe desconhecida";
    const nivelTotal = (character as any).nivelTotal || (character as any).nivel || 1;
    const aparencia =
        (character as any).historia?.aparencia ||
        (character as any).notas ||
        "Um aventureiro de Arton";

    const pv = character.recursos?.pv || { atual: 0, maximo: 12 };
    const pvPercentual = Math.round((pv.atual / pv.maximo) * 10);
    const pvBarraVisual = "▓".repeat(pvPercentual) + "░".repeat(10 - pvPercentual);

    return new EmbedBuilder()
        .setColor("#D946EF" as any)
        .setTitle(`🧿 ${character.nome} — A Sombra Escaroluz`)
        .setThumbnail("https://cdn.discordapp.com/emojis/1234567890.png") // Placeholder para símbolo
        .setDescription(
            `**${character.raca}** • ${classesText} • Nível **${nivelTotal}**\n\n` +
                `*${aparencia}*`
        )
        .addFields(
            {
                name: `💠 ATRIBUTOS`,
                value: "Valores que importam em Tormenta 20",
                inline: false,
            },
            {
                name: "FOR",
                value: formatarAtributo(mods.FOR),
                inline: true,
            },
            {
                name: "DES",
                value: formatarAtributo(mods.DES),
                inline: true,
            },
            {
                name: "CON",
                value: formatarAtributo(mods.CON),
                inline: true,
            },
            {
                name: "INT",
                value: formatarAtributo(mods.INT),
                inline: true,
            },
            {
                name: "SAB",
                value: formatarAtributo(mods.SAB),
                inline: true,
            },
            {
                name: "CAR",
                value: formatarAtributo(mods.CAR),
                inline: true,
            },
            {
                name: `❤️ VITALIDADE`,
                value: `\`${pv.atual}/${pv.maximo}\` PV  ${pvBarraVisual}`,
                inline: false,
            },
            {
                name: `✨ MANA`,
                value: `\`${pm.atual}/${pm.maximo}\` PM  ${barraVisual}`,
                inline: false,
            },
            {
                name: `⚔️ COMBATE`,
                value: `Defesa \`${character.recursos?.defesa ?? 10}\` | Desl. \`${
                    character.recursos?.deslocamento ?? 9
                }m\``,
                inline: false,
            }
        )
        .setFooter({
            text: `🧿 Use o menu para navegar | Aba 1/7`,
        })
        .setTimestamp();
}

/**
 * ABA 2: ⚔️ Combate - Status de batalha e resistências (Tema: A Sombra Escaroluz)
 */
export function criarEmbedCombateFicha(character: Character): EmbedBuilder {
    // Verificação defensiva para dados antigos
    const classes = Array.isArray((character as any).classes) ? (character as any).classes : [];
    const classesText =
        classes.length > 0
            ? classes.map((c: any) => `${c.nome} ${c.nivel}`).join(" / ")
            : (character as any).classe || "Classe desconhecida";

    const pv = (character as any).recursos?.pv || { atual: 0, maximo: 12, temporario: 0 };
    const pm = (character as any).recursos?.pm || { atual: 0, maximo: 10 };
    const defesa = (character as any).recursos?.defesa ?? 10;
    const resistencias = (character as any).recursos?.resistencias || {
        fortitude: 0,
        reflexos: 0,
        vontade: 0,
    };

    const pvPercentual = Math.round((pv.atual / pv.maximo) * 10);
    const pvBarraVisual = "▓".repeat(pvPercentual) + "░".repeat(10 - pvPercentual);
    const pmPercentual = Math.round((pm.atual / pm.maximo) * 10);
    const pmBarraVisual = "▓".repeat(pmPercentual) + "░".repeat(10 - pmPercentual);

    return new EmbedBuilder()
        .setColor("#E91E63" as any)
        .setTitle(`⚔️ ${character.nome} — Combate`)
        .setDescription(`**${character.raca}** • ${classesText}`)
        .addFields(
            {
                name: `❤️ VITALIDADE`,
                value: `\`${pv.atual}/${pv.maximo}\` PV${
                    pv.temporario > 0 ? ` (+${pv.temporario} temp.)` : ""
                }\n${pvBarraVisual}`,
                inline: false,
            },
            {
                name: `✨ MANA`,
                value: `\`${pm.atual}/${pm.maximo}\` PM\n${pmBarraVisual}`,
                inline: false,
            },
            {
                name: `🛡️ DEFESA`,
                value: `\`${defesa}\``,
                inline: true,
            },
            {
                name: `👣 DESLOCAMENTO`,
                value: `\`${character.recursos?.deslocamento ?? 9}m\``,
                inline: true,
            },
            {
                name: `🧿 RESISTÊNCIAS`,
                value: `**Fort.** \`${formatarModificador(
                    resistencias.fortitude
                )}\` | **Refl.** \`${formatarModificador(
                    resistencias.reflexos
                )}\` | **Von.** \`${formatarModificador(resistencias.vontade)}\``,
                inline: false,
            }
        )
        .setFooter({
            text: `⚔️ Use o menu para navegar | Aba 2/7`,
        })
        .setTimestamp();
}

/**
 * ABA 3: 🎯 Perícias - Habilidades treinadas (Tema: A Sombra Escaroluz)
 */
export function criarEmbedPericiasFicha(character: Character): EmbedBuilder {
    const pericias = character.pericias || {};
    const periciasEntries = Object.entries(pericias).filter(
        ([, v]) => typeof v === "number" && v !== 0
    );

    let periciasText = "";
    if (periciasEntries.length === 0) {
        periciasText =
            "*Nenhuma perícia treinada*\n\nUse `/pericia treinar` para adicionar perícias.";
    } else {
        periciasText = periciasEntries
            .sort(([, a], [, b]) => (typeof b === "number" && typeof a === "number" ? b - a : 0))
            .map(
                ([nome, bonus]) =>
                    `🔍 **${nome}** — \`${formatarModificador(
                        typeof bonus === "number" ? bonus : 0
                    )}\``
            )
            .join("\n");
    }

    return new EmbedBuilder()
        .setColor("#9C27B0" as any)
        .setTitle(`🎯 ${character.nome} — Perícias`)
        .setDescription(periciasText)
        .addFields({
            name: "📚 Conhecimento Arcano",
            value: "Perícias que seu personagem domina.",
            inline: false,
        })
        .setFooter({
            text: `🎯 Use o menu para navegar | Aba 3/7 • ${periciasEntries.length} perícia(s)`,
        })
        .setTimestamp();
}

/**
 * ABA 4: ✨ Poderes - Habilidades especiais (Tema: A Sombra Escaroluz)
 */
export function criarEmbedPoderesFicha(character: Character): EmbedBuilder {
    const poderes = character.poderes || [];
    let poderesText = "";
    if (poderes.length === 0) {
        poderesText =
            "*Nenhum poder adquirido*\n\nPoderes são habilidades especiais que seu personagem aprende ao subir de nível.";
    } else {
        poderesText = poderes.map((poder, i) => `${i + 1}. ✨ **${poder}**`).join("\n");
    }

    return new EmbedBuilder()
        .setColor("#BA68C8" as any)
        .setTitle(`✨ ${character.nome} — Poderes`)
        .setDescription(poderesText)
        .addFields({
            name: "🔮 Manifestações Arcanas",
            value: "Habilidades especiais da sua classe e raça.",
            inline: false,
        })
        .setFooter({
            text: `✨ Use o menu para navegar | Aba 4/7 • ${poderes.length} poder(es)`,
        })
        .setTimestamp();
}

/**
 * ABA 5: 📖 Magias - Grimório do personagem (Tema: A Sombra Escaroluz)
 */
export function criarEmbedMagiasFicha(character: Character): EmbedBuilder {
    const magias = character.magias || [];
    let magiasText = "";
    if (magias.length === 0) {
        magiasText =
            "*Nenhuma magia conhecida*\n\nMagias são feitiços que você pode conjurar gastando PM.";
    } else {
        magiasText = magias
            .sort((a, b) => a.circulo - b.circulo)
            .map(
                (magia, i) =>
                    `${i + 1}. 🔮 **${magia.nome}** (Círculo ${magia.circulo}) — \`${
                        magia.custoPM
                    } PM\``
            )
            .join("\n");
    }

    const pm = character.recursos?.pm || { atual: 0, maximo: 10 };
    const pmPercentual = Math.round((pm.atual / pm.maximo) * 10);
    const pmBarraVisual = "▓".repeat(pmPercentual) + "░".repeat(10 - pmPercentual);

    return new EmbedBuilder()
        .setColor("#7B1FA2" as any)
        .setTitle(`📖 ${character.nome} — Grimório`)
        .setDescription(magiasText)
        .addFields({
            name: "✨ Fluxo Arcano",
            value: `\`${pm.atual}/${pm.maximo}\` PM  ${pmBarraVisual}`,
            inline: false,
        })
        .setFooter({
            text: `📖 Use o menu para navegar | Aba 5/7 • ${magias.length} magia(s)`,
        })
        .setTimestamp();
}

/**
 * ABA 6: 🎒 Inventário - Itens do personagem (Tema: A Sombra Escaroluz)
 */
export function criarEmbedInventarioFicha(character: Character): EmbedBuilder {
    const inventario = character.inventario || [];
    let inventarioText = "";
    if (inventario.length === 0) {
        inventarioText = "*Bolsa vazia*\n\nVocê não carrega itens no momento.";
    } else {
        inventarioText = inventario
            .map((item: any) => {
                const raridadeEmoji =
                    item.raridade === "Lendário"
                        ? "🌠"
                        : item.raridade === "Raro"
                        ? "💎"
                        : item.raridade === "Incomum"
                        ? "✨"
                        : "⭕";
                return `${raridadeEmoji} **${item.nome}** ×${item.quantidade}\n*${
                    item.descricao || "—"
                }*`;
            })
            .join("\n\n");
    }

    return new EmbedBuilder()
        .setColor("#6A1B9A" as any)
        .setTitle(`🎒 ${character.nome} — Inventário`)
        .setDescription(inventarioText)
        .addFields({
            name: "📦 Carga",
            value: `${inventario.length} item(ns) carregado(s)`,
            inline: false,
        })
        .setFooter({
            text: `🎒 Use o menu para navegar | Aba 6/7`,
        })
        .setTimestamp();
}

/**
 * ABA 7: 📝 História - Narrativa do personagem (Tema: A Sombra Escaroluz)
 */
export function criarEmbedNotasFicha(character: Character): EmbedBuilder {
    const historia = character.historia;
    const anotacoes =
        historia.anotacoes ||
        "*Sem anotações registradas*\n\nUse `/ficha editar` para adicionar sua história.";

    const dataCriacao = new Date(character.criadoEm).toLocaleDateString("pt-BR");
    const dataAtualizacao = new Date(character.atualizadoEm).toLocaleDateString("pt-BR");

    return new EmbedBuilder()
        .setColor("#8B008B" as any)
        .setTitle(`📝 ${character.nome} — História`)
        .setDescription(anotacoes)
        .addFields({
            name: "📅 Cronologia",
            value: `Criada: \`${dataCriacao}\`\nÚltima edição: \`${dataAtualizacao}\``,
            inline: false,
        })
        .setFooter({
            text: `📝 Use o menu para navegar | Aba 7/7`,
        })
        .setTimestamp();
}

/**
 * Mantém compatibilidade - usa a aba Geral por padrão
 */
export function criarEmbedFichaPrincipal(character: Character): EmbedBuilder {
    return criarEmbedGeralFicha(character);
}

/**
 * Cria embed de inventário
 */
export function criarEmbedInventario(character: Character): EmbedBuilder {
    const inventarioText =
        character.inventario.length === 0
            ? "Inventário vazio"
            : character.inventario
                  .map((item: any) => `${EMOJIS.PLUS} **${item.nome}** (x${item.quantidade})`)
                  .join("\n");

    return new EmbedBuilder()
        .setColor(COLORS.GRAY as any)
        .setTitle(`${EMOJIS.SCROLL} ${character.nome} - Inventário`)
        .setDescription(inventarioText)
        .setFooter({ text: "Use /inventário para gerenciar" })
        .setTimestamp();
}

/**
 * Cria embed de perícias
 */
export function criarEmbedPericias(character: Character): EmbedBuilder {
    const periciasText = Object.entries(character.pericias)
        .map(([nome, bonus]) => `${EMOJIS.PLUS} **${nome}**: \`${formatarModificador(bonus)}\``)
        .join("\n");

    return new EmbedBuilder()
        .setColor(COLORS.GRAY as any)
        .setTitle(`${EMOJIS.BOOK} ${character.nome} - Perícias`)
        .setDescription(periciasText || "Nenhuma perícia registrada")
        .setFooter({ text: "Use /pericia para adicionar" })
        .setTimestamp();
}

/**
 * Cria embed de resumo da ficha (compactada) - Tema: A Sombra Escaroluz
 */
export function criarEmbedResumoFicha(character: Character): EmbedBuilder {
    const classes = Array.isArray((character as any).classes) ? (character as any).classes : [];
    const classesText =
        classes.length > 0
            ? classes.map((c: any) => `${c.nome} ${c.nivel}`).join(" / ")
            : (character as any).classe || "Classe desconhecida";

    const pv = (character as any).recursos?.pv || { atual: 0, maximo: 12 };
    const pm = (character as any).recursos?.pm || { atual: 0, maximo: 10 };
    const defesa = (character as any).recursos?.defesa ?? 10;

    return new EmbedBuilder()
        .setColor("#D946EF" as any)
        .setTitle(`🧿 ${character.nome}`)
        .addFields(
            {
                name: "Raça • Classe",
                value: `${character.raca} • ${classesText}`,
                inline: false,
            },
            {
                name: `❤️ Vida / ✨ Mana`,
                value: `\`${pv.atual}/${pv.maximo}\` PV / \`${pm.atual}/${pm.maximo}\` PM`,
                inline: true,
            },
            {
                name: `🛡️ Defesa`,
                value: `\`${defesa}\``,
                inline: true,
            }
        )
        .setFooter({ text: "Use /ficha ver para detalhes completos" })
        .setTimestamp();
}

/**
 * ABA 8: 💔 Status - Condições e efeitos de combate (Tema: A Sombra Escaroluz)
 */
export function criarEmbedStatusFicha(character: Character): EmbedBuilder {
    const status = (character as any).status || [];
    let statusText = "";

    if (status.length === 0) {
        statusText = "*Sem condições ativas*\n\nVocê está em perfeita condição de combate.";
    } else {
        statusText = status
            .map(
                (s: any) =>
                    `🔴 **${s.nome}** (${s.duracao} turnos)\n*${s.descricao}*\nEfeito: ${s.efeito}`
            )
            .join("\n\n");
    }

    return new EmbedBuilder()
        .setColor("#FF1744" as any)
        .setTitle(`💔 ${character.nome} — Status`)
        .setDescription(statusText)
        .addFields({
            name: "🛡️ Proteções Ativas",
            value: status.length > 0 ? "Verifique cada status acima" : "Nenhuma proteção em vigor",
            inline: false,
        })
        .setFooter({
            text: `💔 Use o menu para navegar | Aba 8/10 • ${status.length} condição(ões)`,
        })
        .setTimestamp();
}

/**
 * ABA 9: 📊 Ressonância - Progresso de nível (Tema: A Sombra Escaroluz)
 */
export function criarEmbedXPFicha(character: Character): EmbedBuilder {
    const xp = (character as any).experiencia || { atual: 0, proximo: 1000, total: 0 };
    const nivelTotal = (character as any).nivelTotal || 1;
    const xpPercentual = Math.round((xp.atual / xp.proximo) * 10);
    const xpBarraVisual = "▓".repeat(xpPercentual) + "░".repeat(10 - xpPercentual);

    // Calcula XP necessária para próximos níveis
    const xpProximoNivel = xp.proximo - xp.atual;
    const proximoNivel = nivelTotal + 1;

    return new EmbedBuilder()
        .setColor("#BA68C8" as any)
        .setTitle(`📊 ${character.nome} — Experiência`)
        .setDescription(`Nível atual: **${nivelTotal}**\nPróximo nível: **${proximoNivel}**`)
        .addFields(
            {
                name: `✨ PROGRESSO`,
                value: `\`${xp.atual}/${xp.proximo}\` XP\n${xpBarraVisual}\n**${xpProximoNivel}** XP até o próximo nível`,
                inline: false,
            },
            {
                name: `📈 TOTAL ACUMULADO`,
                value: `\`${xp.total}\` XP`,
                inline: true,
            },
            {
                name: `⚡ TAXA DE PROGRESSO`,
                value: `${xpPercentual * 10}% do próximo nível`,
                inline: true,
            }
        )
        .setFooter({
            text: `📊 Use o menu para navegar | Aba 9/10`,
        })
        .setTimestamp();
}

/**
 * ABA 10: ⚡ Reações - Habilidades reagentes (Tema: A Sombra Escaroluz)
 */
export function criarEmbedReacoesFicha(character: Character): EmbedBuilder {
    const reacoes = (character as any).reacoes || [];

    let reacoesText = "";
    if (reacoes.length === 0) {
        reacoesText =
            "*Nenhuma reação disponível*\n\nReações são habilidades que você pode usar para responder a eventos de combate.";
    } else {
        reacoesText = reacoes
            .map(
                (r: any) =>
                    `⚡ **${r.nome}** (${r.frequencia})\n*${r.descricao}*\nAcionador: ${
                        r.acionador
                    }\nUsos: ${r.usosRestantes}/${r.frequencia === "ilimitada" ? "∞" : "1"}`
            )
            .join("\n\n");
    }

    return new EmbedBuilder()
        .setColor("#00BCD4" as any)
        .setTitle(`⚡ ${character.nome} — Reações`)
        .setDescription(reacoesText)
        .addFields({
            name: "🎯 Habilidades Reagentes",
            value: "Use estas habilidades para responder a ataques e eventos no combate",
            inline: false,
        })
        .setFooter({
            text: `⚡ Use o menu para navegar | Aba 10/10 • ${reacoes.length} reação(ões)`,
        })
        .setTimestamp();
}

/**
 * Cria embed de confirmação de ação
 */
export function criarEmbedConfirmacao(
    titulo: string,
    descricao: string,
    sucesso: boolean = true
): EmbedBuilder {
    return new EmbedBuilder()
        .setColor((sucesso ? COLORS.SUCCESS : COLORS.ACCENT) as any)
        .setTitle(`${sucesso ? EMOJIS.SUCCESS : EMOJIS.ERROR} ${titulo}`)
        .setDescription(descricao)
        .setTimestamp();
}

/**
 * Cria embed de erro
 */
export function criarEmbedErro(titulo: string, mensagem: string): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(COLORS.ACCENT as any)
        .setTitle(`${EMOJIS.ERROR} ${titulo}`)
        .setDescription(mensagem)
        .setTimestamp();
}
