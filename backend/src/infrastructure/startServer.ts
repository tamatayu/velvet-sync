import { Server as HttpServer } from 'http';
import { Logger } from 'pino';
import { ServerConfig } from '../config/server.config';

/**
 * Starts the HTTP server and logs the active runtime configuration.
 */
export function startServer(httpServer: HttpServer, logger: Logger, config: ServerConfig): void {
    httpServer.listen(config.port, () => {
        logger.info(`🚀 VelvetSync Server running on port ${config.port}`);
        logger.info(`   Environment: ${config.nodeEnv}`);
        logger.info(`   Socket.io enabled`);
    });
}