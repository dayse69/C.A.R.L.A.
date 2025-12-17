import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
    name: "ajuda",
    description: "Exibe ajuda sobre os comandos do bot",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    async run(interaction) {
        const embed = new EmbedBuilder()
            .setColor("#8B00FF")
            .setTitle("✦ Ajuda da C.A.R.L.A ✦")
            .setDescription(
                "Bem-vindo! Aqui está um resumo dos comandos principais. Use os menus e exemplos para navegar."
            )
            .addFields(
                {
                    name: "📚 Acervo",
                    value:
                        "• `/acervo` — Abre o Acervo do Golem com categorias\n" +
                        "• `/compendium` — Mesmo fluxo do acervo\n" +
                        "• `/buscar termo:` — Busca por nome/descrição (autocomplete)\n",
                },
                {
                    name: "🛠️ Criação",
                    value:
                        "• `/criar nome:<obrigatório>` — Inicia fluxo de criação (ficha, campanha, acervo)\n" +
                        "  Opções: `origem` (opcional), `raca` (autocomplete), `classe` (autocomplete)\n",
                },
                {
                    name: "📜 Fichas",
                    value:
                        "• `/ficha ver [personagem]` — Mostra sua ficha (ou a mais recente)\n" +
                        "• `/ficha editar personagem:<nome>` — Edita histórico e nível (modal)\n" +
                        "• `/ficha listar` — Lista suas fichas (com paginação)\n" +
                        "• `/ficha selecionar personagem:<nome>` — Marca uma ficha como ativa\n",
                },
                {
                    name: "🗺️ Campanhas",
                    value:
                        "• `/campanha listar` — Lista suas campanhas (com paginação)\n" +
                        "• `/campanha ver nome:<campanha>` — Exibe detalhes\n" +
                        "• `/campanha editar nome:<campanha>` — Edita descrição/ambientação (modal)\n",
                },
                {
                    name: "🎲 Rolagens",
                    value:
                        "• `/rolar d20 [descricao]` — Rola um d20 simples\n" +
                        "• `/rolar multiplo quantidade:<n> tipo:<dado>` — Ex.: 3d6\n" +
                        "• `/rolar pericia modificador:<n> [descricao]` — Teste de perícia\n" +
                        "• `/rolar ataque bônus_ataque:<n> [bônus_dano] [dado_dano]` — Ataque\n" +
                        "• `/t20-roll [quantidade] [descricao]` — Teste rápido de d20 (total e média)\n",
                },
                {
                    name: "🔧 Utilitários",
                    value:
                        "• `/ping` — Verifica a responsividade (Pong)\n" +
                        "• `/counter` — Exemplo de UI com botões (contador)\n",
                },
                {
                    name: "🔐 Permissões do Acervo",
                    value: "A criação/edição via modais do Acervo requer Administrador, Gerenciar Servidor, ou cargos/usuários autorizados pela configuração.\n",
                }
            )
            .setFooter({ text: "C.A.R.L.A // Ajuda • Use /buscar para descobrir conteúdo" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
});
