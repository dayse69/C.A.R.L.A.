import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sugestao')
    .setDescription('Envie uma sugestão para o bot ou para o servidor')
    .addStringOption(option =>
      option.setName('texto')
        .setDescription('Sua sugestão')
        .setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    const texto = interaction.options.getString('texto', true);
    const user = interaction.user;
    const timestamp = new Date().toISOString();
    const sugestao = {
      user: user.tag,
      userId: user.id,
      texto,
      timestamp
    };
    const dir = path.resolve(__dirname, '../../../../Sugestoes');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'sugestoes.json');
    let lista: any[] = [];
    if (existsSync(file)) {
      try {
        lista = JSON.parse(require('fs').readFileSync(file, 'utf-8'));
      } catch {}
    }
    lista.push(sugestao);
    writeFileSync(file, JSON.stringify(lista, null, 2), 'utf-8');
    await interaction.reply({ content: 'Sugestão registrada com sucesso! 💡', ephemeral: true });
  }
};
