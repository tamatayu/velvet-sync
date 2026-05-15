import { injectable } from 'tsyringe';

export type QuestionType = 
  | 'holding_up'           // "How are you holding up?"
  | 'ready_to_continue'    // "Are you ready to continue?"
  | 'want_extension'       // "Do you want to go a bit longer?"
  | 'ready_for_reward';    // "Are you ready for your reward?"

@injectable()
export class AIQuestionService {
  
  /**
   * Entscheidet, ob eine Frage gestellt werden soll
   * @param questionType Art der Frage
   * @param difficulty Schwierigkeit der Persona (0-100)
   * @returns true = Frage stellen, false = nicht stellen
   */
  shouldAskQuestion(questionType: QuestionType, difficulty: number = 50): boolean {
    // Basis-Wahrscheinlichkeit je nach Fragetyp
    let baseProbability = 0.7;

    switch (questionType) {
      case 'holding_up':
        baseProbability = 0.65;
        break;
      case 'ready_to_continue':
        baseProbability = 0.75;
        break;
      case 'want_extension':
        baseProbability = 0.8;
        break;
      case 'ready_for_reward':
        baseProbability = 0.9; // Fast immer fragen
        break;
    }

    // Je höher die Difficulty, desto unwahrscheinlicher die Frage
    const adjustedProbability = baseProbability * (1 - (difficulty / 150));

    return Math.random() < Math.max(0.2, adjustedProbability);
  }

  /**
   * Gibt den Basis-Prompt für einen Fragetyp zurück
   * (später kann hier Persona-spezifisch angepasst werden)
   */
  getPrompt(questionType: QuestionType): string {
    switch (questionType) {
      case 'holding_up':
        return "How are you holding up?";
      case 'ready_to_continue':
        return "Are you ready to continue?";
      case 'want_extension':
        return "Do you want to go a bit longer before I reward you?";
      case 'ready_for_reward':
        return "Are you ready for your reward?";
      default:
        return "How are you feeling?";
    }
  }

  /**
   * Simuliert eine AI-Antwort (später durch echten LLM-Call ersetzen)
   */
  async getAIResponse(questionType: QuestionType, context: string = ''): Promise<string> {
    // Placeholder - später mit echtem LLM
    const responses = {
      'holding_up': ["I'm doing okay...", "It's getting intense...", "I can still take more"],
      'ready_to_continue': ["Yes", "Please continue", "I'm ready"],
      'want_extension': ["Yes please", "A bit longer", "Not yet"],
      'ready_for_reward': ["Yes", "Please", "I'm ready"]
    };

    const possibleAnswers = responses[questionType] || ["Yes"];
    return possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
  }
}