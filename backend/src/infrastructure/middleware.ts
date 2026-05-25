import express, { Express } from 'express';
import cors from 'cors';
import { ServerConfig } from '../config/server.config';

/**
 * Registers all global Express middleware.
 */
export function bindMiddleware(app: Express, config: ServerConfig): void {
    app.use(cors({
        origin: config.allowedOrigins,
        credentials: true
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
}