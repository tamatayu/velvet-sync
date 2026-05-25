import pino, { Logger } from 'pino';
import { ServerConfig } from '../config/server.config';

/**
 * Creates the central application logger.
 */
export function createLogger(config: ServerConfig): Logger {
    return pino({
        level: config.logLevel,
        transport: config.nodeEnv === 'development' ? {
            target: 'pino-pretty',
            options: { colorize: true }
        } : undefined
    });
}