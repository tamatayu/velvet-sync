import { injectable }   from 'tsyringe';
import axios            from 'axios';
import { ollamaConfig } from '../config/ollama.config';
import { logger }       from '../infrastructure/server';

export type LLMOptions = {
    temperature     : number;
    maxTokens       : number;
    systemPrompt    : string;
    context         : string;           // vorherige Nachrichten als String
};

@injectable()
export class OllamaAdapter {
    private readonly baseUrl    : string;
    private readonly modelName  : string;

    constructor() {
        this.baseUrl    = ollamaConfig.ollamaHost;
        this.modelName  = ollamaConfig.defaultModel;
    }

    async sendMessage( prompt: string, options: LLMOptions ): Promise<string> {
        const payload = {
            prompt  : prompt,
            model   : this.modelName,
            stream  : false,
            options : {
                temperature : options.temperature ?? ollamaConfig.fallback.temperature,
                num_predict : options.maxTokens ?? ollamaConfig.fallback.maxTokens,
            },
            system  : options.systemPrompt,
        };

        try {
            const response = await axios.post(
                `${ this.baseUrl }/api/generate`,
                payload,
                { timeout: ollamaConfig.timeout }
            );
            return response?.data?.message?.content?.trim();
        } catch ( error: any ) {
            logger.error( error, '[Ollama Error]', error?.response?.data || error.message );
            throw new Error( 'LLM-Anfrage fehlgeschlagen' );
        }
    }

    async getModelInfo() {
        return {
            model         : this.modelName,
            contextWindow : ollamaConfig.contextWindow,
        };
    }
}