import { ChannelType, Guild, TextChannel } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { compendiumManager } from "./compendiumManagerService.js";
import {
    getAllClassesExtended,
    getAllRacesExtended,
    getAvailableCategories,
} from "./compendiumService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type SyncState = {
    guildId: string;
    channelIds: Record<string, string>;
    messageIndex: Record<string, string>; // key: categoria:name -> messageId
    lastContent?: Record<string, string>; // key -> last content string
};

const syncStates = new Map<string, SyncState>();

function key(categoria: string, name: string) {
    return `${categoria}:${name.toLowerCase()}`;
}

function getPersistPath(guildId: string) {
    const projectRoot = path.resolve(__dirname, "../..");
    const stateDir = path.join(projectRoot, "data/acervo-sync");
    if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });
    return path.join(stateDir, `${guildId}.json`);
}

function loadPersistedState(guildId: string): SyncState | undefined {
    try {
        const file = getPersistPath(guildId);
        if (fs.existsSync(file)) {
            const data = JSON.parse(fs.readFileSync(file, "utf-8"));
            return data as SyncState;
        }
    } catch (err) {
        console.warn("[AcervoSync] Falha ao carregar estado persistido:", err);
    }
    return undefined;
}

function savePersistedState(state: SyncState) {
    try {
        const file = getPersistPath(state.guildId);
        fs.writeFileSync(file, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
        console.warn("[AcervoSync] Falha ao salvar estado persistido:", err);
    }
}

export async function ensureChannels(guild: Guild, baseName = "acervo") {
    const categoryName = "📚 acervo";
    const desiredCategories = getAvailableCategories();

    // Encontrar ou criar categoria principal
    const existingCategory = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildCategory && c.name === categoryName
    );
    const category =
        existingCategory ||
        (await guild.channels.create({ name: categoryName, type: ChannelType.GuildCategory }));

    const channelIds: Record<string, string> = {};
    const createdChannels: string[] = [];
    const updatedChannels: string[] = [];

    // Processar categorias desejadas
    for (const catName of desiredCategories) {
        const channelName = `${baseName}-${catName}`;
        const found = guild.channels.cache.find(
            (c) => c.type === ChannelType.GuildText && c.name === channelName
        ) as TextChannel | undefined;

        if (found) {
            // Atualizar se necessário (verificar parent)
            if (found.parentId !== category.id) {
                await found.setParent(category.id);
                updatedChannels.push(channelName);
            }
            channelIds[catName] = found.id;
        } else {
            // Criar novo canal
            const created = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
            });
            channelIds[catName] = created.id;
            createdChannels.push(channelName);
        }
    }

    // Remover canais que não estão mais nas categorias desejadas
    const textChannelsInCategory = guild.channels.cache.filter(
        (c) =>
            c.type === ChannelType.GuildText &&
            c.parentId === category.id &&
            c.name.startsWith(`${baseName}-`)
    ) as any;

    const deletedChannels: string[] = [];
    for (const [, channel] of textChannelsInCategory) {
        const channelBaseName = channel.name.replace(`${baseName}-`, "");
        if (!desiredCategories.includes(channelBaseName)) {
            await channel.delete().catch(() => {});
            deletedChannels.push(channel.name);
        }
    }

    return {
        categoryId: category.id,
        channelIds,
        createdChannels,
        updatedChannels,
        deletedChannels,
    };
}

export async function syncAcervo(
    guild: Guild,
    opts?: { delayMs?: number; mode?: "full" | "incremental" }
) {
    const { channelIds } = await ensureChannels(guild);
    const categories = getAvailableCategories();

    const persisted = loadPersistedState(guild.id);
    const state: SyncState = syncStates.get(guild.id) ||
        persisted || {
            guildId: guild.id,
            channelIds,
            messageIndex: {},
            lastContent: {},
        };

    // Mapear functions de getter por categoria
    const getterMap: Record<string, () => any[]> = {
        racas: getAllRacesExtended,
        classes: getAllClassesExtended,
    };

    const delayMs = opts?.delayMs ?? 300;
    const incremental = (opts?.mode ?? "full") === "incremental";

    const publish = async (categoria: string, channel: TextChannel, items: any[]) => {
        for (const entry of items) {
            const name = (entry?.nome || entry?.name || "").toString();
            if (!name) continue;
            const k = key(categoria, name);
            const existingId = state.messageIndex[k];
            const content = `**${categoria.toUpperCase()}** • ${name}`;
            // Se incremental e conteúdo não mudou, pular
            if (incremental && state.lastContent && state.lastContent[k] === content) {
                continue;
            }
            if (existingId) {
                try {
                    const msg = await channel.messages.fetch(existingId);
                    await msg.edit({ content });
                    state.lastContent![k] = content;
                } catch {
                    const m = await channel.send({ content });
                    state.messageIndex[k] = m.id;
                    state.lastContent![k] = content;
                }
            } else {
                const m = await channel.send({ content });
                state.messageIndex[k] = m.id;
                state.lastContent![k] = content;
            }
            await new Promise((r) => setTimeout(r, delayMs));
        }
    };

    // Sincronizar categorias com dados disponíveis
    for (const categoria of categories) {
        const channelId = channelIds[categoria];
        if (!channelId) continue;

        const channel = guild.channels.cache.get(channelId) as TextChannel;
        if (!channel) continue;

        // Usar getter específico se disponível; senão, carregar via CompendiumManager
        const getter = getterMap[categoria];
        const items = getter ? getter() : compendiumManager.loadCategory(categoria);
        if (Array.isArray(items) && items.length > 0) {
            await publish(categoria, channel, items);
        }
    }

    syncStates.set(guild.id, state);
    savePersistedState(state);
}

export function getSyncState(guildId: string) {
    return syncStates.get(guildId);
}
