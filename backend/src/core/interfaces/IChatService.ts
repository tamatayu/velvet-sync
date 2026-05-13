export interface IChatService {
    sendUserMessage(sessionId: string, content: string): Promise<ChatResponse>;
    getHistory(sessionId: string): Promise<ChatMessage[]>;
    clearSession(sessionId: string): Promise<void>;
}

export type ChatMessage = {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'thought';
    content: string;
    timestamp: Date;
};

export type ChatResponse = {
    message: ChatMessage;
    thought?: string;           // für spätere AI Thoughts
};