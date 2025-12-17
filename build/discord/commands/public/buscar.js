import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";
import { readFileSync } from "fs";
import { join } from "path";
createCommand({
    name: "buscar",
    description: "Buscar no Acervo do Golem",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "termo",
            description: "Termo a buscar (nome ou descrição)",
            required: true,
            autocomplete: async (interaction) => {
                const focused = interaction.options.getFocused(true).value.toString().toLowerCase();
                try {
                    const acervoPath = join(process.cwd(), "data", "compendium", "acervo-do-golem.json");
                    const acervo = JSON.parse(readFileSync(acervoPath, "utf-8"));
                    const nomes = [];
                    const pushNomes = (arr) => arr?.forEach?.((x) => x?.nome && nomes.push(String(x.nome)));
                    pushNomes(acervo.origens || []);
                    pushNomes(acervo.racas || []);
                    pushNomes(acervo.classes || []);
                    pushNomes(acervo.classes_alternativas || []);
                    pushNomes(acervo.deuses_maiores || []);
                    pushNomes(acervo.deuses_menores || []);
                    pushNomes(acervo.deuses_servidores || []);
                    pushNomes(acervo.distincoes || []);
                    pushNomes(acervo.bases || []);
                    pushNomes(acervo.dominios || []);
                    if (acervo.poderes_gerais) {
                        ["racial", "combate", "destino", "magia", "tormenta", "concedido"].forEach((cat) => pushNomes(acervo.poderes_gerais[cat] || []));
                    }
                    if (acervo.itens) {
                        ["mundanos", "consumiveis", "magicos", "aprimorados"].forEach((cat) => pushNomes(acervo.itens[cat] || []));
                    }
                    const uniq = Array.from(new Set(nomes));
                    const choices = uniq
                        .filter((n) => (focused ? n.toLowerCase().includes(focused) : true))
                        .slice(0, 25)
                        .map((n) => ({ name: n, value: n }));
                    return choices;
                }
                catch {
                    return [];
                }
            },
        },
    ],
    async run(interaction) {
        await interaction.deferReply({ ephemeral: false });
        const termo = interaction.options.getString("termo", true).toLowerCase();
        try {
            const acervoPath = join(process.cwd(), "data", "compendium", "acervo-do-golem.json");
            const acervo = JSON.parse(readFileSync(acervoPath, "utf-8"));
            const resultados = [];
            // Buscar em todas as categorias
            const categorias = [
                { nome: "Origens", items: acervo.origens || [], emoji: "📜" },
                { nome: "Raças", items: acervo.racas || [], emoji: "🧬" },
                { nome: "Classes", items: acervo.classes || [], emoji: "⚔️" },
                {
                    nome: "Classes Alternativas",
                    items: acervo.classes_alternativas || [],
                    emoji: "🎭",
                },
                { nome: "Deuses Maiores", items: acervo.deuses_maiores || [], emoji: "🔱" },
                { nome: "Deuses Menores", items: acervo.deuses_menores || [], emoji: "🕯️" },
                { nome: "Deuses Servidores", items: acervo.deuses_servidores || [], emoji: "⚡" },
                { nome: "Distinções", items: acervo.distincoes || [], emoji: "🎖️" },
                { nome: "Bases", items: acervo.bases || [], emoji: "🏛️" },
                { nome: "Domínios", items: acervo.dominios || [], emoji: "🌟" },
            ];
            // Buscar em poderes (todas subcategorias)
            if (acervo.poderes_gerais) {
                ["racial", "combate", "destino", "magia", "tormenta", "concedido"].forEach((cat) => {
                    if (acervo.poderes_gerais[cat]) {
                        categorias.push({
                            nome: `Poderes (${cat})`,
                            items: acervo.poderes_gerais[cat],
                            emoji: "✨",
                        });
                    }
                });
            }
            // Buscar em itens
            if (acervo.itens) {
                ["mundanos", "consumiveis", "magicos", "aprimorados"].forEach((cat) => {
                    if (acervo.itens[cat]) {
                        categorias.push({
                            nome: `Itens (${cat})`,
                            items: acervo.itens[cat],
                            emoji: "📦",
                        });
                    }
                });
            }
            categorias.forEach((categoria) => {
                categoria.items.forEach((item) => {
                    const nomeMatch = item.nome?.toLowerCase().includes(termo);
                    const descMatch = item.descricao?.toLowerCase().includes(termo);
                    if (nomeMatch || descMatch) {
                        resultados.push({
                            ...item,
                            categoria: categoria.nome,
                            emoji: categoria.emoji,
                        });
                    }
                });
            });
            if (resultados.length === 0) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF006E")
                            .setTitle("🔍 Nenhum Resultado")
                            .setDescription(`Nenhum item encontrado para **"${termo}"**.\n\nTente termos mais gerais ou use \`/compendium\` para explorar.`),
                    ],
                });
                return;
            }
            const MAX_RESULTS = 10;
            const limitados = resultados.slice(0, MAX_RESULTS);
            const fields = limitados.map((r) => ({
                name: `${r.emoji} ${r.nome} (${r.categoria})`,
                value: r.descricao ? r.descricao.substring(0, 100) + "..." : "Sem descrição",
                inline: false,
            }));
            const embed = new EmbedBuilder()
                .setColor("#8B00FF")
                .setTitle(`🔍 Resultados: "${termo}"`)
                .setDescription(`Encontrados **${resultados.length}** item(s). Exibindo os primeiros ${limitados.length}.`)
                .addFields(fields)
                .setFooter({ text: "C.A.R.L.A // Busca no Acervo do Golem" })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            console.error("Erro buscar acervo:", err);
            await interaction.editReply({ content: "❌ Erro ao buscar no acervo." });
        }
    },
});
