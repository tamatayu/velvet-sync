import { injectable }   from 'tsyringe';
import axios            from 'axios';
import { ollamaConfig } from '../config/ollama.config';
import { logger }       from '../infrastructure/server';

export type LLMOptions = {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    stream?: boolean;
    context?: string;           // vorherige Nachrichten als String
};

@injectable()
export class OllamaAdapter {
    private readonly baseUrl: string;
    private readonly defaultModel: string;

    constructor() {
        this.baseUrl = ollamaConfig.ollamaHost;
        this.defaultModel = ollamaConfig.defaultModel;
    }

    async sendMessage( prompt: string, options: LLMOptions = {} ): Promise<string> {
        const payload = {
            model   : this.defaultModel,
            prompt,
            stream  : options.stream ?? ollamaConfig.fallback.stream,
            options : {
                temperature : options.temperature ?? ollamaConfig.fallback.temperature,
                num_predict : options.maxTokens ?? ollamaConfig.fallback.maxTokens,
            },
            system  : options.systemPrompt,
        };

        try {
            const response = await axios.post( `${ this.baseUrl }/api/generate`, payload );
            return response.data.response.trim();
        } catch ( error: any ) {
            logger.error( error, '[Ollama Error]', error?.response?.data || error.message );
            throw new Error( 'LLM-Anfrage fehlgeschlagen' );
        }
    }

    async getModelInfo() {
        return {
            model         : this.defaultModel,
            contextWindow : ollamaConfig.contextWindow,
        };
    }
}