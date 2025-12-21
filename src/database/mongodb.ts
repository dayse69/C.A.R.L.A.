/**
 * MongoDB Connection & Configuration
 * Conecta ao banco de dados e configura as coleções
 */

import { ENV } from "#env";
import { Collection, Db, MongoClient, MongoServerError } from "mongodb";
import { logger } from "../utils/logger.js";

let client: MongoClient | null = null;
let db: Db | null = null;

// Coleções tipadas
export interface Collections {
    users: Collection;
    characters: Collection;
    compendium_races: Collection;
    compendium_classes: Collection;
    compendium_powers: Collection;
    compendium_spells: Collection;
    compendium_items: Collection;
}

let collections: Collections | null = null;

/**
 * Conecta ao MongoDB
 */
export async function connectDatabase(): Promise<void> {
    if (db) {
        console.log("✓ Database already connected");
        return;
    }

    const mongoUri = ENV.MONGODB_URI || "mongodb://localhost:27017/grimorio-corrupcao";
    const dbName = ENV.MONGODB_DB || "grimorio-corrupcao";

    const isSrv = mongoUri.includes("mongodb+srv://");
    const parseBool = (v?: string, def = false) =>
        v === undefined ? def : ["1", "true", "yes", "on"].includes(String(v).toLowerCase());

    const maxRetries = Number(ENV.MONGODB_MAX_RETRIES ?? 5);
    const baseDelay = Number(ENV.MONGODB_RETRY_DELAY_MS ?? 1000);
    const useTls = parseBool(ENV.MONGODB_TLS, isSrv);
    const allowInvalidCerts = parseBool(ENV.MONGODB_TLS_ALLOW_INVALID_CERTS, false);
    const directConnection = parseBool(ENV.MONGODB_DIRECT_CONNECTION, false);

    logger.info("Tentando conectar ao MongoDB", {
        uri: mongoUri.split("@")[1] || "local",
        db: dbName,
        tls: useTls,
        direct: directConnection,
    });

    let attempt = 0;
    while (true) {
        try {
            const startTime = Date.now();
            client = new MongoClient(mongoUri, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 10000,
                retryWrites: true,
                retryReads: true,
                maxPoolSize: 20,
                minPoolSize: 2,
                maxIdleTimeMS: 60000,
                tls: useTls,
                tlsAllowInvalidCertificates: allowInvalidCerts,
                tlsAllowInvalidHostnames: allowInvalidCerts,
                directConnection,
            });

            await client.connect();
            db = client.db(dbName);

            // Health check ping
            await db.command({ ping: 1 });

            const duration = Date.now() - startTime;
            logger.info("MongoDB conectado com sucesso", { duration: `${duration}ms` });

            // Inicializar coleções
            collections = {
                users: db.collection("users"),
                characters: db.collection("characters"),
                compendium_races: db.collection("compendium_races"),
                compendium_classes: db.collection("compendium_classes"),
                compendium_powers: db.collection("compendium_powers"),
                compendium_spells: db.collection("compendium_spells"),
                compendium_items: db.collection("compendium_items"),
            };

            logger.info("Collections inicializadas", { count: Object.keys(collections).length });
            break;
        } catch (erro: any) {
            attempt++;
            // const isServerSelection =
            //     erro?.name === "MongoServerSelectionError" || erro?.code === 8;
            const isAuthError = erro instanceof MongoServerError && erro.code === 18; // AuthenticationFailed

            const errorDetails = {
                name: erro?.name,
                code: erro?.code,
                message: erro?.message,
                reason: erro?.reason?.toString?.(),
                fullError: erro?.toString?.(),
            };

            logger.error(
                `Falha ao conectar MongoDB (tentativa ${attempt}/${maxRetries})`,
                errorDetails
            );

            if (isAuthError) {
                // Não adianta repetir em erro de autenticação
                throw erro;
            }

            if (attempt > maxRetries) {
                logger.error("Excedido número máximo de tentativas de conexão");
                throw erro;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1);
            await new Promise((r) => setTimeout(r, delay));
        }
    }
}

/**
 * Desconecta do MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
    if (client) {
        await client.close();
        db = null;
        client = null;
        collections = null;
        console.log("✓ MongoDB disconnected");
    }
}

/**
 * Cria índices para melhor performance
 * Comentado temporariamente - requer autenticação no MongoDB local
 */
// @ts-ignore - função mantida para uso futuro
async function createIndexes(): Promise<void> {
    if (!db) return;

    try {
        // Índices de usuários
        await db.collection("users").createIndex({ discordId: 1 }, { unique: true });

        // Índices de personagens
        await db.collection("characters").createIndex({ userId: 1 });
        await db.collection("characters").createIndex({ nome: 1 });
        await db.collection("characters").createIndex({ userId: 1, nome: 1 }, { unique: true });

        // Índices de compendium
        await db.collection("compendium_races").createIndex({ id: 1 }, { unique: true });
        await db.collection("compendium_classes").createIndex({ id: 1 }, { unique: true });
        await db.collection("compendium_powers").createIndex({ id: 1 }, { unique: true });
        await db.collection("compendium_spells").createIndex({ id: 1 }, { unique: true });
        await db.collection("compendium_items").createIndex({ id: 1 }, { unique: true });

        console.log("✓ Database indexes created");
    } catch (erro) {
        logger.error("✗ Failed to create indexes:", erro);
    }
}

/**
 * Obtém as coleções
 */
export function getCollections(): Collections {
    if (!collections) {
        throw new Error("Database not connected. Call connectDatabase() first.");
    }
    return collections;
}

/**
 * Obtém a instância do banco de dados
 */
export function getDatabase(): Db {
    if (!db) {
        throw new Error("Database not connected. Call connectDatabase() first.");
    }
    return db;
}

/**
 * Verifica se está conectado
 */
export function isConnected(): boolean {
    return !!db && !!client;
}
