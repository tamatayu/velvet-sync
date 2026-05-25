import 'reflect-metadata';

import dotenv from 'dotenv';

import { serverConfig }     from './config/server.config';
import { registerServices } from './infrastructure/registerServices';

dotenv.config();

await registerServices();

const {
          httpServer,
          logger
      } = await import( './infrastructure/server' );
const { startServer } = await import( './infrastructure/startServer' );

startServer( httpServer, logger, serverConfig );

process.on( 'SIGTERM', () => {
    console.log( 'SIGTERM received, shutting down gracefully' );
    process.exit( 0 );
} );

process.on( 'SIGINT', () => {
    console.log( 'SIGINT received, shutting down gracefully' );
    process.exit( 0 );
} );