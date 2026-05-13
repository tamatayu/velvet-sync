import { injectable } from 'tsyringe';
import { IModeModule } from '../modes/IModeModule';
import { StopAndGoModule } from '../modes/StopAndGoModule';
import { EdgingModule } from '../modes/EdgingModule';
import { ChallengeModule } from '../modes/ChallengeModule';

export type ModeState = 
  | 'IDLE'
  | 'PROPOSING'
  | 'AWAITING_CONFIRMATION'
  | 'ACTIVE'
  | 'FINISHED'
  | 'EMERGENCY_STOP';

export type ModeType = 'edging' | 'stopgo' | 'challenge';

export interface ModeStatus {
  state: ModeState;
  activeMode: ModeType | null;
  startedAt: Date | null;
  currentPhase?: string;
}

@injectable()
export class ModeManager {
  private state: ModeState = 'IDLE';
  private activeMode: ModeType | null = null;
  private startedAt: Date | null = null;
  private currentPhase: string | null = null;
  private currentModule: IModeModule | null = null;

  public onStatusChange?: (status: ModeStatus) => void;

  getCurrentStatus(): ModeStatus {
    return {
      state: this.state,
      activeMode: this.activeMode,
      startedAt: this.startedAt,
      currentPhase: this.currentPhase || undefined
    };
  }

  proposeMode(mode: ModeType) {
    if (this.state !== 'IDLE') return;

    this.activeMode = mode;
    this.state = 'PROPOSING';
    this.notifyStatusChange();
  }

  awaitConfirmation() {
    if (this.state !== 'PROPOSING') return;

    this.state = 'AWAITING_CONFIRMATION';
    this.notifyStatusChange();
  }

  startMode() {
    if (this.state !== 'AWAITING_CONFIRMATION' || !this.activeMode) return;

    // Load the correct module
    this.currentModule = this.loadModule(this.activeMode);
    this.currentModule?.onStart();

    this.state = 'ACTIVE';
    this.startedAt = new Date();
    this.currentPhase = this.currentModule?.getCurrentPhase() || 'initial';
    this.notifyStatusChange();
  }

  private loadModule(type: ModeType): IModeModule {
    switch (type) {
      case 'stopgo': return new StopAndGoModule();
      case 'edging': return new EdgingModule();
      case 'challenge': return new ChallengeModule();
      default: return new StopAndGoModule();
    }
  }

  updatePhase(phase: string) {
    if (this.state !== 'ACTIVE') return;

    this.currentPhase = phase;
    this.notifyStatusChange();
  }

  endMode(reason: 'orgasm' | 'denied' | 'timeout' | 'user_abort') {
    if (this.state !== 'ACTIVE') return;

    this.state = 'FINISHED';
    this.notifyStatusChange();

    setTimeout(() => {
      this.reset();
    }, 3000);
  }

  emergencyStop() {
    this.state = 'EMERGENCY_STOP';
    this.notifyStatusChange();

    setTimeout(() => {
      this.reset();
    }, 1500);
  }

  private reset() {
    this.state = 'IDLE';
    this.activeMode = null;
    this.startedAt = null;
    this.currentPhase = null;
    this.notifyStatusChange();
  }

  private notifyStatusChange() {
    if (this.onStatusChange) {
      this.onStatusChange(this.getCurrentStatus());
    }
  }
}