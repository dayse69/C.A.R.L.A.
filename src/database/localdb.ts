/**
 * LocalDB - Sistema de Banco de Dados Local em JSON
 * Alternativa leve ao MongoDB usando arquivos JSON estruturados
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../data/localdb");

// Tipos de dados
export interface LocalDBCollections {
    users: Record<string, any>;
    characters: Record<string, any>;
    campaigns: Record<string, any>;
    compendium_races: Record<string, any>;
    compendium_classes: Record<string, any>;
    compendium_powers: Record<string, any>;
    compendium_spells: Record<string, any>;
    compendium_items: Record<string, any>;
}

type CollectionName = keyof LocalDBCollections;

class LocalDB {
    private collections: LocalDBCollections = {
        users: {},
        characters: {},
        campaigns: {},
        compendium_races: {},
        compendium_classes: {},
        compendium_powers: {},
        compendium_spells: {},
        compendium_items: {},
    };

    private initialized = false;
    private saveQueue: Set<CollectionName> = new Set();
    private saveTimer: NodeJS.Timeout | null = null;

    /**
     * Inicializa o banco de dados local
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            logger.info("Iniciando LocalDB...");

            // Criar diretório se não existir
            try {
                await fs.mkdir(DATA_DIR, { recursive: true });
            } catch (e) {
                // Diretório já existe
            }

            // Carregar todas as coleções
            const collectionNames = Object.keys(this.collections) as CollectionName[];
            for (const name of collectionNames) {
                await this.loadCollection(name);
            }

            this.initialized = true;
            logger.info("LocalDB inicializado com sucesso", {
                collections: collectionNames.length,
                dataDir: DATA_DIR,
            });
        } catch (erro) {
            logger.error("Erro ao inicializar LocalDB", erro);
            throw erro;
        }
    }

    /**
     * Carrega uma coleção do arquivo JSON
     */
    private async loadCollection(name: CollectionName): Promise<void> {
        const filePath = path.join(DATA_DIR, `${name}.json`);

        try {
            const data = await fs.readFile(filePath, "utf-8");
            this.collections[name] = JSON.parse(data);
            logger.info(`Coleção carregada: ${name}`, {
                items: Object.keys(this.collections[name]).length,
            });
        } catch (erro: any) {
            if (erro.code === "ENOENT") {
                // Arquivo não existe, criar vazio
                this.collections[name] = {};
                await this.saveCollection(name);
                logger.info(`Coleção criada: ${name}`);
            } else {
                logger.error(`Erro ao carregar ${name}`, erro);
            }
        }
    }

    /**
     * Salva uma coleção no arquivo JSON
     */
    private async saveCollection(name: CollectionName): Promise<void> {
        const filePath = path.join(DATA_DIR, `${name}.json`);
        const data = JSON.stringify(this.collections[name], null, 2);

        try {
            await fs.writeFile(filePath, data, "utf-8");
        } catch (erro) {
            logger.error(`Erro ao salvar ${name}`, erro);
        }
    }

    /**
     * Agenda salvamento de coleção (debounced)
     */
    private scheduleSave(name: CollectionName): void {
        this.saveQueue.add(name);

        if (this.saveTimer) clearTimeout(this.saveTimer);

        this.saveTimer = setTimeout(() => {
            void (async () => {
                for (const collectionName of this.saveQueue) {
                    await this.saveCollection(collectionName);
                }
                this.saveQueue.clear();
            })();
        }, 1000); // Salva 1 segundo após última mudança
    }

    /**
     * Insere um documento em uma coleção
     */
    async insert(collectionName: CollectionName, id: string, data: any): Promise<any> {
        if (!this.initialized) await this.initialize();

        const collection = this.collections[collectionName];
        if (!collection) {
            throw new Error(`Collection ${collectionName} not found`);
        }

        collection[id] = { ...data, _id: id, createdAt: new Date().toISOString() };
        this.scheduleSave(collectionName);

        return collection[id];
    }

    /**
     * Atualiza um documento
     */
    async update(collectionName: CollectionName, id: string, data: any): Promise<any> {
        if (!this.initialized) await this.initialize();

        const collection = this.collections[collectionName];
        if (!collection) {
            throw new Error(`Collection ${collectionName} not found`);
        }

        if (!collection[id]) {
            throw new Error(`Document ${id} not found in ${collectionName}`);
        }

        collection[id] = {
            ...collection[id],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        this.scheduleSave(collectionName);

        return collection[id];
    }

    /**
     * Busca um documento por ID
     */
    async findById(collectionName: CollectionName, id: string): Promise<any> {
        if (!this.initialized) await this.initialize();

        const collection = this.collections[collectionName];
        if (!collection) {
            throw new Error(`Collection ${collectionName} not found`);
        }

        return collection[id] || null;
    }

    /**
     * Lista todos os documentos de uma coleção
     */
    async find(collectionName: CollectionName, filter?: any): Promise<any[]> {
        if (!this.initialized) await this.initialize();

        const collection = this.collections[collectionName];
        if (!collection) {
            throw new Error(`Collection ${collectionName} not found`);
        }

        let results = Object.values(collection);

        if (filter) {
            results = results.filter((doc) => {
                return Object.entries(filter).every(([key, value]) => {
                    if (typeof value === "object" && value !== null) {
                        // Suportar operadores básicos como { $eq: value }
                        const operators = value as any;
                        if (operators.$eq) return doc[key] === operators.$eq;
                        if (operators.$ne) return doc[key] !== operators.$ne;
                        if (operators.$in) return (operators.$in as any[]).includes(doc[key]);
                    }
                    return doc[key] === value;
                });
            });
        }

        return results;
    }

    /**
     * Delete um documento
     */
    async deleteById(collectionName: CollectionName, id: string): Promise<boolean> {
        if (!this.initialized) await this.initialize();

        const collection = this.collections[collectionName];
        if (!collection) {
            throw new Error(`Collection ${collectionName} not found`);
        }

        if (collection[id]) {
            delete collection[id];
            this.scheduleSave(collectionName);
            return true;
        }

        return false;
    }

    /**
     * Limpa uma coleção
     */
    async clearCollection(collectionName: CollectionName): Promise<void> {
        if (!this.initialized) await this.initialize();

        this.collections[collectionName] = {};
        this.scheduleSave(collectionName);
    }

    /**
     * Obtém estatísticas
     */
    async stats(): Promise<Record<string, number>> {
        if (!this.initialized) await this.initialize();

        const stats: Record<string, number> = {};
        for (const [name, collection] of Object.entries(this.collections)) {
            stats[name] = Object.keys(collection).length;
        }
        return stats;
    }

    /**
     * Força salvamento imediato
     */
    async flush(): Promise<void> {
        const collectionNames = Object.keys(this.collections) as CollectionName[];
        for (const name of collectionNames) {
            await this.saveCollection(name);
        }
        this.saveQueue.clear();
        if (this.saveTimer) clearTimeout(this.saveTimer);
    }
}

// Instância singleton
const localdb = new LocalDB();

export default localdb;
