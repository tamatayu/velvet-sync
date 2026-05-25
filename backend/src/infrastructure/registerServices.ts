import { container }            from 'tsyringe';
import { ChatService }          from '../services';
import { ConfigurationService } from '../services';
import { LLMService }           from '../services';

export async function registerServices(): Promise<void> {
    container.registerSingleton( ConfigurationService );
    container.registerSingleton( ChatService );
    container.registerSingleton( LLMService );
}