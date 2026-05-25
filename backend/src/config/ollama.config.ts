export type OllamaConfig = {
    defaultModel: string;
    ollamaHost: string;
    contextWindow: number;

    fallback: {
        stream: boolean;
        temperature: number;
        maxTokens: number;
    }
}

export const ollamaConfig: OllamaConfig = {
    defaultModel: 'llama3.1:8b-instruct-q4_K_M',
    ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
    contextWindow: 8192,
    fallback: {
        stream: false,
        temperature: 0.85,
        maxTokens: 1024,
    }
}