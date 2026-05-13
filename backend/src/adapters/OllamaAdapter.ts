import { injectable } from 'tsyringe';
import axios from 'axios';
import { ILLMAdapter, LLMOptions } from '../core/interfaces/ILLMAdapter';

@injectable()
export class OllamaAdapter implements ILLMAdapter {
    private readonly baseUrl: string;
    private readonly defaultModel: string;

    constructor() {
        this.baseUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
        this.defaultModel = 'llama3.1:8b-instruct-q4_K_M'; // oder was du bevorzugst
    }

    async sendMessage(prompt: string, options: LLMOptions = {}): Promise<string> {
        const payload = {
            model: this.defaultModel,
            prompt,
            stream: false,
            options: {
                temperature: options.temperature ?? 0.85,
                num_predict: options.maxTokens ?? 1024,
            },
            system: options.systemPrompt,
        };

        try {
            const response = await axios.post(`${this.baseUrl}/api/generate`, payload);
            return response.data.response.trim();
        } catch (error: any) {
            console.error('[Ollama Error]', error?.response?.data || error.message);
            throw new Error('LLM-Anfrage fehlgeschlagen');
        }
    }

    async getModelInfo() {
        return {
            model: this.defaultModel,
            contextWindow: 8192, // für llama3.1:8b
        };
    }
}