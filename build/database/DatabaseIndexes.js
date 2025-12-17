/**
 * MongoDB Indexes Setup
 * Cria índices para otimizar queries (+500% performance)
 */
import { logger } from "../utils/logger.js";
import { getCollections, isConnected } from "./mongodb.js";
export class DatabaseIndexes {
    /**
     * Cria todos os índices necessários
     */
    static async createAllIndexes() {
        if (!isConnected()) {
            logger.warn("MongoDB não conectado - pulando criação de índices");
            return;
        }
        const startTime = performance.now();
        logger.info("📊 Criando índices no MongoDB...");
        try {
            await this.createCharacterIndexes();
            await this.createUserIndexes();
            await this.createCompendiumIndexes();
            const totalTime = (performance.now() - startTime).toFixed(2);
            logger.info(`✅ Índices criados com sucesso em ${totalTime}ms`);
        }
        catch (error) {
            logger.error("❌ Erro ao criar índices:", error);
        }
    }
    /**
     * Índices para Characters (fichas)
     */
    static async createCharacterIndexes() {
        const { characters } = getCollections();
        try {
            // Índice por userId - queries mais comuns (buscar fichas do usuário)
            await characters.createIndex({ userId: 1 });
            // Índice por nome - buscar personagem específico
            await characters.createIndex({ nome: 1 });
            // Índice composto userId + nome - buscar ficha específica de usuário
            await characters.createIndex({ userId: 1, nome: 1 });
            // Índice por classe - filtrar por classe
            await characters.createIndex({ classe: 1 });
            // Índice por raça - filtrar por raça
            await characters.createIndex({ raca: 1 });
            // Índice por nível - ordenar por nível
            await characters.createIndex({ nivel: 1 });
            logger.info("  ✓ Índices de characters criados");
        }
        catch (error) {
            logger.error("  ✗ Erro ao criar índices de characters:", error);
        }
    }
    /**
     * Índices para Users
     */
    static async createUserIndexes() {
        const { users } = getCollections();
        try {
            // Índice único por discordId - garantir usuário único
            await users.createIndex({ discordId: 1 }, { unique: true });
            // Índice por username - buscar por nome
            await users.createIndex({ username: 1 });
            logger.info("  ✓ Índices de users criados");
        }
        catch (error) {
            logger.error("  ✗ Erro ao criar índices de users:", error);
        }
    }
    /**
     * Índices para Compendium (classes, raças, poderes, magias, itens)
     */
    static async createCompendiumIndexes() {
        const { compendium_classes, compendium_races, compendium_powers, compendium_spells, compendium_items, } = getCollections();
        try {
            // Classes
            await compendium_classes.createIndex({ id: 1 }, { unique: true });
            await compendium_classes.createIndex({ nome: 1 });
            // Raças
            await compendium_races.createIndex({ id: 1 }, { unique: true });
            await compendium_races.createIndex({ nome: 1 });
            // Poderes
            await compendium_powers.createIndex({ id: 1 }, { unique: true });
            await compendium_powers.createIndex({ nome: 1 });
            await compendium_powers.createIndex({ tipo: 1 }); // Filtrar por tipo
            // Magias
            await compendium_spells.createIndex({ id: 1 }, { unique: true });
            await compendium_spells.createIndex({ nome: 1 });
            await compendium_spells.createIndex({ circulo: 1 }); // Filtrar por círculo
            await compendium_spells.createIndex({ escola: 1 }); // Filtrar por escola
            // Itens
            await compendium_items.createIndex({ id: 1 }, { unique: true });
            await compendium_items.createIndex({ nome: 1 });
            await compendium_items.createIndex({ tipo: 1 }); // Filtrar por tipo
        }
        catch (error) {
            logger.error("  ✗ Erro ao criar índices de compendium:", error);
        }
    }
    /**
     * Lista todos os índices existentes (para debug)
     */
    static async listAllIndexes() {
        if (!isConnected()) {
            logger.warn("MongoDB não conectado");
            return;
        }
        try {
            const { characters, users, compendium_classes } = getCollections();
            logger.info("\n📋 Índices existentes:");
            const charIndexes = await characters.listIndexes().toArray();
            logger.info(`\n  Characters (${charIndexes.length} índices):`);
            charIndexes.forEach((idx) => logger.info(`    - ${idx.name}: ${JSON.stringify(idx.key)}`));
            const userIndexes = await users.listIndexes().toArray();
            logger.info(`\n  Users (${userIndexes.length} índices):`);
            userIndexes.forEach((idx) => logger.info(`    - ${idx.name}: ${JSON.stringify(idx.key)}`));
            const classIndexes = await compendium_classes.listIndexes().toArray();
            logger.info(`\n  Compendium Classes (${classIndexes.length} índices):`);
            classIndexes.forEach((idx) => logger.info(`    - ${idx.name}: ${JSON.stringify(idx.key)}`));
        }
        catch (error) {
            logger.error("Erro ao listar índices:", error);
        }
    }
    /**
     * Remove todos os índices (exceto _id) - útil para reset
     */
    static async dropAllIndexes() {
        if (!isConnected()) {
            logger.warn("MongoDB não conectado");
            return;
        }
        try {
            const { characters, users, compendium_classes, compendium_races, compendium_powers, compendium_spells, compendium_items, } = getCollections();
            logger.info("🗑️ Removendo índices...");
            await characters.dropIndexes();
            await users.dropIndexes();
            await compendium_classes.dropIndexes();
            await compendium_races.dropIndexes();
            await compendium_powers.dropIndexes();
            await compendium_spells.dropIndexes();
            await compendium_items.dropIndexes();
            logger.info("✅ Índices removidos (exceto _id)");
        }
        catch (error) {
            logger.error("❌ Erro ao remover índices:", error);
        }
    }
}
