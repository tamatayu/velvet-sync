export type ModeType = 'edging' | 'stopgo' | 'challenge';

export interface IModeModule {
  readonly name: string;
  readonly type: ModeType;

  // Called when the mode starts
  onStart(): void;

  // Called periodically (e.g. every 1-2 seconds) while active
  onTick(): void;

  // Called when user sends a signal (chat or shortcut)
  onUserSignal(signal: string): void;

  // Called when user requests milking
  requestMilking(): { accepted: boolean; extraTime: number };

  // Called when the mode should end
  onEnd(): void;

  // Returns current internal phase (e.g. "go", "stop", "build_up", "recovery")
  getCurrentPhase(): string;

  // Returns whether the mode is currently in a "milking" state
  isInMilkingPhase(): boolean;
}