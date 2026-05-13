export class Session {
    id: string;
    userId: string;
    personaId: string;
    startedAt: Date;
    currentMode: 'idle' | 'edging' | 'stopgo' | 'intercourse' | 'faphero' | string;
    status: 'active' | 'paused' | 'finished';
    performanceScore: number = 0;
    totalEdges: number = 0;
    orgasms: number = 0;

    constructor(userId: string, personaId: string) {
        this.id = crypto.randomUUID();
        this.userId = userId;
        this.personaId = personaId;
        this.startedAt = new Date();
        this.currentMode = 'idle';
        this.status = 'active';
    }
}