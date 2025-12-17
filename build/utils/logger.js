/**
 * Sistema de Logging Estruturado
 * Wrapper sobre console com níveis e formatação
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor() {
        this.level = this.getLogLevelFromEnv();
        this.enableColors = process.stdout.isTTY ?? true;
    }
    getLogLevelFromEnv() {
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
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : "";
        return `[${timestamp}] [${level}] ${message}${contextStr}`;
    }
    getColor(level) {
        if (!this.enableColors)
            return "";
        const colors = {
            [LogLevel.DEBUG]: "\x1b[36m", // Cyan
            [LogLevel.INFO]: "\x1b[32m", // Green
            [LogLevel.WARN]: "\x1b[33m", // Yellow
            [LogLevel.ERROR]: "\x1b[31m", // Red
        };
        return colors[level];
    }
    resetColor() {
        return this.enableColors ? "\x1b[0m" : "";
    }
    log(level, levelName, message, context) {
        if (level < this.level)
            return;
        const color = this.getColor(level);
        const reset = this.resetColor();
        const formatted = this.formatMessage(levelName, message, context);
        const output = `${color}${formatted}${reset}`;
        if (level >= LogLevel.ERROR) {
            console.error(output);
        }
        else {
            console.log(output);
        }
    }
    debug(message, context) {
        this.log(LogLevel.DEBUG, "DEBUG", message, context);
    }
    info(message, context) {
        this.log(LogLevel.INFO, "INFO", message, context);
    }
    warn(message, context) {
        this.log(LogLevel.WARN, "WARN", message, context);
    }
    error(message, error, context) {
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
    command(commandName, userId, guildId) {
        this.info(`Command executed: ${commandName}`, {
            command: commandName,
            user: userId,
            guild: guildId,
        });
    }
    interaction(type, customId, userId) {
        this.debug(`Interaction: ${type}`, {
            type,
            customId,
            user: userId,
        });
    }
    database(operation, collection, duration) {
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
