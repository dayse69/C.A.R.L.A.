import "dotenv/config";

import { ENV } from "#env";
import { bootstrap } from "./base/bootstrap.js";
import { setupCreators } from "./base/index.js";

let Sentry: typeof import("@sentry/node") | null = null;

// Inicialização do Sentry (observador externo)
if (ENV.SENTRY_DSN) {
    import("@sentry/node")
        .then((mod) => {
            Sentry = mod;
            mod.init({
                dsn: ENV.SENTRY_DSN,
                tracesSampleRate: 1.0,
            });
            console.log("Sentry inicializado.");
        })
        .catch((e) => {
            console.warn("Falha ao inicializar Sentry:", e);
        });
}

// Handlers globais únicos (fonte da verdade)
process.on("uncaughtException", (err) => {
    if (Sentry) {
        Sentry.captureException(err);
    }

    // reportError(err, { type: "uncaughtException" });

    console.error("uncaughtException:", err);
});

process.on("unhandledRejection", (reason) => {
    if (Sentry) {
        Sentry.captureException(reason);
    }

    // reportError(reason, { type: "unhandledRejection" });

    console.error("unhandledRejection:", reason);
});

// Criadores (commands, events, responders)
export const { createCommand, createEvent, createResponder } = setupCreators();

// Importação dos comandos DEPOIS do setupCreators
// Adicione outros comandos aqui conforme necessário

// Inicialização automática do bot (DEV ou execução direta)
if (import.meta.url.endsWith("/src/discord/index.ts") || process.env.NODE_ENV !== "production") {
    bootstrap({
        meta: import.meta,
        loadLogs: true,
    }).catch((err) => {
        console.error("Erro ao iniciar o bot:", err);
        process.exit(1);
    });
}
// Importação dinâmica dos comandos após setupCreators
async function loadCommands() {
    await import("./commands/public/ajuda.js");
    await import("./commands/public/ping.js");
    await import("./commands/public/compendium.js");
    await import("./commands/public/t20-roll.js");
    await import("./commands/public/perfil.js");
    await import("./commands/public/guild.js");
    await import("./commands/public/criar.js");
    await import("./commands/public/counter.js");
    await import("./commands/public/campanha.js");
    await import("./commands/public/buscar.js");
    await import("./commands/public/acervo.js");
    await import("./commands/public/acervo-publicar.js");
}

loadCommands().then(() => {
    // Inicialização automática do bot (DEV ou execução direta)
    if (import.meta.url.endsWith("/src/discord/index.ts") || process.env.NODE_ENV !== "production") {
        bootstrap({
            meta: import.meta,
            loadLogs: true,
        }).catch((err) => {
            console.error("Erro ao iniciar o bot:", err);
            process.exit(1);
        });
    }
});
