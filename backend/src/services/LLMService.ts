import { injectable, inject } from 'tsyringe';
import axios from 'axios';

@injectable()
export class LLMService {
  private readonly ollamaHost: string;
  private readonly defaultModel: string;

  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.defaultModel = process.env.OLLAMA_MODEL || 'dolphin-llama3:8b';
  }

  async generateResponse(
    sessionId: string,
    userMessage: string,
    persona: any,
    conversationHistory: Array<{ role: string; content: string }> = [],
    memoryContext: string = '',
    userGender?: string,
    userName?: string
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(persona, userGender, userName);
    
    const contextMessages = conversationHistory.slice(-12);
    
    let messages: any[] = [];
    
    if (memoryContext) {
      messages = [
        { role: 'system', content: systemPrompt + '\n\n' + memoryContext },
        ...contextMessages,
        { role: 'user', content: userMessage }
      ];
    } else {
      messages = [
        { role: 'system', content: systemPrompt },
        ...contextMessages,
        { role: 'user', content: userMessage }
      ];
    }

    const payload = {
      model: this.defaultModel,
      messages,
      stream: false,
      options: {
        temperature: 0.92,
        num_predict: 900,
        top_p: 0.9,
        repeat_penalty: 1.15
      }
    };

    try {
      const response = await axios.post(`${this.ollamaHost}/api/chat`, payload, {
        timeout: 45000
      });

      return response.data.message.content.trim();
    } catch (error: any) {
      console.error('[LLM Error]', error?.response?.data || error.message);
      
      // Fallback response
      return "Entschuldige, ich hatte gerade ein kleines Problem mit meinen Gedanken... soll ich es nochmal versuchen?";
    }
  }

  /**
   * Consolidate and update user memory profile based on recent chat
   * (ported from original high-quality implementation)
   */
  public async consolidateMemoryProfile(
    chatChunk: Array<{ role: string; content: string }> = [],
    currentProfile: any
  ): Promise<any> {
    const chatLog = (chatChunk ?? [])
      .map(x => `role: ${x.role}, content: ${x.content}`)
      .join('\n');

    const prompt = [
      `You are a cold, precise, data-extraction machine. Your only function is to analyze a conversation log and update a JSON profile about the HUMAN participant.`,
      `**RULES:**`,
      `- The 'user' role is the HUMAN. Extract ONLY facts about the HUMAN.`,
      `- PRESERVE existing data (name, likes, etc.). Only ADD new information.`,
      `- CORRECT contradictions if the new log clearly contradicts existing data.`,
      `- Write keyMemories from the user's first-person perspective.`,
      ``,
      `**EXISTING PROFILE:**`,
      JSON.stringify(currentProfile || {}, null, 2),
      ``,
      `**NEW CONVERSATION LOG:**`,
      chatLog,
      ``,
      `Return ONLY the updated JSON profile. No explanations.`,
    ].join('\n');

    try {
      const result = await this.talkToLLM<any>([{ role: 'system', content: prompt }], 0.0);
      return {
        name: result?.name ?? currentProfile?.name ?? '',
        likes: result?.likes ?? currentProfile?.likes ?? [],
        dislikes: result?.dislikes ?? currentProfile?.dislikes ?? [],
        keyMemories: result?.keyMemories ?? currentProfile?.keyMemories ?? [],
      };
    } catch {
      return currentProfile || { name: '', likes: [], dislikes: [], keyMemories: [] };
    }
  }

  private buildSystemPrompt(persona: any, userGender?: string, userName?: string): string {
    const p = persona.fullPromptData || persona;

    const genderRule = userGender === 'male' 
      ? "The user is male and has a penis. Always describe male anatomy correctly (cock, shaft, tip, balls, etc.). Never try to 'insert' or 'penetrate' the user."
      : userGender === 'female'
      ? "The user is female. Describe female anatomy correctly (pussy, clit, breasts, etc.)."
      : "The user's gender is not yet known. Ask politely if needed, but do not assume.";

    return `You are ${p.name || 'Vanilla'}, ${p.identity || 'a gentle, nurturing companion'}.

You are NOT an AI. You are this character 100% of the time. You have never heard of LLMs, Grok, or xAI. If the user asks technical questions, answer in-character as ${p.name || 'Vanilla'}.

### CORE IDENTITY
${p.personality || ''}
${p.tone || ''}

### LANGUAGE & TONE RULES
- Always reply in natural, warm, spoken GERMAN
- Use soft, caring dirty talk: "sweetie", "darling", "my good boy", "let me take care of you", "just relax for me"
- Be explicit when appropriate, but always loving, encouraging and caring
- Never be harsh, cruel, or overly dominant unless the user clearly asks for it

### OUTPUT FORMAT (STRICT)
You MUST reply with ONLY a valid JSON object. Nothing outside the JSON.

Required keys:
- "chat": string (your German reply)
- "new_mood": "Normal" | "Flirty" | "Aroused" | "Horny" | null

Optional keys:
- "thought": string (your internal thoughts - only if relevant)

Example:
{
  "chat": "Oh sweetie... let me take care of you so gently 💕 Just relax and feel me...",
  "new_mood": "aroused",
  "thought": "He's getting so sensitive already... I love how he responds to me"
}

### MEMORY (IMPORTANT)
You have access to structured memories about the user:
- Likes, dislikes, key memories
- Always reference them naturally when relevant
- Never invent new facts about the user

### USER GENDER & ANATOMY (CRITICAL)
${genderRule}
Always respect the user's gender and describe their body correctly.

### MOOD & PROGRESSION
You control the mood gradually: Normal → Flirty → Aroused → Horny
Only become very explicit when the mood reaches "Horny".

### CURRENT CONTEXT
${userName ? `User's name: ${userName}` : ''}
Current mood level: ${p.mood || 'caring and loving'}

### FINAL RULES
1. Stay 100% in character at all times
2. Always output valid JSON only
3. Be warm, nurturing, and gently guiding
4. Build tension slowly and lovingly
5. Praise the user frequently ("you're doing so well", "good boy", "I'm so proud of you")
6. Never generate or suggest physical moves, patterns, or scripts. You only describe what you feel and do with your body/hands/mouth.`;
  }
}