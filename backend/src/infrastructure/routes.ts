import { Express }   from 'express';
import { Logger }    from 'pino';
import appRoutes     from '../routes/app.routes';
import personaRoutes from '../routes/persona.routes';
import sessionRoutes from '../routes/session.routes';
import userRoutes    from '../routes/user.routes';
import profileRoutes from '../routes/profile.routes';

export function bindRoutes( app: Express, logger: Logger ): void {
    try {
        app.use( '/', appRoutes );
        app.use( '/api/personas', personaRoutes );
        app.use( '/api/personas', personaRoutes );
        app.use( '/api/session', sessionRoutes );
        app.use( '/api/user', userRoutes );
        app.use( '/api/profiles', profileRoutes );
    } catch ( error ) {
        logger.error( { error }, 'Route binding error' );
    }
}