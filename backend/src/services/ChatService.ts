import { injectable, inject } from 'tsyringe';
import { LLMService } from './LLMService';
import { PersonaService } from './PersonaService';
import { MemoryService } from './MemoryService';
import { ModeManager } from './ModeManager';
import { IChatService, ChatMessage, ChatResponse } from '../core/interfaces/IChatService';

interface SessionData {
  messages: ChatMessage[];
  lastActivity: Date;
  personaId: string;
  structuredMemory?: any;
  userSettings?: any;
}

@injectable()
export class ChatService implements IChatService {
  private sessions = new Map<string, SessionData>();

  constructor(
    @inject(LLMService) private llmService: LLMService,
    @inject(PersonaService) private personaService: PersonaService,
    @inject(MemoryService) private memoryService: MemoryService,
    @inject(ModeManager) private modeManager: ModeManager
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

    // === BESTE AKTUELLE LÖSUNG (Short + Structured + Long-term Memory) ===

    // 1. Short-term: Last 10 messages (full detail)
    const lastMessages = session.messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    // 2. Structured Memory (Likes / Dislikes / KeyMemories)
    const recentForProfile = session.messages.slice(-15);
    const structuredMemory = await this.llmService.consolidateMemoryProfile(
      recentForProfile,
      session.structuredMemory || {}
    );
    session.structuredMemory = structuredMemory; // cache it

    // 3. Long-term: Compressed older sessions (max 2)
    const oldSessionSummaries = this.memoryService.getRelevantMemories(sessionId, 2);

    // Build final memory context for the prompt
    let memoryBlock = '';
    if (structuredMemory && (structuredMemory.likes?.length || structuredMemory.keyMemories?.length)) {
      memoryBlock += `### ABOUT THE USER (structured memory):\n`;
      if (structuredMemory.likes?.length) memoryBlock += `Likes: ${structuredMemory.likes.join(', ')}\n`;
      if (structuredMemory.dislikes?.length) memoryBlock += `Dislikes: ${structuredMemory.dislikes.join(', ')}\n`;
      if (structuredMemory.keyMemories?.length) memoryBlock += `Key memories: ${structuredMemory.keyMemories.join(' | ')}\n`;
    }
    if (oldSessionSummaries) {
      memoryBlock += `\n### OLDER SESSIONS (compressed):\n${oldSessionSummaries}`;
    }

    // Generate AI response
    const persona = this.personaService.getPersonaById(session.personaId) || this.personaService.getDefaultPersona();

    // Load user settings
    const userSettings = session.userSettings || JSON.parse(localStorage.getItem('velvet-settings') || '{}');

    const aiResponseText = await this.llmService.generateResponse(
      sessionId,
      content,
      persona,
      lastMessages,
      memoryBlock,
      userSettings.gender,
      userSettings.name
    );

    // Add assistant message
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date()
    };
    session.messages.push(assistantMsg);

    // Auto-summarize every 8 messages (Memory Phase 2)
    if (session.messages.length % 8 === 0) {
      this.memoryService.summarizeSession(sessionId);
    }

    return { message: assistantMsg };
  }

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
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