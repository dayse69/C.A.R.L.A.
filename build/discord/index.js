import { setupCreators } from "#base";
import { bootstrap } from "#base/bootstrap";
import "dotenv/config";
export const { createCommand, createEvent, createResponder } = setupCreators();
// Inicialização automática do bot no modo dev
if (import.meta.url.endsWith("/src/discord/index.ts") || process.env.NODE_ENV !== "production") {
    bootstrap({
        meta: import.meta,
        loadLogs: true,
    }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Erro ao iniciar o bot:", err);
        process.exit(1);
    });
}
