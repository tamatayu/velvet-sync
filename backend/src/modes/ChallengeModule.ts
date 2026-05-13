import { IModeModule, ModeType } from './IModeModule';

export class ChallengeModule implements IModeModule {
  readonly name = 'Stamina Challenge';
  readonly type: ModeType = 'challenge';

  private phase = 'endurance';

  onStart(): void {
    console.log('[ChallengeModule] Started (stub)');
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
    console.log('[ChallengeModule] Ended (stub)');
  }

  getCurrentPhase(): string {
    return this.phase;
  }

  isInMilkingPhase(): boolean {
    return false;
  }
}