import { container } from 'tsyringe';

export async function registerServices() {
    container.register('ILLMAdapter', { useClass: (await import('../adapters/OllamaAdapter')).OllamaAdapter });
    container.register('IChatService', { useClass: (await import('../services/ChatService')).ChatService });
    container.register('PersonaService', { useClass: (await import('../services/PersonaService')).PersonaService });
    container.register('MemoryService', { useClass: (await import('../services/MemoryService')).MemoryService });
    container.register('ConfigurationService', { useClass: (await import('../services/ConfigurationService')).ConfigurationService });
}

