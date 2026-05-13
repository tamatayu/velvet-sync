import { IModeModule, ModeType } from './IModeModule';

export class EdgingModule implements IModeModule {
  readonly name = 'Edging';
  readonly type: ModeType = 'edging';

  private phase = 'build_up';

  onStart(): void {
    console.log('[EdgingModule] Started (stub)');
  }

  onTick(): void {
    // TODO: Implement real logic later
  }

  onUserSignal(signal: string): void {
    // TODO
  }

  requestMilking(): { accepted: boolean; extraTime: number } {
    return { accepted: false, extraTime: 0 }; // Not implemented yet
  }

  onEnd(): void {
    console.log('[EdgingModule] Ended (stub)');
  }

  getCurrentPhase(): string {
    return this.phase;
  }

  isInMilkingPhase(): boolean {
    return false;
  }
}