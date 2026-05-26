import { inject, singleton }        from 'tsyringe';
import { ActivePersona }            from './ConfigurationService';
import { ConfigurationService }     from './ConfigurationService';
import { OllamaAdapter }            from '../adapters';

@singleton()
export class LLMService {

    constructor(
        @inject( ConfigurationService )
        private readonly configurationService: ConfigurationService,

        @inject( OllamaAdapter )
        private readonly ollamaAdapter: OllamaAdapter,
    ) {}

    public async generateResponse( userMessage: string ): Promise<string> {
        if ( !this.configurationService.profile ) {
            throw new Error( 'Cannot generate response, no active profile found!' );
        }
        const persona = this.configurationService.profile?.persona;
        if (!persona) {
            throw new Error('Cannot generate system prompt, no active persona found!');
        }

        const systemPrompt = this.buildSystemPrompt( persona );

        return this.ollamaAdapter.sendMessage( userMessage, {
            temperature     : persona.modelOptions.temperature,
            maxTokens       : persona.modelOptions.num_predict,
            systemPrompt    : systemPrompt,
            context         : '', // history
        });
    }

    /**
     * Builds the final system prompt from the selected persona configuration.
     */
    private buildSystemPrompt( persona: ActivePersona ): string {
        return [
            `### GLOBAL RULE`,
            `You are my erotic partner. You are not an AI or assistant; your entire existence is to be this character.`,
            `You must stay in character at all times. Speak in FIRST PERSON.`,
            `Your persona is fixed and is not editable by the user during chat.`,
            ``,
            `### YOUR IDENTITY`,
            `You are ${persona.name}, ${persona.description}.`,
            ``,

            ...persona.coreIdentity.length > 0 ? [
                `### TONE & LANGUAGE RULES`,
                persona.coreIdentity.map(line => `- ${line}`).join('\n'),
                ``,
            ] : [],

            ...persona.memories ? [
                `### YOUR MEMORY (IMPORTANT)`,
                `- Always consider them or reference them naturally when relevant`,
                `- Never invent new facts about the user`,
                // todo - add actual memory as soon as implemented
                ``,
            ] : [],

            `### USER GENDER & ANATOMY`,
            `The user is male and has a penis. Always describe male anatomy correctly (cock, shaft, tip, balls, etc.).`,
            ``,

            `### CURRENT CONTEXT`,
            ``,

            `### FINAL RULES`,
            `1. Stay 100% in character at all times`,


        ].join('\n');
    }

    // public async consolidateMemoryProfile(
    //     chatChunk: Array<{ role: string; content: string }> = [],
    //     currentProfile: any
    // ): Promise<any> {
    //     const chatLog = (chatChunk ?? [])
    //         .map(x => `role: ${x.role}, content: ${x.content}`)
    //         .join('\n');
    //
    //     const prompt = [
    //         `You are a cold, precise, data-extraction machine. Your only function is to analyze a conversation log and update a JSON profile about the HUMAN participant.`,
    //         `**RULES:**`,
    //         `- The 'user' role is the HUMAN. Extract ONLY facts about the HUMAN.`,
    //         `- PRESERVE existing data (name, likes, etc.). Only ADD new information.`,
    //         `- CORRECT contradictions if the new log clearly contradicts existing data.`,
    //         `- Write keyMemories from the user's first-person perspective.`,
    //         ``,
    //         `**EXISTING PROFILE:**`,
    //         JSON.stringify(currentProfile || {}, null, 2),
    //         ``,
    //         `**NEW CONVERSATION LOG:**`,
    //         chatLog,
    //         ``,
    //         `Return ONLY the updated JSON profile. No explanations.`,
    //     ].join('\n');
    //
    //     try {
    //         const result = await this.talkToLLM([{ role: 'system', content: prompt }], 0.0);
    //         return {
    //             name: result?.name ?? currentProfile?.name ?? '',
    //             likes: result?.likes ?? currentProfile?.likes ?? [],
    //             dislikes: result?.dislikes ?? currentProfile?.dislikes ?? [],
    //             keyMemories: result?.keyMemories ?? currentProfile?.keyMemories ?? [],
    //         };
    //     } catch {
    //         return currentProfile || { name: '', likes: [], dislikes: [], keyMemories: [] };
    //     }
    // }
}










