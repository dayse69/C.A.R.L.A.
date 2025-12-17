import { getCollections } from "./index.js";
import { User } from "./models.js";

export class UserRepository {
    static async findByDiscordId(discordId: string): Promise<User | null> {
        const collections = getCollections();
        const doc = await collections.users.findOne({ discordId, ativo: true } as any);
        return doc as User | null;
    }

    static async create(data: {
        discordId: string;
        username: string;
        discriminator?: string;
        avatar?: string;
    }): Promise<User> {
        const collections = getCollections();
        const now = new Date();
        const user: Partial<User> & { ativo: boolean } = {
            discordId: data.discordId,
            username: data.username,
            discriminator: data.discriminator ?? "0000",
            avatar: data.avatar,
            personagensAtivos: [],
            configuraçoes: { idioma: "pt-BR", notificações: true, tema: "dark" },
            criadoEm: now,
            atualizadoEm: now,
            ativo: true,
        };
        const res = await collections.users.insertOne(user as any);
        (user as any)._id = res.insertedId.toString();
        return user as User;
    }

    static async upsertFromDiscord(data: {
        discordId: string;
        username: string;
        discriminator?: string;
        avatar?: string;
    }): Promise<User> {
        const existing = await this.findByDiscordId(data.discordId);
        if (existing) {
            return (await this.update(existing._id as string, {
                username: data.username,
                discriminator: data.discriminator ?? existing.discriminator,
                avatar: data.avatar ?? existing.avatar,
            })) as User;
        }
        return await this.create(data);
    }

    static async update(id: string, updates: Partial<User>): Promise<User | null> {
        const collections = getCollections();
        await collections.users.updateOne({ _id: id, ativo: true } as any, {
            $set: { ...updates, atualizadoEm: new Date() },
        });
        return (await collections.users.findOne({ _id: id, ativo: true } as any)) as any;
    }

    static async delete(id: string): Promise<boolean> {
        const collections = getCollections();
        const result = await collections.users.updateOne({ _id: id } as any, {
            $set: { ativo: false, deletadoEm: new Date(), atualizadoEm: new Date() },
        });
        return result.modifiedCount > 0;
    }

    static async countByDiscordId(discordId: string): Promise<number> {
        const collections = getCollections();
        return await collections.users.countDocuments({ discordId, ativo: true } as any);
    }
}
