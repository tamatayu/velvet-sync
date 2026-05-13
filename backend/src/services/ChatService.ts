import { injectable, inject } from 'tsyringe';
import { LLMService } from './LLMService';
import { IChatService, ChatMessage, ChatResponse } from '../core/interfaces/IChatService';

interface SessionData {
  messages: ChatMessage[];
  lastActivity: Date;
  persona: any;
}

@injectable()
export class ChatService implements IChatService {
  private sessions = new Map<string, SessionData>();

  constructor(@inject(LLMService) private llmService: LLMService) {}

  async sendUserMessage(sessionId: string, content: string): Promise<ChatResponse> {
    // Get or create session
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        messages: [],
        lastActivity: new Date(),
        persona: { 
          name: "Luna", 
          description: "Verspielte, dominante Companion die gerne tease und control" 
        }
      };
      this.sessions.set(sessionId, session);
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    session.messages.push(userMsg);
    session.lastActivity = new Date();

    // Prepare context for LLM (last 12 messages)
    const contextForLLM = session.messages.slice(-12).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    // Generate AI response
    const aiResponseText = await this.llmService.generateResponse(
      sessionId,
      content,
      session.persona,
      contextForLLM
    );

    // Add assistant message
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date()
    };
    session.messages.push(assistantMsg);

    return { message: assistantMsg };
  }

  getHistory(sessionId: string): ChatMessage[] {
    return this.sessions.get(sessionId)?.messages || [];
  }

  clearSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    return Promise.resolve();
  }

  // Helper for future Memory features
  getSessionContext(sessionId: string, maxMessages: number = 12): Array<{ role: string; content: string }> {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.messages.slice(-maxMessages).map(m => ({
      role: m.role,
      content: m.content
    }));
  }
}