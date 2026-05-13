export interface ILLMAdapter {
    sendMessage(prompt: string, options?: LLMOptions): Promise<string>;
    getModelInfo(): Promise<{ model: string; contextWindow: number }>;
}

export type LLMOptions = {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    context?: string;           // vorherige Nachrichten als String
};