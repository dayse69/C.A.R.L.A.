import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
createCommand({
    name: "ping",
    description: "Responde com pong",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.reply({
            flags: ["Ephemeral"],
            content: "Pong"
        });
    },
});
