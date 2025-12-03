export interface Logger {
    info(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
    child(context: LoggerContext): Logger;
}

export interface LoggerContext {
    requestId?: string;
    userId?: string;
    [key: string]: unknown;
}