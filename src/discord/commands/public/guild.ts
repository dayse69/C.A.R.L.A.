import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "guild",
    description: "guild command",
    type: ApplicationCommandType.ChatInput,
    async run(){
        
    }
});