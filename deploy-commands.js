
import "dotenv/config";
import { REST, Routes } from "discord.js";
import { ENV } from "./build/env/index.js";
import { Constatic } from "./build/discord/base/app.js";

async function deployCommands() {
    const rest = new REST({ version: "10" }).setToken(ENV.DISCORD_TOKEN);
    const app = Constatic.getInstance();
    const commands = app.commands.build();

    try {
        console.log("Iniciando deploy dos comandos...");
        await rest.put(
            Routes.applicationGuildCommands(ENV.CLIENT_ID, ENV.GUILD_ID),
            { body: commands }
        );
        console.log(`Comandos registrados na guild ${ENV.GUILD_ID}!`);
    } catch (error) {
        console.error("Erro ao registrar comandos:", error);
    }
}

deployCommands();
