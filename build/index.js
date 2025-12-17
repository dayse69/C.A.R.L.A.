import { bootstrap } from "#base";
import { connectDatabase as connectDatabaseAdapter } from "#database";
import { warmUpCache } from "#services/compendiumService";
import { setupErrorHandlers } from "#utils/errorHandler";
import { logger } from "#utils/logger";
import "dotenv/config";
// Setup global error handlers (sem process.exit)
setupErrorHandlers();
// Função principal async
async function main() {
    // Usar LocalDB diretamente (sem MongoDB)
    logger.info("🗄️ Inicializando LocalDB (banco de dados local em JSON)...");
    try {
        await connectDatabaseAdapter();
        logger.info("✅ LocalDB inicializado com sucesso");
    }
    catch (dbError) {
        logger.error("Erro crítico ao inicializar LocalDB:", dbError);
        throw dbError;
    }
    // Pré-carregar compêndio em memória (melhora ~80% performance)
    await warmUpCache();
    try {
        const { client } = await bootstrap({
            meta: import.meta,
            modules: ["./commands/**/*.ts"],
        });
        // Logar guilds conectadas quando o bot ficar pronto
        client.once("ready", async (readyClient) => {
            try {
                const guilds = await readyClient.guilds.fetch();
                const summary = guilds.map((guild) => `${guild.name} (${guild.id})`).join("; ");
                logger.info(`[Discord] Guilds conectadas (${guilds.size}): ${summary || "nenhuma"}`);
            }
            catch (fetchError) {
                logger.error("[Discord] Falha ao listar guilds:", fetchError);
            }
        });
        // Manter o processo vivo
        logger.info("✅ Bot inicializado e aguardando interações...");
        // Log de eventos do Discord para debugging
        client.on("error", (error) => {
            logger.error("[Discord] Erro no cliente:", error);
        });
        client.on("warn", (warning) => {
            logger.warn(`[Discord] Aviso: ${warning}`);
        });
        client.on("debug", (info) => {
            if (info.includes("Heartbeat") || info.includes("heartbeat")) {
                return; // Ignorar logs de heartbeat (muito verbose)
            }
            logger.debug(`[Discord] ${info}`);
        });
        // Manter processo vivo indefinidamente
        setInterval(() => {
            // Heartbeat para manter processo ativo
        }, 300000); // A cada 5 minutos
        // Aguardar eternamente
        await new Promise(() => {
            /* nunca resolve */
        });
    }
    catch (bootstrapError) {
        logger.error("[FATAL] Bootstrap error:", bootstrapError);
        throw bootstrapError;
    }
}
// Iniciar bot
console.log("[PROCESS] 🚀 Iniciando main()...");
main().catch((err) => {
    logger.error("[FATAL] Erro na inicialização:", err);
    logger.error("[FATAL] Stack:", err);
    process.exit(1);
});
console.log("[PROCESS] ⏳ main() aguardando indefinidamente...");
// Log quando o bot for desligado
process.on("beforeExit", (code) => {
    console.log(`[PROCESS] 📤 beforeExit: código ${code}`);
    logger.warn(`[PROCESS] beforeExit: código ${code}`);
});
process.on("exit", (code) => {
    console.log(`[PROCESS] 🔴 exit: código ${code}`);
});
// Detectar se há algum erro não capturado
process.on("uncaughtException", (err) => {
    logger.error("[UNCAUGHT] Exceção não capturada:", err);
});
process.on("unhandledRejection", (reason) => {
    logger.error("[UNHANDLED] Promise rejection:", reason);
});
