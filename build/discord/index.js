import { setupCreators } from "#base";
import { bootstrap } from "#base/bootstrap";
import { env } from "#env";
import "dotenv/config";
// Sentry setup
if (env.SENTRY_DSN) {
    import("@sentry/node")
        .then((Sentry) => {
        Sentry.init({
            dsn: env.SENTRY_DSN,
            tracesSampleRate: 1.0,
        });
        console.log("Sentry inicializado.");
        // Captura automática de erros globais
        process.on("uncaughtException", (err) => {
            Sentry.captureException(err);
            console.error("[Sentry] uncaughtException capturada:", err);
        });
        process.on("unhandledRejection", (reason) => {
            Sentry.captureException(reason);
            console.error("[Sentry] unhandledRejection capturada:", reason);
        });
    })
        .catch((e) => {
        console.warn("Falha ao inicializar Sentry:", e);
    });
}
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
