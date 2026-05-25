import { Express, NextFunction, Request, Response } from 'express';
import { Logger } from 'pino';

/**
 * Registers the global Express error handler.
 */
export function bindErrorHandler(app: Express, logger: Logger): void {
    app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
        logger.error({ err, path: req.path }, 'Unhandled error');

        res.status(500).json({
            error: 'Internal server error'
        });
    });
}