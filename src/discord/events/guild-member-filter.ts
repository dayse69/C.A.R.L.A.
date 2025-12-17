import { createEvent } from "#base";
import type { ClientEvents } from "discord.js";
import { Events, PermissionFlagsBits } from "discord.js";

// Auto-moderação simples: bloqueia links suspeitos e palavrões básicos.
const bannedPatterns = [/discord\.gg\//i, /http:\/\//i, /https:\/\//i];
const bannedWords = [/porra/i, /caralho/i, /merda/i];

createEvent({
    name: Events.MessageCreate,
    event: Events.MessageCreate,
    async run(...[message]: ClientEvents[Events.MessageCreate]) {
        if (!message) return;
        if (!message.inGuild() || message.author.bot) return;
        const me = message.guild?.members.me;
        if (!me?.permissions.has(PermissionFlagsBits.ManageMessages)) return;

        const content = message.content || "";
        if (
            bannedPatterns.some((p) => p.test(content)) ||
            bannedWords.some((w) => w.test(content))
        ) {
            try {
                await message.delete();
                await message.channel.send({
                    content: `⚠️ Mensagem removida por auto-moderação. Evite links externos e linguagem inadequada.`,
                });
            } catch (err) {
                console.warn("[AutoMod] Falha ao remover mensagem:", err);
            }
        }
    },
});
