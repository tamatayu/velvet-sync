import { injectable, inject } from 'tsyringe';
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import { ChatService } from './ChatService';

interface SessionSummary {
  sessionId: string;
  summary: string;
  keyEvents: string[];
  userPreferences: string[];
  createdAt: Date;
  lastUpdated: Date;
}

@injectable()
export class MemoryService {
  private readonly ollamaHost: string;
  private readonly summaryModel: string;
  private readonly summariesFile: string;
  private summaries: Map<string, SessionSummary> = new Map();

  constructor(@inject(ChatService) private chatService: ChatService) {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.summaryModel = 'llama3.2:3b'; // Small fast model for summarization
    this.summariesFile = path.resolve('data/session-summaries.json');
    this.loadSummaries();
  }

  private loadSummaries() {
    try {
      if (fs.existsSync(this.summariesFile)) {
        const data = JSON.parse(fs.readFileSync(this.summariesFile, 'utf8'));
        data.forEach((s: any) => {
          this.summaries.set(s.sessionId, {
            ...s,
            createdAt: new Date(s.createdAt),
            lastUpdated: new Date(s.lastUpdated)
          });
        });
      }
    } catch (e) {
      console.warn('[MemoryService] Could not load summaries');
    }
  }

  private saveSummaries() {
    try {
      const dir = path.dirname(this.summariesFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.summariesFile, JSON.stringify(Array.from(this.summaries.values()), null, 2));
    } catch (e) {
      console.error('[MemoryService] Failed to save summaries');
    }
  }

  /**
   * Creates a summary of the current session using a small fast model
   */
  async summarizeSession(sessionId: string): Promise<SessionSummary | null> {
    const messages = this.chatService.getHistory(sessionId);
    if (messages.length < 4) return null; // Too short to summarize

    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Zusammenfasse das folgende erotische Rollenspiel-Gespräch kurz und prägnant.

Wichtige Punkte:
- Welche Stimmung/Intensität hatte die Session?
- Gab es besondere Wünsche oder Grenzen des Users?
- Wie hat die AI reagiert (dominant, teasing, fürsorglich...)?
- Offene Themen oder Versprechen

Gib die Antwort als JSON:
{
  "summary": "Kurze 2-3 Sätze Zusammenfassung",
  "keyEvents": ["Ereignis 1", "Ereignis 2"],
  "userPreferences": ["Präferenz 1", "Präferenz 2"]
}

Gespräch:
${conversationText}`;

    try {
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model: this.summaryModel,
        prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 400 }
      });

      const jsonMatch = response.data.response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);

      const summary: SessionSummary = {
        sessionId,
        summary: parsed.summary || 'Keine Zusammenfassung verfügbar.',
        keyEvents: parsed.keyEvents || [],
        userPreferences: parsed.userPreferences || [],
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      this.summaries.set(sessionId, summary);
      this.saveSummaries();

      return summary;
    } catch (e) {
      console.error('[MemoryService] Summarization failed:', e);
      return null;
    }
  }

  /**
   * Returns relevant memories for a new session (older sessions get more compressed)
   */
  getRelevantMemories(currentSessionId: string, maxMemories: number = 3): string {
    const allSummaries = Array.from(this.summaries.values())
      .filter(s => s.sessionId !== currentSessionId)
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

    if (allSummaries.length === 0) return '';

    // Take the most recent ones, but compress older ones more
    const selected = allSummaries.slice(0, maxMemories);

    let memoryText = 'Erinnerungen an frühere Gespräche:\n\n';

    selected.forEach((s, index) => {
      const ageDays = Math.floor((Date.now() - s.lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
      const compression = ageDays > 7 ? ' (etwas vage)' : ageDays > 3 ? ' (teilweise erinnert)' : '';

      memoryText += `- ${s.summary}${compression}\n`;
      if (s.userPreferences.length > 0) {
        memoryText += `  Präferenzen: ${s.userPreferences.join(', ')}\n`;
      }
    });

    return memoryText;
  }

  getSessionSummary(sessionId: string): SessionSummary | undefined {
    return this.summaries.get(sessionId);
  }
}