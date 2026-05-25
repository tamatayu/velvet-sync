import express from 'express';
import { createServer } from 'http';
import { bindRoutes } from './routes';
import { bindSocket } from './socket';
import { serverConfig } from '../config/server.config';
import { createLogger } from './logger';
import { createSocketServer } from '../config/socket.config';
import { bindMiddleware } from './middleware';
import { bindErrorHandler } from './errorHandler';

export const logger = createLogger(serverConfig);
export const app = express();
export const httpServer = createServer(app);
export const io = createSocketServer(httpServer, serverConfig);

bindMiddleware(app, serverConfig);
bindRoutes(app, logger);
bindSocket(io, logger);
bindErrorHandler(app, logger);