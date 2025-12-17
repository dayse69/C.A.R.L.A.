import { getCollections } from "./index.js";
export const CampaignRepository = {
    async create(campaign) {
        const collections = getCollections();
        const now = new Date();
        campaign.criadoEm = now;
        campaign.atualizadoEm = now;
        campaign.ativo = true;
        const res = await collections.campaigns.insertOne(campaign);
        campaign._id = res.insertedId.toString();
        return campaign;
    },
    async findByMasterAndName(mestreId, nome) {
        const collections = getCollections();
        const doc = await collections.campaigns.findOne({ mestre: mestreId, nome, ativo: true });
        return doc;
    },
    async findByMaster(mestreId) {
        const collections = getCollections();
        const result = await collections.campaigns.find({ mestre: mestreId, ativo: true });
        const items = (await result.toArray());
        // Ordenação em memória para compatibilidade com LocalDB
        items.sort((a, b) => {
            const da = new Date(a.atualizadoEm || a.criadoEm || 0).getTime();
            const db = new Date(b.atualizadoEm || b.criadoEm || 0).getTime();
            return db - da;
        });
        return items;
    },
    async findById(id) {
        const collections = getCollections();
        const doc = await collections.campaigns.findOne({ _id: id, ativo: true });
        return doc;
    },
    async update(id, updates) {
        const collections = getCollections();
        await collections.campaigns.updateOne({ _id: id, ativo: true }, {
            $set: { ...updates, atualizadoEm: new Date() },
        });
        return collections.campaigns.findOne({ _id: id, ativo: true });
    },
    async delete(id) {
        const collections = getCollections();
        const result = await collections.campaigns.updateOne({ _id: id }, {
            $set: { ativo: false, deletadoEm: new Date(), atualizadoEm: new Date() },
        });
        return result.modifiedCount > 0;
    },
};
