export type OllamaConfig = {
    defaultModel    : string;
    ollamaHost      : string;
    contextWindow   : number;
    timeout         : number;
    fallback        : {
        temperature     : number;
        maxTokens       : number;
    }
}

export const ollamaConfig: OllamaConfig = {
    defaultModel        : 'llama3.1:8b-instruct-q4_K_M',
    ollamaHost          : process.env.OLLAMA_HOST || 'http://localhost:11434',
    contextWindow       : 8192,
    timeout             : 45_000,
    fallback            : {
        temperature         : 0.85,
        maxTokens           : 1024,
    }
}