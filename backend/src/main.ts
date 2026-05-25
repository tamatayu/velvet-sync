import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { httpServer, logger } from './infrastructure/server';
import { serverConfig } from './config/server.config';
import { startServer } from './infrastructure/startServer';
import { registerServices } from './infrastructure/registerServices';

await registerServices();

startServer(httpServer, logger, serverConfig);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});