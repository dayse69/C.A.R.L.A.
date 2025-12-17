/**
 * Database Adapter - Seleciona entre MongoDB e LocalDB automaticamente
 */
import localdb from "#database/localdb";
import { env } from "#env";
import { logger } from "#utils/logger";
let useLocalDB = false;
let isConnected = false;
/**
 * Conecta ao banco de dados (MongoDB ou LocalDB)
 */
export async function connectDatabase() {
    if (isConnected) {
        console.log("✓ Database already connected");
        return;
    }
    try {
        // Se MONGODB_URI não está definido ou é localhost, usar LocalDB
        const mongoUri = env.MONGODB_URI || "mongodb://localhost:27017/grimorio-corrupcao";
        if (!mongoUri.includes("mongodb+srv://")) {
            logger.info("MongoDB remoto não configurado. Usando LocalDB.");
            useLocalDB = true;
        }
        if (useLocalDB) {
            await localdb.initialize();
            isConnected = true;
            logger.info("✓ Conectado ao LocalDB (banco de dados local em JSON)");
            // Garantir flush em encerramento do processo
            const flush = async () => {
                try {
                    await localdb.flush();
                }
                catch { }
            };
            const onExit = () => {
                void flush();
            };
            if (!process.listeners("beforeExit").includes(onExit)) {
                process.on("beforeExit", onExit);
                process.on("SIGINT", onExit);
                process.on("SIGTERM", onExit);
            }
        }
        else {
            // Tentar conectar ao MongoDB remoto
            try {
                const mongodb = await import("./mongodb.js");
                await mongodb.connectDatabase();
                isConnected = true;
                logger.info("✅ Conectado ao MongoDB remoto");
            }
            catch (error) {
                logger.error("Falha ao conectar ao MongoDB remoto. Usando LocalDB como fallback.", error);
                useLocalDB = true;
                await localdb.initialize();
                isConnected = true;
            }
        }
    }
    catch (erro) {
        logger.error("Erro ao conectar ao banco de dados", erro);
        logger.info("Usando LocalDB como fallback");
        useLocalDB = true;
        await localdb.initialize();
        isConnected = true;
    }
}
/**
 * Desconecta do banco de dados
 */
export async function disconnectDatabase() {
    if (useLocalDB) {
        await localdb.flush();
        console.log("✓ LocalDB disconnected");
    }
    isConnected = false;
}
/**
 * Obtém as operações de banco de dados
 */
export function getDatabase() {
    if (!isConnected) {
        throw new Error("Database not connected. Call connectDatabase() first.");
    }
    return localdb;
}
/**
 * Compatibilidade com código antigo que usa "Collections"
 */
export function getCollections() {
    if (!isConnected) {
        // Tentar conectar se ainda não foi conectado
        console.warn("⚠️ Database not connected yet, attempting connection...");
        // Não lançar erro imediatamente, retornar proxies que esperam
        return createCollectionsWithWait();
    }
    return {
        users: createCollectionProxy("users"),
        characters: createCollectionProxy("characters"),
        campaigns: createCollectionProxy("campaigns"),
        compendium_races: createCollectionProxy("compendium_races"),
        compendium_classes: createCollectionProxy("compendium_classes"),
        compendium_powers: createCollectionProxy("compendium_powers"),
        compendium_spells: createCollectionProxy("compendium_spells"),
        compendium_items: createCollectionProxy("compendium_items"),
    };
}
/**
 * Cria um proxy para compatibilidade com MongoDB Collection API
 */
function createCollectionProxy(collectionName) {
    return {
        insertOne: async (doc) => {
            const id = doc._id || `${Date.now()}-${Math.random()}`;
            await localdb.insert(collectionName, id, doc);
            return { insertedId: id };
        },
        updateOne: async (filter, update) => {
            const docs = await localdb.find(collectionName, filter);
            if (docs.length === 0)
                return { matchedCount: 0, modifiedCount: 0 };
            const doc = docs[0];
            const updateData = update.$set || update;
            await localdb.update(collectionName, doc._id, updateData);
            return { matchedCount: 1, modifiedCount: 1 };
        },
        findOne: async (filter) => {
            const docs = await localdb.find(collectionName, filter);
            return docs[0] || null;
        },
        find: async (filter) => {
            const docs = await localdb.find(collectionName, filter);
            return {
                toArray: async () => docs,
                [Symbol.asyncIterator]: async function* () {
                    for (const doc of docs)
                        yield doc;
                },
            };
        },
        deleteOne: async (filter) => {
            const docs = await localdb.find(collectionName, filter);
            if (docs.length === 0)
                return { deletedCount: 0 };
            const doc = docs[0];
            await localdb.deleteById(collectionName, doc._id);
            return { deletedCount: 1 };
        },
        deleteMany: async (filter) => {
            const docs = await localdb.find(collectionName, filter);
            let deletedCount = 0;
            for (const doc of docs) {
                await localdb.deleteById(collectionName, doc._id);
                deletedCount++;
            }
            return { deletedCount };
        },
        countDocuments: async (filter) => {
            const docs = await localdb.find(collectionName, filter);
            return docs.length;
        },
    };
}
/**
 * Cria collections que esperam a conexão ser estabelecida
 */
function createCollectionsWithWait() {
    return {
        users: createCollectionProxyWithWait("users"),
        characters: createCollectionProxyWithWait("characters"),
        campaigns: createCollectionProxyWithWait("campaigns"),
        compendium_races: createCollectionProxyWithWait("compendium_races"),
        compendium_classes: createCollectionProxyWithWait("compendium_classes"),
        compendium_powers: createCollectionProxyWithWait("compendium_powers"),
        compendium_spells: createCollectionProxyWithWait("compendium_spells"),
        compendium_items: createCollectionProxyWithWait("compendium_items"),
    };
}
/**
 * Cria um proxy que aguarda a conexão antes de executar
 */
function createCollectionProxyWithWait(collectionName) {
    const waitForConnection = async () => {
        // Tentativa proativa de conexão caso ainda não tenha sido iniciada
        if (!isConnected) {
            try {
                await connectDatabase();
            }
            catch (erro) {
                logger.error("Falha ao inicializar conexão do LocalDB", erro);
            }
        }
        let attempts = 0;
        while (!isConnected && attempts < 100) {
            await new Promise((r) => setTimeout(r, 100));
            attempts++;
        }
        if (!isConnected) {
            throw new Error(`Database connection timeout after ${attempts * 100}ms`);
        }
    };
    return {
        insertOne: async (doc) => {
            await waitForConnection();
            return createCollectionProxy(collectionName).insertOne(doc);
        },
        updateOne: async (filter, update) => {
            await waitForConnection();
            return createCollectionProxy(collectionName).updateOne(filter, update);
        },
        findOne: async (filter) => {
            await waitForConnection();
            return createCollectionProxy(collectionName).findOne(filter);
        },
        find: async (filter) => {
            await waitForConnection();
            return createCollectionProxy(collectionName).find(filter);
        },
        deleteOne: async (filter) => {
            await waitForConnection();
            return createCollectionProxy(collectionName).deleteOne(filter);
        },
        deleteMany: async (filter) => {
            await waitForConnection();
            return createCollectionProxy(collectionName).deleteMany(filter);
        },
        countDocuments: async (filter) => {
            await waitForConnection();
            return createCollectionProxy(collectionName).countDocuments(filter);
        },
    };
}
/**
 * Salva dados simultaneamente no MongoDB e no LocalDB para redundância
 */
export async function saveToBothDatabases(collectionName, operation, ...args) {
    const collections = getCollections();
    let mongoResult;
    try {
        // Tenta MongoDB primeiro
        if (operation === "insertOne") {
            const [doc] = args;
            mongoResult = await collections[collectionName].insertOne(doc);
            const id = mongoResult.insertedId.toString();
            // Salva também no LocalDB
            try {
                await localdb.insert(collectionName, id, { ...doc, _id: id });
                console.log(`[DualSave] ✅ Salvo em MongoDB e LocalDB: ${collectionName}/${id}`);
            }
            catch (localErr) {
                console.warn(`[DualSave] ⚠️ MongoDB OK, LocalDB falhou para ${collectionName}/${id}:`, localErr);
            }
            return id;
        }
        else if (operation === "updateOne") {
            const [filter, update] = args;
            mongoResult = await collections[collectionName].updateOne(filter, update);
            // Atualiza também no LocalDB
            try {
                const docs = await localdb.find(collectionName, filter);
                if (docs.length > 0) {
                    const updateData = update.$set || update;
                    await localdb.update(collectionName, docs[0]._id, updateData);
                    console.log(`[DualSave] ✅ Atualizado em MongoDB e LocalDB: ${collectionName}/${docs[0]._id}`);
                }
            }
            catch (localErr) {
                console.warn(`[DualSave] ⚠️ MongoDB OK, LocalDB falhou para ${collectionName}:`, localErr);
            }
            return mongoResult.insertedId?.toString() || "updated";
        }
    }
    catch (mongoErr) {
        logger.error(`[DualSave] ❌ MongoDB falhou para ${collectionName}:`, mongoErr);
        // Fallback: salva só no LocalDB
        if (operation === "insertOne") {
            const [doc] = args;
            const id = doc._id || `${Date.now()}-${Math.random()}`;
            await localdb.insert(collectionName, id, { ...doc, _id: id });
            console.log(`[DualSave] ✅ Salvo apenas em LocalDB (fallback): ${collectionName}/${id}`);
            return id;
        }
        else if (operation === "updateOne") {
            const [filter, update] = args;
            const docs = await localdb.find(collectionName, filter);
            if (docs.length > 0) {
                const updateData = update.$set || update;
                await localdb.update(collectionName, docs[0]._id, updateData);
                console.log(`[DualSave] ✅ Atualizado apenas em LocalDB (fallback): ${collectionName}/${docs[0]._id}`);
            }
            return "updated";
        }
    }
    return "unknown";
}
export { DatabaseIndexes } from "./DatabaseIndexes.js";
export { default as localdb } from "./localdb.js";
