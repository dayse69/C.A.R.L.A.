/**
 * Character Repository
 * Padrão Repository para operações com personagens
 */

import { Character } from "../services/fichaService.js";
import { getCollections, saveToBothDatabases } from "./index.js";

export class CharacterRepository {
    /**
     * Criar um novo personagem
     */
    static async create(character: Character): Promise<string> {
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
    static async findById(id: string): Promise<Character | null> {
        const collections = getCollections();
        return (await collections.characters.findOne({ _id: id, ativo: true } as any)) as any;
    }

    /**
     * Encontrar personagem por nome e usuário
     */
    static async findByUserAndName(userId: string, nome: string): Promise<Character | null> {
        const collections = getCollections();
        return (await collections.characters.findOne({
            userId,
            nome,
            ativo: true,
        })) as any;
    }

    /**
     * Listar todos os personagens de um usuário
     */
    static async findByUser(userId: string): Promise<Character[]> {
        const collections = getCollections();
        const cursor = await collections.characters.find({ userId, ativo: true } as any);
        const docs = (await cursor.toArray()) as any[];
        docs.sort((a, b) => {
            const da = new Date(a.atualizadoEm || a.criadoEm || 0).getTime();
            const db = new Date(b.atualizadoEm || b.criadoEm || 0).getTime();
            return db - da;
        });
        return docs as any;
    }

    /**
     * Atualizar personagem
     */
    static async update(id: string, updates: Partial<Character>): Promise<Character | null> {
        const updateData = { ...updates, atualizadoEm: new Date() };

        // Atualiza em ambos os bancos
        await saveToBothDatabases(
            "characters",
            "updateOne",
            { _id: id, ativo: true },
            { $set: updateData }
        );

        const collections = getCollections();
        return (await collections.characters.findOne({ _id: id } as any)) as any;
    }

    /**
     * Deletar personagem
     */
    static async delete(id: string): Promise<boolean> {
        const updateData = { ativo: false, deletadoEm: new Date(), atualizadoEm: new Date() };

        // Deleta (soft delete) em ambos os bancos
        await saveToBothDatabases("characters", "updateOne", { _id: id }, { $set: updateData });
        return true;
    }

    /**
     * Incrementar nível
     */
    static async incrementLevel(id: string): Promise<Character | null> {
        const character = await this.findById(id);
        if (!character) return null;

        const novoNivel = Math.min(character.nivelTotal + 1, 20);
        return await this.update(id, { nivelTotal: novoNivel });
    }

    /**
     * Adicionar ressonância
     */
    static async addRessonancia(_id: string, _ressonancia: number): Promise<Character | null> {
        // Esta função pode ser implementada se necessário
        return null;
    }

    /**
     * Adicionar ouro
     */
    static async addGold(_id: string, _ouro: number): Promise<Character | null> {
        // Esta função pode ser implementada se necessário
        return null;
    }

    /**
     * Atualizar vida
     */
    static async updateHealth(id: string, pvAtual: number): Promise<Character | null> {
        const character = await this.findById(id);
        if (!character) return null;

        const pvLimitado = Math.max(0, Math.min(pvAtual, character.recursos.pv.maximo));
        return await this.update(id, {
            recursos: {
                ...character.recursos,
                pv: { ...character.recursos.pv, atual: pvLimitado },
            },
        } as any);
    }

    /**
     * Adicionar item ao inventário
     */
    static async addItemToInventory(
        id: string,
        item: {
            id: string;
            nome: string;
            quantidade: number;
            raridade: string;
            peso: number;
            descricao: string;
        }
    ): Promise<Character | null> {
        const collections = getCollections();
        await collections.characters.updateOne({ _id: id, ativo: true } as any, {
            $push: { inventario: item } as any,
            $set: { atualizadoEm: new Date() },
        });
        return (await collections.characters.findOne({ _id: id } as any)) as any;
    }

    /**
     * Remover item do inventário
     */
    static async removeItemFromInventory(
        characterId: string,
        itemId: string
    ): Promise<Character | null> {
        const collections = getCollections();
        await collections.characters.updateOne({ _id: characterId, ativo: true } as any, {
            $pull: { inventario: { id: itemId } } as any,
            $set: { atualizadoEm: new Date() },
        });
        return (await collections.characters.findOne({ _id: characterId } as any)) as any;
    }

    /**
     * Contar personagens de um usuário
     */
    static async countByUser(userId: string): Promise<number> {
        return await getCollections().characters.countDocuments({ userId, ativo: true } as any);
    }
}
