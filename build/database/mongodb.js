/**
 * MongoDB Connection & Configuration
 * Conecta ao banco de dados e configura as coleções
 */
import { env } from "#env";
import { MongoClient, MongoServerError } from "mongodb";
import { logger } from "../utils/logger.js";
let client = null;
let db = null;
let collections = null;
/**
 * Conecta ao MongoDB
 */
export async function connectDatabase() {
    if (db) {
        console.log("✓ Database already connected");
        return;
    }
    const mongoUri = env.MONGODB_URI || "mongodb://localhost:27017/grimorio-corrupcao";
    const dbName = env.MONGODB_DB || "grimorio-corrupcao";
    const isSrv = mongoUri.includes("mongodb+srv://");
    const parseBool = (v, def = false) => v === undefined ? def : ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
    const maxRetries = Number(env.MONGODB_MAX_RETRIES ?? 5);
    const baseDelay = Number(env.MONGODB_RETRY_DELAY_MS ?? 1000);
    const useTls = parseBool(env.MONGODB_TLS, isSrv);
    const allowInvalidCerts = parseBool(env.MONGODB_TLS_ALLOW_INVALID_CERTS, false);
    const directConnection = parseBool(env.MONGODB_DIRECT_CONNECTION, false);
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
        }
        catch (erro) {
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
            logger.error(`Falha ao conectar MongoDB (tentativa ${attempt}/${maxRetries})`, errorDetails);
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
export async function disconnectDatabase() {
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
async function createIndexes() {
    if (!db)
        return;
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
    }
    catch (erro) {
        console.error("✗ Failed to create indexes:", erro);
    }
}
/**
 * Obtém as coleções
 */
export function getCollections() {
    if (!collections) {
        throw new Error("Database not connected. Call connectDatabase() first.");
    }
    return collections;
}
/**
 * Obtém a instância do banco de dados
 */
export function getDatabase() {
    if (!db) {
        throw new Error("Database not connected. Call connectDatabase() first.");
    }
    return db;
}
/**
 * Verifica se está conectado
 */
export function isConnected() {
    return !!db && !!client;
}
