import { IModeModule, ModeType } from './IModeModule';
import { container } from 'tsyringe';
import { ModeConfigService, StopGoConfig } from '../services/ModeConfigService';
import { AIQuestionService, QuestionType } from '../services/AIQuestionService';
import { PersonaService } from '../services/PersonaService';

export class StopAndGoModule implements IModeModule {
  readonly name = 'Stop & Go';
  readonly type: ModeType = 'stopgo';

  // Core state
  private phase: 'go' | 'stop' | 'milking' | 'final' = 'go';
  private phaseStartTime: number = Date.now();
  private minDuration: number = 0;
  private targetEndTime: number = 0;
  private intensityLevel: number = 10;

  // Milking & Orgasm tracking
  private milkingRequested: boolean = false;
  private milkingStartTime: number = 0;
  private firstOrgasmTime: number = 0;
  private hasMilked: boolean = false;

  // Session flags
  private hasAskedAtMinDuration: boolean = false;
  private hasOfferedExtension: boolean = false;
  private inFinalPhase: boolean = false;
  private sessionCompleted: boolean = false;

  // Services
  private configService = container.resolve(ModeConfigService);
  private config: StopGoConfig;
  private questionService = container.resolve(AIQuestionService);
  private personaService = container.resolve(PersonaService);

  constructor() {
    this.config = this.configService.getStopGoConfig();
  }

  onStart(): void {
    this.phase = 'go';
    this.phaseStartTime = Date.now();
    this.intensityLevel = 10;
    this.hasAskedAtMinDuration = false;
    this.hasOfferedExtension = false;
    this.inFinalPhase = false;
    this.sessionCompleted = false;
    this.milkingRequested = false;
    this.firstOrgasmTime = 0;
    this.hasMilked = false;

    const variance = Math.max(60, this.config.durationVariance);
    const baseDuration = this.config.baseDuration;

    this.minDuration = Math.floor(baseDuration - variance);
    this.targetEndTime = this.minDuration + Math.max(60, variance);

    this.sendAIComment("Willkommen im Stop & Go Modus. Ich werde dich führen – GO wenn ich es sage, STOP wenn ich es sage. Halte durch bis zum Ende.");
    console.log(`[StopAndGo] Mode started. Min duration: ${this.minDuration}s, Target end: ${this.targetEndTime}s`);
  }

  onTick(): void {
    if (this.sessionCompleted) return;

    const now = Date.now();
    const elapsed = (now - this.phaseStartTime) / 1000;
    const totalElapsed = (now - (this.phaseStartTime - (this.minDuration - (this.targetEndTime - this.minDuration)))) / 1000; // approximate total

    // Intensity calculation (only outside milking/final special handling)
    if (this.phase !== 'milking' && !this.inFinalPhase) {
      if (elapsed < this.minDuration) {
        const progress = Math.min(1, elapsed / this.minDuration);
        this.intensityLevel = Math.floor(10 + (this.config.targetIntensityAtMinDuration - 10) * progress);
      } else {
        const remainingProgress = Math.min(1, (elapsed - this.minDuration) / (this.targetEndTime - this.minDuration));
        this.intensityLevel = Math.floor(this.config.targetIntensityAtMinDuration + (25 * remainingProgress));
      }
    }

    // === AI Frage bei MinDuration (75% Marke) ===
    if (!this.hasAskedAtMinDuration && elapsed >= this.minDuration && this.phase !== 'milking' && !this.inFinalPhase) {
      this.hasAskedAtMinDuration = true;

      const currentPersona = this.personaService.getCurrentPersona();
      const difficulty = currentPersona?.difficulty ?? 50;
      const shouldAsk = this.questionService.shouldAskQuestion('holding_up', difficulty);

      if (shouldAsk) {
        const prompt = this.questionService.getPrompt('holding_up');
        this.sendAIComment(prompt);
        // Später: Warte auf Antwort über onUserSignal oder separaten Callback
        console.log(`[StopAndGo] AI asked holding_up question (difficulty: ${difficulty})`);
      } else {
        console.log('[StopAndGo] No question asked (high difficulty)');
      }
    }

    // === Phasen-Wechsel (nur interne GO/STOP - keine AI Kommentare) ===
    if (!this.inFinalPhase && this.phase !== 'milking') {
      if (this.phase === 'go' && elapsed > 25 + Math.random() * 20) {
        this.switchToStop();
      } else if (this.phase === 'stop' && elapsed > 12 + Math.random() * 18) {
        this.switchToGo();
      }
    }

    // === Finale Phase Trigger ===
    if (!this.inFinalPhase && !this.milkingRequested && elapsed >= this.targetEndTime) {
      this.enterFinalPhase();
    }

    // === Milking Logik ===
    if (this.phase === 'milking' && this.firstOrgasmTime > 0) {
      const timeSinceFirst = (now - this.firstOrgasmTime) / 1000;
      if (timeSinceFirst > 30) {
        this.endMilkingPhase();
      }
    }

    // === Finale Phase: Intensität steigt weiter (keine Pausen) ===
    if (this.inFinalPhase) {
      const finalElapsed = (now - this.phaseStartTime) / 1000;
      this.intensityLevel = Math.min(100, Math.floor(70 + (finalElapsed / 20) * 30)); // Steigt langsam
    }
  }

  onUserSignal(signal: string): void {
    const lower = signal.toLowerCase().trim();

    if (lower.includes('milking') || lower.includes('milk me dry') || lower.includes('melken')) {
      this.requestMilking();
      return;
    }

    if (lower.includes('close') || lower.includes('nah') || lower.includes('komme') || lower.includes('fast')) {
      this.handleCloseSignal();
      return;
    }

    if (lower.includes('orgasm') || lower.includes('spritze') || lower.includes('komme') || lower.includes('cumming')) {
      this.handleOrgasmSignal();
      return;
    }

    // Normale Chat-Nachricht während Modus → AI reagiert (außer bei reinen GO/STOP Wechseln)
    if (this.phase !== 'go' && this.phase !== 'stop') {
      this.sendAIComment("Ich höre dich... sag mir, wie es dir geht.");
    }
  }

  requestMilking(): { accepted: boolean; extraTime: number } {
    if (this.milkingRequested || this.phase === 'milking' || this.hasMilked) {
      this.sendAIComment("Du hast dein Milking schon bekommen oder angefragt. Heute nicht nochmal.");
      return { accepted: false, extraTime: 0 };
    }

    this.milkingRequested = true;
    this.hasMilked = true;
    this.phase = 'milking';
    this.milkingStartTime = Date.now();
    this.firstOrgasmTime = 0;
    this.intensityLevel = this.config.intensityAfterExtension;

    // Verlängere die Session
    const extra = this.config.extensionBaseDuration + (Math.random() * this.config.extensionVariance);
    this.targetEndTime += extra;

    this.sendAIComment("Gut... du darfst länger. Ich melke dich richtig aus, wenn du es verdienst. Intensität auf 75% zurückgesetzt.");
    console.log(`[StopAndGo] Milking accepted. Session extended by ~${Math.floor(extra)}s`);

    return { accepted: true, extraTime: extra };
  }

  private handleCloseSignal(): void {
    const elapsed = (Date.now() - this.phaseStartTime) / 1000;
    const currentPersona = this.personaService.getCurrentPersona();
    const difficulty = currentPersona?.difficulty ?? 50;

    if (elapsed < this.minDuration) {
      // Vor MinDuration → streng / enttäuscht
      this.sendAIComment(this.getPersonaReaction('early_close', difficulty));
      this.intensityLevel = Math.max(10, this.intensityLevel - this.config.intensityDropOnPause);
      this.switchToStop();
    } else if (this.inFinalPhase) {
      // In finaler Phase → direkt zum Orgasmus
      this.sendAIComment("Gut... jetzt lass es kommen. Gib mir alles.");
      this.phase = 'final';
      this.intensityLevel = 100;
    } else {
      // Nach MinDuration aber vor Ende
      if (this.hasAskedAtMinDuration) {
        this.sendAIComment("Gut... dann halten wir noch durch. Sag Bescheid, wenn du nicht mehr kannst.");
      } else {
        this.sendAIComment(this.getPersonaReaction('close_after_min', difficulty));
        this.switchToStop();
      }
    }
  }

  private handleOrgasmSignal(): void {
    const currentPersona = this.personaService.getCurrentPersona();
    const difficulty = currentPersona?.difficulty ?? 50;

    if (this.phase === 'milking' && this.firstOrgasmTime === 0) {
      this.firstOrgasmTime = Date.now();
      this.sendAIComment(this.getPersonaReaction('first_orgasm_milking', difficulty));
      console.log('[StopAndGo] First orgasm during milking - continuing 30s');
    } else if (this.phase === 'milking' && this.firstOrgasmTime > 0) {
      this.sendAIComment("Das war das zweite... jetzt bist du leer. Gut gemacht.");
      this.endMilkingPhase();
    } else if (this.inFinalPhase || this.phase === 'final') {
      this.sendAIComment(this.getPersonaReaction('orgasm_final', difficulty));
      this.completeSession('orgasm');
    } else {
      // Zu früh / ohne Ankündigung
      this.sendAIComment(this.getPersonaReaction('early_orgasm', difficulty));
      // Ruin oder langsames Script (je nach Persona)
      this.intensityLevel = 20;
      this.switchToStop();
    }
  }

  private enterFinalPhase(): void {
    this.inFinalPhase = true;
    this.phase = 'final';
    this.phaseStartTime = Date.now();
    this.intensityLevel = 70;

    if (this.hasMilked) {
      this.sendAIComment("Du hast es geschafft. Jetzt kommt das Ende - ich melke dich richtig aus. Keine Pausen mehr.");
    } else {
      // Frage nach Verlängerung
      const currentPersona = this.personaService.getCurrentPersona();
      const difficulty = currentPersona?.difficulty ?? 50;
      const shouldOffer = this.questionService.shouldAskQuestion('want_extension', difficulty);

      if (shouldOffer) {
        const prompt = this.questionService.getPrompt('want_extension');
        this.sendAIComment(prompt);
        this.hasOfferedExtension = true;
      } else {
        this.sendAIComment("Du hast es geschafft. Jetzt kommt das Ende. Keine Pausen mehr - gib mir alles.");
      }
    }
    console.log('[StopAndGo] Entered FINAL phase - no more pauses');
  }

  private endMilkingPhase(): void {
    this.phase = 'go';
    this.milkingRequested = false;
    this.inFinalPhase = false;
    this.sendAIComment("Milking beendet. Jetzt Aftercare... Wie war es? Möchtest du noch etwas schreiben?");
    // Später: Warte auf Antwort, dann completeSession
    setTimeout(() => {
      if (!this.sessionCompleted) {
        this.completeSession('milking_complete');
      }
    }, 8000);
  }

  private completeSession(reason: 'orgasm' | 'milking_complete' | 'user_abort' | 'timeout'): void {
    if (this.sessionCompleted) return;
    this.sessionCompleted = true;

    if (reason === 'orgasm' || reason === 'milking_complete') {
      this.sendAIComment("Das war intensiv... gut gemacht. Ich bin stolz auf dich. Möchtest du noch etwas sagen oder soll ich dich verabschieden?");
    } else {
      this.sendAIComment("Session beendet. Danke, dass du durchgehalten hast.");
    }

    console.log(`[StopAndGo] Session completed: ${reason}`);
    // Hier könnte später ModeManager.endMode() aufgerufen werden
  }

  private switchToGo(): void {
    if (this.inFinalPhase || this.phase === 'milking') return;
    this.phase = 'go';
    this.phaseStartTime = Date.now();
    console.log('[StopAndGo] → GO phase (internal switch - no AI comment)');
  }

  private switchToStop(): void {
    if (this.inFinalPhase || this.phase === 'milking') return;
    this.phase = 'stop';
    this.phaseStartTime = Date.now();
    console.log('[StopAndGo] → STOP phase (internal switch - no AI comment)');
  }

  private sendAIComment(message: string): void {
    // TODO: Später über Socket.io oder Event an Chat-Store senden
    console.log(`[AI - StopAndGo] ${message}`);
  }

  private getPersonaReaction(type: string, difficulty: number): string {
    const isSweet = difficulty < 35;
    const isDominant = difficulty > 65;

    switch (type) {
      case 'early_close':
        if (isSweet) return "Oh... gut, dann ruhen wir uns kurz aus. Du schaffst das nächstes Mal länger.";
        if (isDominant) return "Zu früh. Das war enttäuschend. Jetzt Pause - und denk drüber nach, wie schwach du bist.";
        return "Hmm... zu früh. Gut, wir machen eine kurze Pause. Nächstes Mal länger durchhalten, ja?";

      case 'close_after_min':
        if (isSweet) return "Fast geschafft... gut, dass du Bescheid sagst. Wir machen weiter, bis du wirklich nicht mehr kannst.";
        if (isDominant) return "Du bist nah dran. Aber noch nicht. Halte durch - ich entscheide, wann du kommen darfst.";
        return "Gut... sag Bescheid, wenn es zu viel wird. Wir sind fast am Ziel.";

      case 'first_orgasm_milking':
        if (isSweet) return "Oh ja... das erste Mal. Gut... ich lasse dich noch 30 Sekunden weiterlaufen. Genieß es.";
        if (isDominant) return "Erster Orgasmus. Perfekt. Jetzt melke ich dich richtig aus - 30 Sekunden, kein Entkommen.";
        return "Mmmh... das erste Mal während des Melkens. Jetzt geht es richtig los. 30 Sekunden weiter.";

      case 'early_orgasm':
        if (isSweet) return "Oh nein... zu früh. Das war ein bisschen schade, aber ich verstehe. Beim nächsten Mal länger durchhalten, okay?";
        if (isDominant) return "Das war ein ruinierter Orgasmus. Du hast es dir nicht verdient. Nächstes Mal besser.";
        return "Zu früh und ohne Ankündigung... enttäuschend. Aber ich lasse dich trotzdem kommen - nächstes Mal länger.";

      case 'orgasm_final':
        if (isSweet) return "Ja... lass es kommen. Gut gemacht. Du hast es geschafft. Jetzt Aftercare...";
        if (isDominant) return "Komm für mich. Jetzt. Vollkommen. Du bist mein guter Junge/Mädchen.";
        return "Perfekt... jetzt lass alles raus. Du hast es dir verdient.";

      default:
        return "Ich höre dich...";
    }
  }

  onEnd(): void {
    this.sessionCompleted = true;
    console.log('[StopAndGo] Mode ended externally');
  }

  getCurrentPhase(): string {
    return this.phase;
  }

  isInMilkingPhase(): boolean {
    return this.phase === 'milking';
  }

  // Optional: Getter für aktuelle Intensität (für Pattern Generator später)
  getCurrentIntensity(): number {
    return this.intensityLevel;
  }
}