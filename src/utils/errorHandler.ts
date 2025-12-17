/**
 * Sistema de Error Handling Centralizado
 * Fornece classes de erro customizadas e formatação consistente
 */

import { EmbedBuilder } from "discord.js";
import { logger } from "./logger.js";

/**
 * Códigos de erro padrão do bot
 */
export enum ErrorCode {
    // Database errors
    DB_CONNECTION = "DB_001",
    DB_QUERY = "DB_002",
    DB_NOT_FOUND = "DB_003",

    // Validation errors
    INVALID_INPUT = "VAL_001",
    INVALID_CLASS = "VAL_002",
    INVALID_RACE = "VAL_003",

    // Permission errors
    NO_PERMISSION = "PERM_001",

    // Discord errors
    INTERACTION_FAILED = "DISC_001",
    MESSAGE_FAILED = "DISC_002",

    // Generic
    UNKNOWN = "ERR_000",
}

/**
 * Classe base de erro customizada
 */
export class BotError extends Error {
    constructor(
        message: string,
        public code: ErrorCode,
        public userMessage: string,
        public isOperational = true
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Erro de banco de dados
 */
export class DatabaseError extends BotError {
    constructor(message: string, userMessage = "Erro ao acessar banco de dados") {
        super(message, ErrorCode.DB_CONNECTION, userMessage);
    }
}

/**
 * Erro de validação de entrada
 */
export class ValidationError extends BotError {
    constructor(message: string, userMessage = "Dados inválidos fornecidos") {
        super(message, ErrorCode.INVALID_INPUT, userMessage);
    }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends BotError {
    constructor(message: string, userMessage = "Recurso não encontrado") {
        super(message, ErrorCode.DB_NOT_FOUND, userMessage);
    }
}

/**
 * Erro de permissão
 */
export class PermissionError extends BotError {
    constructor(message: string, userMessage = "Você não tem permissão para isso") {
        super(message, ErrorCode.NO_PERMISSION, userMessage);
    }
}

/**
 * Cria um embed de erro formatado para Discord
 */
export function createErrorEmbed(error: BotError | Error): EmbedBuilder {
    const isCustomError = error instanceof BotError;

    const embed = new EmbedBuilder().setColor("#FF0000").setTitle("❌ Erro").setTimestamp();

    if (isCustomError) {
        embed.setDescription(error.userMessage);
        embed.addFields({
            name: "Código",
            value: `\`${error.code}\``,
            inline: true,
        });
    } else {
        embed.setDescription("Ocorreu um erro inesperado. Tente novamente.");
    }

    return embed;
}

/**
 * Handler global de erros não tratados
 */
export function setupErrorHandlers(): void {
    process.on("uncaughtException", (error: Error) => {
        console.error("💥 UNCAUGHT EXCEPTION:", error);
        // Não fazer exit para manter bot online (MongoDB auth errors etc)
        logger.error("[ERROR] Uncaught Exception (bot continuará):", error);
    });

    process.on("unhandledRejection", (reason: any) => {
        console.error("💥 UNHANDLED REJECTION:", reason);
    });
}

/**
 * Log de erro estruturado
 */
export function logError(error: Error | BotError, context?: Record<string, any>): void {
    const logData = {
        timestamp: new Date().toISOString(),
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...(error instanceof BotError && {
                code: error.code,
                userMessage: error.userMessage,
                isOperational: error.isOperational,
            }),
        },
        context,
    };

    console.error(JSON.stringify(logData, null, 2));
}

/**
 * Wrapper para operações assíncronas com error handling
 */
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof BotError) {
            throw error;
        }
        throw new BotError(
            error instanceof Error ? error.message : String(error),
            ErrorCode.UNKNOWN,
            errorMessage
        );
    }
}
