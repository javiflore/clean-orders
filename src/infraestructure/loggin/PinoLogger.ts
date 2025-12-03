import { Logger, LoggerContext } from '@/src/application/ports/Logger.js';
import pino from 'pino';

export class PinoLogger implements Logger {
    private logger: pino.Logger;

    constructor() {
        this.logger = pino({
            level: process.env.LOG_LEVEL || 'info',
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            },
        });
    }

    child(context: LoggerContext): Logger {
        const childLogger = new PinoLogger();
        childLogger.logger = this.logger.child(context);
        return childLogger;
    }

    info(message: string, ...args: any[]): void {
        this.logger.info(message, ...args);
    }

    error(message: string, error?: Error, ...args: any[]): void {
        this.logger.error({ err: error, ...args }, message);
    }

    warn(message: string, ...args: any[]): void {
        this.logger.warn(message, ...args);
    }

    debug(message: string, ...args: any[]): void {
        this.logger.debug(message, ...args);
    }

    fatal(message: string, error?: Error, ...args: any[]): void {
        this.logger.fatal({ err: error, ...args }, message);
    }
}