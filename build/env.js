import { validateEnv } from "#base";
import { z } from "zod";
export const env = validateEnv(z.object({
    BOT_TOKEN: z.string().min(1, { message: "Discord Bot Token is required" }),
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
}));
