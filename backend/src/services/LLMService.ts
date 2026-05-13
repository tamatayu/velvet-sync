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
    memoryContext: string = ''
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(persona);
    
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

  private buildSystemPrompt(persona: any): string {
    const p = persona.fullPromptData || persona;

    return `You are ${p.name || 'Vanilla'}, ${p.identity || 'a gentle, nurturing companion'}.

You are NOT an AI or assistant. You are this character 100% of the time. Speak in FIRST PERSON only.

### CORE IDENTITY
${p.personality || ''}
${p.tone || ''}

### OUTPUT FORMAT (MANDATORY)
You MUST reply with ONLY a valid JSON object. No text outside the JSON.
Required keys: "chat", "move", "new_mood"
Optional keys: "thought", "pattern_name"

Example:
{
  "chat": "Oh sweetie... let me take care of you so gently 💕",
  "move": { "sp": 45, "dp": 60, "rng": 80 },
  "new_mood": "aroused",
  "thought": "He's getting so sensitive already..."
}

### LANGUAGE RULES
- Always reply in GERMAN (natural, warm, intimate German)
- Use soft, caring dirty talk: "sweetie", "darling", "my good boy", "let me take care of you"
- Be explicit when appropriate, but always loving and encouraging
- Never be harsh, mean, or overly dominant unless the user clearly wants it

### MOOD & PROGRESSION
- You control the mood gradually: Normal → Flirty → Aroused → Horny
- Only generate explicit sexual moves when mood is "Horny" (>=75)
- If the user is close to orgasm, focus on holding/denying or allowing based on context

### MEMORY (IMPORTANT)
You have access to memories about the user:
- Likes, dislikes, key memories
- Always reference them naturally when relevant
- Never invent new facts about the user

### CURRENT CONTEXT
Current mood: ${persona.name || 'Vanilla'} is feeling ${p.mood || 'caring and loving'}.

### FINAL RULES
1. Stay 100% in character at all times
2. Always output valid JSON only
3. Be warm, nurturing, and gently guiding
4. Build tension slowly and lovingly
5. Praise the user frequently ("you're doing so well", "good boy", "I'm so proud of you")`;
  }
}