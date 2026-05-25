import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ServerConfig } from './server.config';

/**
 * Creates and configures the Socket.io server.
 */
export function createSocketServer(httpServer: HttpServer, config: ServerConfig): SocketIOServer {
    return new SocketIOServer(httpServer, {
        cors: {
            origin: config.allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket'],
        pingInterval: 20000,
        pingTimeout: 10000,
        allowEIO3: false
    });
}