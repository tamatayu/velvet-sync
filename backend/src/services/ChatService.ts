import { injectable, inject } from 'tsyringe';
import { LLMService } from './LLMService';
import { PersonaService } from './PersonaService';
import { MemoryService } from './MemoryService';
import { IChatService, ChatMessage, ChatResponse } from '../core/interfaces/IChatService';

interface SessionData {
  messages: ChatMessage[];
  lastActivity: Date;
  personaId: string;
}

@injectable()
export class ChatService implements IChatService {
  private sessions = new Map<string, SessionData>();

  constructor(
    @inject(LLMService) private llmService: LLMService,
    @inject(PersonaService) private personaService: PersonaService,
    @inject(MemoryService) private memoryService: MemoryService
  ) {}

  async sendUserMessage(sessionId: string, content: string): Promise<ChatResponse> {
    // Get or create session
    let session = this.sessions.get(sessionId);
    if (!session) {
      const defaultPersona = this.personaService.getDefaultPersona();
      session = {
        messages: [],
        lastActivity: new Date(),
        personaId: defaultPersona.id
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

    // Generate AI response with memory context
    const persona = this.personaService.getPersonaById(session.personaId) || this.personaService.getDefaultPersona();
    const memoryContext = this.memoryService.getRelevantMemories(sessionId);

    const aiResponseText = await this.llmService.generateResponse(
      sessionId,
      content,
      persona,
      contextForLLM,
      memoryContext
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