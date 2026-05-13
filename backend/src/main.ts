import 'reflect-metadata';
import { container } from 'tsyringe';
import './infrastructure/server';

// Register services (will be expanded)
container.register('ILLMAdapter', { useClass: (await import('./adapters/OllamaAdapter')).OllamaAdapter });
container.register('IChatService', { useClass: (await import('./services/ChatService')).ChatService });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});