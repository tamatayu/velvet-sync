import { injectable, singleton } from 'tsyringe';
import { Session } from '../entities';

@singleton()
export class AppStateService {
    private activeSession: Session | null = null;
    private connectionStatus = { handy: false, ollama: false };

    getActiveSession(): Session | null {
        return this.activeSession;
    }

    setActiveSession(session: Session) {
        this.activeSession = session;
        // Event auslösen
    }

    updateConnectionStatus(handy: boolean, ollama: boolean) {
        this.connectionStatus = { handy, ollama };
    }
}