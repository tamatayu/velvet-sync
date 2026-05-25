import { inject }                                  from 'tsyringe';
import { singleton }                               from 'tsyringe';
import { ChatMessage, ChatResponse, IChatService } from '../core/interfaces';
import { ConfigurationService }                    from './ConfigurationService';
import { LLMService }                              from './LLMService';

/**
 * ToDo :: Langzeit-Memory
 *         Memory-Consolidation
 *         Modi
 *         Intent-Erkennung
 *         komplexe Persona-Memory-Updates
 */

interface SessionData {
    messages: ChatMessage[];
    lastActivity: Date;
}

@singleton()
export class ChatService implements IChatService {
    private readonly sessions = new Map<string, SessionData>();

    constructor(
        @inject( LLMService )
        private readonly llmService: LLMService,
        @inject( ConfigurationService )
        private readonly configurationService: ConfigurationService,
    ) {}

    /**
     * Sends a user message to the active LLM persona and stores the conversation in memory.
     */
    public async sendUserMessage(
        sessionId: string,
        content: string,
    ): Promise<ChatResponse> {
        const activeProfile = this.configurationService.profile;

        if ( !activeProfile ) {
            throw new Error( 'No active profile configured for this server session.' );
        }

        const session = this.getOrCreateSession( sessionId );

        const userMessage: ChatMessage = {
            id        : this.createMessageId(),
            role      : 'user',
            content,
            timestamp : new Date(),
        };

        session.messages.push( userMessage );
        session.lastActivity = new Date();

        const conversationHistory = session.messages
            .slice( -10 )
            .map( message => {
                return {
                    role    : message.role === 'user' ? 'user' : 'assistant',
                    content : message.content,
                };
            } );

        const aiResponseText = await this.llmService.generateResponse(
            sessionId,
            content,
            activeProfile.personaConfig,
            conversationHistory,
            '',
            undefined,
            activeProfile.userConfig.userName,
        );

        const assistantMessage: ChatMessage = {
            id        : this.createMessageId(),
            role      : 'assistant',
            content   : aiResponseText,
            timestamp : new Date(),
        };

        session.messages.push( assistantMessage );
        session.lastActivity = new Date();

        return {
            message : assistantMessage,
        };
    }

    /**
     * Returns the message history for a session.
     */
    public async getHistory( sessionId: string ): Promise<ChatMessage[]> {
        return this.sessions.get( sessionId )?.messages ?? [];
    }

    /**
     * Clears all messages and metadata for a session.
     */
    public async clearSession( sessionId: string ): Promise<void> {
        this.sessions.delete( sessionId );
    }

    /**
     * Returns an existing session or creates a new empty session.
     */
    private getOrCreateSession( sessionId: string ): SessionData {
        const existingSession = this.sessions.get( sessionId );

        if ( existingSession ) {
            return existingSession;
        }

        const newSession: SessionData = {
            messages     : [],
            lastActivity : new Date(),
        };

        this.sessions.set( sessionId, newSession );

        return newSession;
    }

    /**
     * Creates a simple unique message id.
     */
    private createMessageId(): string {
        return `${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;
    }
}