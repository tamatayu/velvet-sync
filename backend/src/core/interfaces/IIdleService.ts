// core/interfaces/IIdleService.ts
export interface IIdleService {
    startIdleMonitoring(sessionId: string): void;
    stopIdleMonitoring(sessionId: string): void;
    onIdleTimeout(callback: (sessionId: string, reason: string) => void): void;
}