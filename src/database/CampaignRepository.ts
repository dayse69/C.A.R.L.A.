import { getCollections } from "./index.js";
import { Campaign } from "./models.js";

export const CampaignRepository = {
    async create(campaign: Campaign): Promise<Campaign> {
        const collections = getCollections();
        const now = new Date();
        campaign.criadoEm = now;
        campaign.atualizadoEm = now;
        (campaign as any).ativo = true;
        const res = await collections.campaigns.insertOne(campaign as any);
        (campaign as any)._id = res.insertedId.toString();
        return campaign;
    },
    async findByMasterAndName(mestreId: string, nome: string): Promise<Campaign | null> {
        const collections = getCollections();
        const doc = await collections.campaigns.findOne({ mestre: mestreId, nome, ativo: true });
        return doc as Campaign | null;
    },
    async findByMaster(mestreId: string): Promise<Campaign[]> {
        const collections = getCollections();
        const result = await collections.campaigns.find({ mestre: mestreId, ativo: true } as any);
        const items = (await result.toArray()) as Campaign[];
        // Ordenação em memória para compatibilidade com LocalDB
        items.sort((a, b) => {
            const da = new Date((a as any).atualizadoEm || (a as any).criadoEm || 0).getTime();
            const db = new Date((b as any).atualizadoEm || (b as any).criadoEm || 0).getTime();
            return db - da;
        });
        return items;
    },
    async findById(id: string): Promise<Campaign | null> {
        const collections = getCollections();
        const doc = await collections.campaigns.findOne({ _id: id, ativo: true } as any);
        return doc as Campaign | null;
    },
    async update(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
        const collections = getCollections();
        await collections.campaigns.updateOne({ _id: id, ativo: true } as any, {
            $set: { ...updates, atualizadoEm: new Date() },
        });
        return collections.campaigns.findOne({ _id: id, ativo: true } as any);
    },
    async delete(id: string): Promise<boolean> {
        const collections = getCollections();
        const result = await collections.campaigns.updateOne({ _id: id } as any, {
            $set: { ativo: false, deletadoEm: new Date(), atualizadoEm: new Date() },
        });
        return result.modifiedCount > 0;
    },
};
