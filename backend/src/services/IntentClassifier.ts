import {injectable} from 'tsyringe';
import axios        from 'axios';

export type UserIntent =
    | 'none'
    | 'request_mode_edging'
    | 'request_mode_stopgo'
    | 'request_mode_challenge'
    | 'confirm_ready'
    | 'signal_close'
    | 'signal_orgasm'
    | 'signal_stop'
    | 'signal_faster'
    | 'signal_slower'
    | 'signal_deeper'
    | 'request_milking';

export interface IntentResult {
    intent: UserIntent;
    confidence: number; // 0-1
    reason?: string;
}

@injectable()
export class IntentClassifier {
    private readonly ollamaHost: string;

    constructor() {
        this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    }

    async classify(userMessage: string, context?: string): Promise<IntentResult> {
        const prompt = `You are an extremely fast and precise intent classifier for an erotic chat.
            Analyze the user's message and return ONLY valid JSON.
            
            Possible intents:
            - "none"
            - "request_mode_edging" (user wants edging)
            - "request_mode_stopgo" (user wants stop and go)
            - "request_mode_challenge" (user wants stamina challenge)
            - "confirm_ready" (user confirms he is ready to start)
            - "signal_close" (user is getting close to orgasm)
            - "signal_orgasm" (user is orgasming / cumming)
            - "signal_stop" (user wants to stop or pause)
            - "signal_faster" / "signal_slower" / "signal_deeper"
            - "request_milking" (user wants to be milked dry)
            
            User message: "${userMessage}"
            ${context ? `Context: ${context}` : ''}
            
            Return ONLY this JSON:
            {
              "intent": "<one of the intents above>",
              "confidence": <0.0 to 1.0>,
              "reason": "<short reason>"
            }
        `;

        try {
            const response = await axios.post(`${this.ollamaHost}/api/generate`, {
                model: 'llama3.2:3b',
                prompt,
                stream: false,
                options: {temperature: 0.1, num_predict: 150}
            });

            const content   = response.data.response;
            const jsonMatch = content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    intent: parsed.intent || 'none',
                    confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
                    reason: parsed.reason
                };
            }
        } catch (e) {
            console.error('[IntentClassifier] Error:', e);
        }

        return {intent: 'none', confidence: 0};
    }
}