// core/interfaces/IThoughtService.ts
export interface IThoughtService {
    generateThought(sessionId: string, context: string): Promise<string | null>;
    shouldGenerateThought(lastMessageAgeMs: number, mood?: number): boolean;
}