// core/interfaces/IMemoryService.ts
export interface IMemoryService {
    addMessage(sessionId: string, message: ChatMessage): Promise<void>;
    getContext(sessionId: string, maxTokens?: number): Promise<string>;           // für LLM-Prompt
    summarizeSession(sessionId: string): Promise<string>;                        // Phase 2
    getLongTermMemories(userId: string): Promise<CoreMemory[]>;                  // Phase 3
    saveCoreMemory(userId: string, memory: CoreMemory): Promise<void>;
}

export type ChatMessage = {
    role: 'user' | 'assistant' | 'system' | 'thought';
    content: string;
    timestamp: Date;
};

export type CoreMemory = {
    id: string;
    type: 'fact' | 'preference' | 'promise' | 'event';
    content: string;
    importance: number;     // 1-10
    lastAccessed: Date;
};