import { injectable, inject } from 'tsyringe';
import { LLMService } from './LLMService';
import { IChatService, ChatMessage, ChatResponse } from '../core/interfaces/IChatService';

@injectable()
export class ChatService implements IChatService {
    private sessions = new Map<string, ChatMessage[]>();

    constructor(@inject(LLMService) private llmService: LLMService) {}

    async sendUserMessage(sessionId: string, content: string): Promise<ChatResponse> {
        const history = this.sessions.get(sessionId) || [];

        // Einfacher Kontext (letzte 10 Nachrichten)
        const context = history
            .slice(-10)
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n\n');

        const replyText = await this.llmService.generateResponse(
            sessionId,
            content,
            { name: "Luna", description: "Verspielte dominante Companion" }, // später echte Persona
            context
        );

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: replyText,
            timestamp: new Date()
        };

        // Session speichern
        if (!this.sessions.has(sessionId)) this.sessions.set(sessionId, []);
        this.sessions.get(sessionId)!.push(userMsg, assistantMsg);

        return { message: assistantMsg };
    }

    getHistory(sessionId: string): ChatMessage[] {
        return this.sessions.get(sessionId) || [];
    }

    clearSession(sessionId: string): Promise<void> {
        this.sessions.delete(sessionId);
        return Promise.resolve();
    }
}