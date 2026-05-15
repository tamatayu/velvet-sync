import { IModeModule, ModeType } from './IModeModule';
import { container } from 'tsyringe';
import { ModeConfigService } from '../services/ModeConfigService';
import { AIQuestionService } from '../services/AIQuestionService';
import { PersonaService } from '../services/PersonaService';

export class StopAndGoModule implements IModeModule {
  readonly name = 'Stop & Go';
  readonly type: ModeType = 'stopgo';

  private phase: 'go' | 'stop' | 'milking' = 'go';
  private phaseStartTime: number = Date.now();
  private minDuration: number = 0;
  private targetEndTime: number = 0;
  private intensityLevel: number = 0;
  private milkingRequested: boolean = false;
  private milkingStartTime: number = 0;
  private firstOrgasmTime: number = 0;
  private hasAskedAtMinDuration: boolean = false;

  private configService = container.resolve(ModeConfigService);
  private config = this.configService.getStopGoConfig();
  private questionService = container.resolve(AIQuestionService);
  private personaService = container.resolve(PersonaService);

  onStart(): void {
    this.phase = 'go';
    this.phaseStartTime = Date.now();
    this.intensityLevel = 10;
    this.hasAskedAtMinDuration = false;

    const variance = Math.max(60, this.config.durationVariance);
    const baseDuration = this.config.baseDuration;

    this.minDuration = Math.floor(baseDuration - variance);
    this.targetEndTime = this.minDuration + Math.max(60, variance);

    console.log(`[StopAndGo] Mode started. Min duration: ${this.minDuration}s, Target end: ${this.targetEndTime}s`);
  }

  onTick(): void {
    const now = Date.now();
    const elapsed = (now - this.phaseStartTime) / 1000;

    // Dynamische Intensitätssteuerung
    const minDurationPoint = this.minDuration;
    const targetEnd = this.targetEndTime;

    if (this.phase !== 'milking') {
      if (elapsed < minDurationPoint) {
        // 0% → 75% bis zur MinDuration
        const progress = Math.min(1, elapsed / minDurationPoint);
        this.intensityLevel = Math.floor(75 * progress);
      } else {
        // 75% → 100% bis zum Zielende
        const remainingProgress = Math.min(1, (elapsed - minDurationPoint) / (targetEnd - minDurationPoint));
        this.intensityLevel = Math.floor(75 + (25 * remainingProgress));
      }
    }

    // Phasen-Wechsel (einfache Logik für den Anfang)
    if (this.phase === 'go' && elapsed > 25 + Math.random() * 20) {
      this.switchToStop();
    } else if (this.phase === 'stop' && elapsed > 12 + Math.random() * 18) {
      this.switchToGo();
    }

    // Milking Logik
    if (this.phase === 'milking' && this.firstOrgasmTime > 0) {
      const timeSinceFirstOrgasm = (now - this.firstOrgasmTime) / 1000;
      if (timeSinceFirstOrgasm > 30) {
        this.endMilking();
      }
    }

    // AI-Frage bei MinDuration (75% Intensität)
    if (!this.hasAskedAtMinDuration && elapsed >= this.minDuration && this.phase !== 'milking') {
      this.hasAskedAtMinDuration = true;

      // Difficulty aus aktueller Persona laden
      const currentPersona = this.personaService.getCurrentPersona();
      const difficulty = currentPersona?.difficulty ?? 50;
      const shouldAsk = this.questionService.shouldAskQuestion('holding_up', difficulty);

      if (shouldAsk) {
        const prompt = this.questionService.getPrompt('holding_up');
        console.log(`[StopAndGo] AI asks: "${prompt}"`);
        // Später: Event an ModeManager senden + auf Antwort warten mit Timeout
      } else {
        console.log('[StopAndGo] AI decided not to ask (high difficulty)');
      }
    }
  }

  onUserSignal(signal: string): void {
    const lower = signal.toLowerCase();

    if (lower.includes('milking') || lower.includes('milk me dry')) {
      this.requestMilking();
      return;
    }

    if (lower.includes('nah') || lower.includes('close') || lower.includes('komme')) {
      this.handleCloseSignal();
    }

    if (lower.includes('orgasm') || lower.includes('komme') || lower.includes('spritze')) {
      if (this.phase === 'milking' && this.firstOrgasmTime === 0) {
        this.firstOrgasmTime = Date.now();
        console.log('[StopAndGo] First orgasm during milking');
      } else if (this.phase === 'milking' && this.firstOrgasmTime > 0) {
        this.endMilking();
      }
    }
  }

  private handleCloseSignal() {
    const elapsed = (Date.now() - this.phaseStartTime) / 1000;

    if (elapsed < this.minDuration) {
      // Vor der MinDuration-Marke → streng behandeln (später Persona-abhängig)
      console.log('[StopAndGo] Early close before min duration → giving pause + reducing intensity');
      this.intensityLevel = Math.max(10, this.intensityLevel - this.config.intensityDropOnPause);
      this.switchToStop();
      // TODO: Später Persona-basiert entscheiden (Pause vs. strict vs. ruin)
    } else if (elapsed < this.targetEndTime) {
      // Zwischen MinDuration und Zielende
      if (this.hasAskedAtMinDuration) {
        console.log('[StopAndGo] Close signal after AI asked → continue (less strict)');
      } else {
        console.log('[StopAndGo] Close signal without prior question → slightly strict');
        this.switchToStop();
      }
    }
  }

  requestMilking(): { accepted: boolean; extraTime: number } {
    if (this.milkingRequested || this.phase === 'milking') {
      return { accepted: false, extraTime: 0 };
    }

    this.milkingRequested = true;
    this.phase = 'milking';
    this.milkingStartTime = Date.now();
    this.firstOrgasmTime = 0;

    // Bei Verlängerung Intensität auf 75% zurücksetzen
    this.intensityLevel = this.config.intensityAfterExtension;

    console.log('[StopAndGo] Extension accepted! Intensity reset to 75%.');
    return { accepted: true, extraTime: this.config.extensionBaseDuration + (Math.random() * this.config.extensionVariance) };
  }

  private switchToGo() {
    this.phase = 'go';
    this.phaseStartTime = Date.now();
    console.log('[StopAndGo] → GO phase');
  }

  private switchToStop() {
    this.phase = 'stop';
    this.phaseStartTime = Date.now();
    console.log('[StopAndGo] → STOP phase');
  }

  private endMilking() {
    this.phase = 'go';
    this.milkingRequested = false;
    console.log('[StopAndGo] Milking phase ended');
  }

  onEnd(): void {
    console.log('[StopAndGo] Mode ended');
  }

  getCurrentPhase(): string {
    return this.phase;
  }

  isInMilkingPhase(): boolean {
    return this.phase === 'milking';
  }
}