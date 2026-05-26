import { Express } from 'express';
import { Logger }  from 'pino';

import appRoutes     from '../routes/app.routes';
import chatRoutes    from '../routes/chat.routes';
import personaRoutes from '../routes/persona.routes';
import profileRoutes from '../routes/profile.routes';
import sessionRoutes from '../routes/session.routes';
import deviceRoutes  from '../routes/device.routes';

export function bindRoutes( app: Express, logger: Logger ): void {
    try {
        app.use( '/', appRoutes );
        app.use( '/api/chat', chatRoutes );
        app.use( '/api/personas', personaRoutes );
        app.use( '/api/device', deviceRoutes );
        app.use( '/api/profiles', profileRoutes );
        app.use( '/api/session', sessionRoutes );
    } catch ( error ) {
        logger.error( { error }, 'Route binding error' );
    }
}