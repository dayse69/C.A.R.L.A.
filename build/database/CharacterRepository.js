/**
 * Character Repository
 * Padrão Repository para operações com personagens
 */
import { getCollections, saveToBothDatabases } from "./index.js";
export class CharacterRepository {
    /**
     * Criar um novo personagem
     */
    static async create(character) {
        const doc = {
            ...character,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
            ultimoUso: new Date(),
            ativo: true,
        };
        // Salva em ambos os bancos simultaneamente
        const id = await saveToBothDatabases("characters", "insertOne", doc);
        return id;
    }
    /**
     * Encontrar personagem por ID
     */
    static async findById(id) {
        const collections = getCollections();
        return (await collections.characters.findOne({ _id: id, ativo: true }));
    }
    /**
     * Encontrar personagem por nome e usuário
     */
    static async findByUserAndName(userId, nome) {
        const collections = getCollections();
        return (await collections.characters.findOne({
            userId,
            nome,
            ativo: true,
        }));
    }
    /**
     * Listar todos os personagens de um usuário
     */
    static async findByUser(userId) {
        const collections = getCollections();
        const cursor = await collections.characters.find({ userId, ativo: true });
        const docs = (await cursor.toArray());
        docs.sort((a, b) => {
            const da = new Date(a.atualizadoEm || a.criadoEm || 0).getTime();
            const db = new Date(b.atualizadoEm || b.criadoEm || 0).getTime();
            return db - da;
        });
        return docs;
    }
    /**
     * Atualizar personagem
     */
    static async update(id, updates) {
        const updateData = { ...updates, atualizadoEm: new Date() };
        // Atualiza em ambos os bancos
        await saveToBothDatabases("characters", "updateOne", { _id: id, ativo: true }, { $set: updateData });
        const collections = getCollections();
        return (await collections.characters.findOne({ _id: id }));
    }
    /**
     * Deletar personagem
     */
    static async delete(id) {
        const updateData = { ativo: false, deletadoEm: new Date(), atualizadoEm: new Date() };
        // Deleta (soft delete) em ambos os bancos
        await saveToBothDatabases("characters", "updateOne", { _id: id }, { $set: updateData });
        return true;
    }
    /**
     * Incrementar nível
     */
    static async incrementLevel(id) {
        const character = await this.findById(id);
        if (!character)
            return null;
        const novoNivel = Math.min(character.nivelTotal + 1, 20);
        return await this.update(id, { nivelTotal: novoNivel });
    }
    /**
     * Adicionar ressonância
     */
    static async addRessonancia(_id, _ressonancia) {
        // Esta função pode ser implementada se necessário
        return null;
    }
    /**
     * Adicionar ouro
     */
    static async addGold(_id, _ouro) {
        // Esta função pode ser implementada se necessário
        return null;
    }
    /**
     * Atualizar vida
     */
    static async updateHealth(id, pvAtual) {
        const character = await this.findById(id);
        if (!character)
            return null;
        const pvLimitado = Math.max(0, Math.min(pvAtual, character.recursos.pv.maximo));
        return await this.update(id, {
            recursos: {
                ...character.recursos,
                pv: { ...character.recursos.pv, atual: pvLimitado },
            },
        });
    }
    /**
     * Adicionar item ao inventário
     */
    static async addItemToInventory(id, item) {
        const collections = getCollections();
        await collections.characters.updateOne({ _id: id, ativo: true }, {
            $push: { inventario: item },
            $set: { atualizadoEm: new Date() },
        });
        return (await collections.characters.findOne({ _id: id }));
    }
    /**
     * Remover item do inventário
     */
    static async removeItemFromInventory(characterId, itemId) {
        const collections = getCollections();
        await collections.characters.updateOne({ _id: characterId, ativo: true }, {
            $pull: { inventario: { id: itemId } },
            $set: { atualizadoEm: new Date() },
        });
        return (await collections.characters.findOne({ _id: characterId }));
    }
    /**
     * Contar personagens de um usuário
     */
    static async countByUser(userId) {
        return await getCollections().characters.countDocuments({ userId, ativo: true });
    }
}
