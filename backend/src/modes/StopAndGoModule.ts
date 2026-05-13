import { IModeModule, ModeType } from './IModeModule';

export class StopAndGoModule implements IModeModule {
  readonly name = 'Stop & Go';
  readonly type: ModeType = 'stopgo';

  private phase: 'go' | 'stop' | 'milking' = 'go';
  private phaseStartTime: number = Date.now();
  private minDuration: number;           // in seconds (set secretly by AI at start)
  private intensityLevel: number = 0;    // 0-100, increases over time
  private milkingRequested: boolean = false;
  private milkingStartTime: number = 0;
  private firstOrgasmTime: number = 0;

  onStart(): void {
    this.phase = 'go';
    this.phaseStartTime = Date.now();
    this.intensityLevel = 10;
    // AI secretly sets minimum duration (example: 180-420 seconds)
    this.minDuration = 180 + Math.floor(Math.random() * 240);
    console.log(`[StopAndGo] Mode started. Min duration: ${this.minDuration}s`);
  }

  onTick(): void {
    const now = Date.now();
    const elapsed = (now - this.phaseStartTime) / 1000;

    // Increase intensity slowly over time
    if (this.phase !== 'milking') {
      this.intensityLevel = Math.min(100, this.intensityLevel + 0.1);
    }

    // Handle phase switching (simple random for now)
    if (this.phase === 'go' && elapsed > 25 + Math.random() * 20) {
      this.switchToStop();
    } else if (this.phase === 'stop' && elapsed > 12 + Math.random() * 18) {
      this.switchToGo();
    }

    // Milking logic
    if (this.phase === 'milking' && this.firstOrgasmTime > 0) {
      const timeSinceFirstOrgasm = (now - this.firstOrgasmTime) / 1000;
      if (timeSinceFirstOrgasm > 30) {
        this.endMilking();
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
      if (this.phase === 'go' && !this.milkingRequested) {
        // User is close too early → decide based on difficulty
        const shouldGiveBreak = Math.random() > 0.6; // 40% chance to be strict
        if (shouldGiveBreak) {
          this.switchToStop();
          console.log('[StopAndGo] User was close early → gave break');
        } else {
          console.log('[StopAndGo] User was close early → ignored (strict mode)');
        }
      }
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

  requestMilking(): { accepted: boolean; extraTime: number } {
    if (this.milkingRequested || this.phase === 'milking') {
      return { accepted: false, extraTime: 0 };
    }

    this.milkingRequested = true;
    this.phase = 'milking';
    this.milkingStartTime = Date.now();
    this.firstOrgasmTime = 0;

    console.log('[StopAndGo] Milking accepted! Extra time required.');

    return { accepted: true, extraTime: Math.floor(this.minDuration * 0.2) };
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