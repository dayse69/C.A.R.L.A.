import { getCollections } from "./index.js";
export class UserRepository {
    static async findByDiscordId(discordId) {
        const collections = getCollections();
        const doc = await collections.users.findOne({ discordId, ativo: true });
        return doc;
    }
    static async create(data) {
        const collections = getCollections();
        const now = new Date();
        const user = {
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
        const res = await collections.users.insertOne(user);
        user._id = res.insertedId.toString();
        return user;
    }
    static async upsertFromDiscord(data) {
        const existing = await this.findByDiscordId(data.discordId);
        if (existing) {
            return (await this.update(existing._id, {
                username: data.username,
                discriminator: data.discriminator ?? existing.discriminator,
                avatar: data.avatar ?? existing.avatar,
            }));
        }
        return await this.create(data);
    }
    static async update(id, updates) {
        const collections = getCollections();
        await collections.users.updateOne({ _id: id, ativo: true }, {
            $set: { ...updates, atualizadoEm: new Date() },
        });
        return (await collections.users.findOne({ _id: id, ativo: true }));
    }
    static async delete(id) {
        const collections = getCollections();
        const result = await collections.users.updateOne({ _id: id }, {
            $set: { ativo: false, deletadoEm: new Date(), atualizadoEm: new Date() },
        });
        return result.modifiedCount > 0;
    }
    static async countByDiscordId(discordId) {
        const collections = getCollections();
        return await collections.users.countDocuments({ discordId, ativo: true });
    }
}
