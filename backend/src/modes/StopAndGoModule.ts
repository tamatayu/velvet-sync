import { IModeModule, ModeType } from './IModeModule';
import { container } from 'tsyringe';
import { ModeConfigService } from '../services/ModeConfigService';

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

    // Dynamische Intensitätssteigerung
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
      console.log('[StopAndGo] AI should ask: "How are you holding up?" (75% intensity reached)');
      // Später: Event an ModeManager / AI senden
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
      // Vor der MinDuration-Marke → streng behandeln
      console.log('[StopAndGo] Early close signal before min duration');
      // TODO: Je nach Persona → Pause geben oder streng bleiben
      this.switchToStop();
    } else if (elapsed < this.targetEndTime) {
      // Zwischen MinDuration und Zielende
      if (this.hasAskedAtMinDuration) {
        console.log('[StopAndGo] Close signal after question → OK (continue)');
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

    console.log('[StopAndGo] Milking accepted! Extra time required.');
    return { accepted: true, extraTime: Math.floor(this.config.extensionBaseDuration * 0.2) };
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