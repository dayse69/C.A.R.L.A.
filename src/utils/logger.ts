/**
 * Sistema de Logging Estruturado
 * Wrapper sobre console com níveis e formatação
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

export interface LogContext {
    [key: string]: any;
}

class Logger {
    private level: LogLevel;
    private enableColors: boolean;

    constructor() {
        this.level = this.getLogLevelFromEnv();
        this.enableColors = process.stdout.isTTY ?? true;
    }

    private getLogLevelFromEnv(): LogLevel {
        const envLevel = process.env.LOG_LEVEL?.toUpperCase();
        switch (envLevel) {
            case "DEBUG":
                return LogLevel.DEBUG;
            case "INFO":
                return LogLevel.INFO;
            case "WARN":
                return LogLevel.WARN;
            case "ERROR":
                return LogLevel.ERROR;
            default:
                return LogLevel.INFO;
        }
    }

    private formatMessage(level: string, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : "";
        return `[${timestamp}] [${level}] ${message}${contextStr}`;
    }

    private getColor(level: LogLevel): string {
        if (!this.enableColors) return "";

        const colors = {
            [LogLevel.DEBUG]: "\x1b[36m", // Cyan
            [LogLevel.INFO]: "\x1b[32m", // Green
            [LogLevel.WARN]: "\x1b[33m", // Yellow
            [LogLevel.ERROR]: "\x1b[31m", // Red
        };
        return colors[level];
    }

    private resetColor(): string {
        return this.enableColors ? "\x1b[0m" : "";
    }

    private log(level: LogLevel, levelName: string, message: string, context?: LogContext): void {
        if (level < this.level) return;

        const color = this.getColor(level);
        const reset = this.resetColor();
        const formatted = this.formatMessage(levelName, message, context);

        const output = `${color}${formatted}${reset}`;

        if (level >= LogLevel.ERROR) {
            console.error(output);
        } else {
            console.log(output);
        }
    }

    debug(message: string, context?: LogContext): void {
        this.log(LogLevel.DEBUG, "DEBUG", message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log(LogLevel.INFO, "INFO", message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.log(LogLevel.WARN, "WARN", message, context);
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        const errorContext = {
            ...context,
            ...(error instanceof Error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            }),
        };
        this.log(LogLevel.ERROR, "ERROR", message, errorContext);
    }

    // Métodos específicos para eventos do bot
    command(commandName: string, userId: string, guildId?: string): void {
        this.info(`Command executed: ${commandName}`, {
            command: commandName,
            user: userId,
            guild: guildId,
        });
    }

    interaction(type: string, customId: string, userId: string): void {
        this.debug(`Interaction: ${type}`, {
            type,
            customId,
            user: userId,
        });
    }

    database(operation: string, collection: string, duration?: number): void {
        this.debug(`Database operation: ${operation}`, {
            operation,
            collection,
            ...(duration && { duration: `${duration}ms` }),
        });
    }
}

// Singleton instance
export const logger = new Logger();

// Export também as funções diretas
export const { debug, info, warn, error, command, interaction, database } = logger;
