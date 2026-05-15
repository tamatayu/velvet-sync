import 'reflect-metadata';
import { container } from 'tsyringe';
import './infrastructure/server';

// Register services
container.register('ILLMAdapter', { useClass: (await import('./adapters/OllamaAdapter')).OllamaAdapter });
container.register('IChatService', { useClass: (await import('./services/ChatService')).ChatService });
container.register('PersonaService', { useClass: (await import('./services/PersonaService')).PersonaService });
container.register('MemoryService', { useClass: (await import('./services/MemoryService')).MemoryService });
container.register('ProfileService', { useClass: (await import('./services/ProfileService')).ProfileService });
container.register('ModeManager', { useClass: (await import('./services/ModeManager')).ModeManager });
container.register('IntentClassifier', { useClass: (await import('./services/IntentClassifier')).IntentClassifier });
container.register('ModeConfigService', { useClass: (await import('./services/ModeConfigService')).ModeConfigService });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});