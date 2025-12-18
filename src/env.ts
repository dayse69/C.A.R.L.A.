import { z } from "zod";
import { validateEnv } from "./base/index.js";

export const env = validateEnv(
    z.object({
        DISCORD_TOKEN: z.string().min(1, { message: "Discord Bot Token is required" }),
        WEBHOOK_LOGS_URL: z.string().url().optional(),
        GUILD_ID: z.string().optional(),
        // MongoDB
        MONGODB_URI: z.string().optional(),
        MONGODB_DB: z.string().optional(),
        MONGODB_MAX_RETRIES: z.string().optional(),
        MONGODB_RETRY_DELAY_MS: z.string().optional(),
        MONGODB_TLS: z.string().optional(),
        MONGODB_TLS_ALLOW_INVALID_CERTS: z.string().optional(),
        MONGODB_DIRECT_CONNECTION: z.string().optional(),
        // Sentry
        SENTRY_DSN: z.string().optional(),
    })
);
