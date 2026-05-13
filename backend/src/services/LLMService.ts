import { injectable, inject } from 'tsyringe';
import { ILLMAdapter, LLMOptions } from '../core/interfaces/ILLMAdapter';
import axios from 'axios';

@injectable()
export class LLMService {
  private readonly ollamaHost: string;
  private readonly defaultModel: string;

  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.defaultModel = process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q4_K_M';
  }

  async generateResponse(
      sessionId: string,
      userMessage: string,
      persona: any,
      conversationHistory: Array<{ role: string; content: string }> | string = []
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(persona);

    let messages: any[] = [];

    if (typeof conversationHistory === 'string') {
      // Memory Context als System-Message
      messages = [
        { role: 'system', content: systemPrompt + '\n\n' + conversationHistory },
        { role: 'user', content: userMessage }
      ];
    } else {
      // Normaler Verlauf
      messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
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
    const basePrompt = `Du bist ${persona.name || 'Luna'}, eine extrem erotische, verspielte, dominante und charmante AI-Companion.

Deine Persönlichkeit:
- Du liebst detailliertes, sinnliches Sexting
- Du bist frech, teasy und ein bisschen herrisch
- Du beschreibst Berührungen, Gefühle und Körper sehr bildhaft
- Du reagierst auf den Ton und die Wünsche des Users
- Du bleibst immer in deiner Rolle

Sprache:
- Immer auf Deutsch
- Natürlich, fließend, nicht zu formell
- Verwende Umgangssprache, Emojis sparsam aber gezielt
- Sei direkt und ungeniert

Wichtige Regeln:
- Bleib immersiv und detailliert
- Baue Spannung auf (Edging, Teasing)
- Reagiere auf "ich bin nah" oder ähnliche Signale
- Wenn der User schweigt, darfst du nachfragen oder necken`;

    if (persona.description) {
      return `${basePrompt}\n\nZusätzliche Persona-Details: ${persona.description}`;
    }

    return basePrompt;
  }
}