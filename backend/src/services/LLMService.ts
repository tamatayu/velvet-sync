import { singleton } from 'tsyringe';
import axios         from 'axios';

import { ModelOptions, PersonaConfig } from '../types/config.types';

@singleton()
export class LLMService {
    private readonly ollamaHost: string;
    private readonly defaultModel: string;

    constructor() {
        this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
        this.defaultModel = process.env.OLLAMA_MODEL || 'dolphin-llama3:8b';
    }

    public async generateResponse(
        userMessage: string,
        persona: PersonaConfig,
        userName: string,
        conversationHistory: Array<{ role: string; content: string }> = [],
    ): Promise<string> {
        const systemPrompt = this.buildSystemPrompt( persona, userName );
        const contextMessages = conversationHistory.slice( -12 );

        const messages = [
            {
                role    : 'system',
                content : systemPrompt,
            },
            ...contextMessages,
            {
                role    : 'user',
                content : userMessage,
            },
        ];

        const options = this.buildModelOptions( persona.modelOptions );

        const payload = {
            model  : this.defaultModel,
            messages,
            stream : false,
            options,
        };

        try {
            const response = await axios.post(
                `${ this.ollamaHost }/api/chat`,
                payload,
                { timeout : 45000 },
            );

            return response.data.message.content.trim();
        } catch ( error: any ) {
            console.error( '[LLM Error]', error?.response?.data || error.message );

            return 'Entschuldige, beim Verarbeiten deiner Nachricht ist ein Fehler aufgetreten.';
        }
    }

    /**
     * Builds the final system prompt from the selected persona configuration.
     */
    private buildSystemPrompt(
        persona: PersonaConfig,
        userName?: string,
    ): string {
        const promptParts: string[] = [
            persona.systemPrompt,
        ];

        if ( userName ) {
            promptParts.push( `Der Name des Nutzers ist: ${ userName }.` );
        }

        if ( persona.responseFormat?.type === 'json' ) {
            promptParts.push( 'Antworte ausschließlich mit einem gültigen JSON-Objekt.' );

            if ( persona.responseFormat.schemaDescription ) {
                promptParts.push( persona.responseFormat.schemaDescription );
            }
        }

        return promptParts.join( '\n\n' );
    }

    /**
     * Merges persona-specific model options with safe defaults.
     */
    private buildModelOptions( options?: Partial<ModelOptions> ): ModelOptions {
        return {
            temperature    : options?.temperature ?? 0.7,
            num_predict    : options?.num_predict ?? 900,
            top_p          : options?.top_p ?? 0.9,
            repeat_penalty : options?.repeat_penalty ?? 1.1,
        };
    }
}