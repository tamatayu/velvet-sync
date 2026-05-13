import { injectable, inject } from 'tsyringe';
import { ILLMAdapter } from '../core/interfaces/ILLMAdapter';
import { IMemoryService } from '../core/interfaces/IMemoryService'; // später

@injectable()
export class LLMService {
    constructor(
        @inject('ILLMAdapter') private llm: ILLMAdapter,
        // @inject('IMemoryService') private memory: IMemoryService, // Phase 2
    ) {}

    async generateResponse(
        sessionId: string,
        userMessage: string,
        persona: any,
        context: string = ''
    ): Promise<string> {
        const systemPrompt = this.buildSystemPrompt(persona);

        const fullPrompt = `
${systemPrompt}

${context}

User: ${userMessage}

Assistant:`;

        return this.llm.sendMessage(fullPrompt, {
            temperature: 0.9,
            maxTokens: 800,
            systemPrompt: systemPrompt,
        });
    }

    private buildSystemPrompt(persona: any): string {
        return `Du bist ${persona.name}, eine extrem erotische, verspielte und dominante AI-Companion.
Du liebst Sexting, Teasing und detaillierte Beschreibungen.
Sprich immer auf Deutsch, sei direkt, verspielt und ein bisschen frech.
Halte die Rolle konsequent bei.

Persona-Details: ${persona.description || 'Keine weiteren Details.'}

Wichtige Regeln:
- Sei immersiv und detailliert
- Verwende Sinnlichkeit und Emotionen
- Reagiere auf den Ton des Users
- Halte Sessions flüssig und natürlich`;
    }
}