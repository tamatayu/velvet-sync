import { inject, injectable }                      from 'tsyringe';
import { LLMService }                              from './LLMService';
import { PersonaService }                          from './PersonaService';
import { MemoryService }                           from './MemoryService';
import { ChatMessage, ChatResponse, IChatService } from '../core/interfaces';

interface SessionData {
    messages: ChatMessage[];
    lastActivity: Date;
    personaId: string;
    structuredMemory?: any;
    userSettings?: any;
    pendingModeStart?: string;
}

@injectable()
export class ChatService implements IChatService {
    private sessions = new Map<string, SessionData>();

    constructor(
        @inject( LLMService )
        private llmService: LLMService,
        @inject( PersonaService )
        private personaService: PersonaService,
        @inject( MemoryService )
        private memoryService: MemoryService,
    ) {}

    async sendUserMessage( sessionId: string, content: string ): Promise<ChatResponse> {

        // Get or create session
        const session = this.sessions.get( sessionId );
        if (!session) {
            throw new Error( 'Session not found' );
        }

        // Add user message
        const userMsg: ChatMessage = {
            id        : Date.now().toString(),
            role      : 'user',
            content,
            timestamp : new Date()
        };
        session.messages.push( userMsg );
        session.lastActivity = new Date();

        // 1. Short-term: Last 10 messages (full detail)
        const lastMessages = session.messages.slice( -10 ).map( m => ( {
            role    : m.role === 'user' ? 'user' : 'assistant',
            content : m.content
        } ) );

        // 2. Structured Memory (Likes / Dislikes / KeyMemories)
        const recentForProfile   = session.messages.slice( -15 );
        const structuredMemory   = await this.llmService.consolidateMemoryProfile(
            recentForProfile,
            session.structuredMemory || {}
        );
        session.structuredMemory = structuredMemory; // cache it

        // 3. Long-term: Compressed older sessions (max 2)
        const oldSessionSummaries = this.memoryService.getRelevantMemories( sessionId, 2 );

        // Build final memory context for the prompt
        let memoryBlock = '';
        if ( structuredMemory && ( structuredMemory.likes?.length || structuredMemory.keyMemories?.length ) ) {
            memoryBlock += `### ABOUT THE USER (structured memory):\n`;
            if ( structuredMemory.likes?.length ) memoryBlock += `Likes: ${ structuredMemory.likes.join( ', ' ) }\n`;
            if ( structuredMemory.dislikes?.length ) memoryBlock += `Dislikes: ${ structuredMemory.dislikes.join( ', ' ) }\n`;
            if ( structuredMemory.keyMemories?.length ) memoryBlock += `Key memories: ${ structuredMemory.keyMemories.join( ' | ' ) }\n`;
        }
        if ( oldSessionSummaries ) {
            memoryBlock += `\n### OLDER SESSIONS (compressed):\n${ oldSessionSummaries }`;
        }

        // Generate AI response
        const persona = this.personaService.getPersonaById( session.personaId );

        // Load user settings
        const userSettings = session.userSettings || JSON.parse( localStorage.getItem( 'velvet-settings' ) || '{}' );

        const aiResponseText = await this.llmService.generateResponse(
            sessionId,
            content,
            persona,
            lastMessages,
            memoryBlock,
            userSettings.gender,
            userSettings.name
        );

        const assistantMsg: ChatMessage = {
            id        : ( Date.now() + 1 ).toString(),
            role      : 'assistant',
            content   : aiResponseText,
            timestamp : new Date()
        };
        session.messages.push( assistantMsg );

        return { message : assistantMsg };
    }

    async getHistory( sessionId: string ): Promise<ChatMessage[]> {
        return this.sessions.get( sessionId )?.messages || [];
    }

    clearSession( sessionId: string ): Promise<void> {
        this.sessions.delete( sessionId );
        return Promise.resolve();
    }
}