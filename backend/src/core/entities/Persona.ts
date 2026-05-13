export class Persona {
    id: string;
    name: string;
    description: string;
    avatarFolder: string;           // z.B. "sophia"
    parameters: PersonaParameters;

    constructor(data: Partial<Persona>) {
        this.id = data.id || crypto.randomUUID();
        // ...
    }
}

export interface PersonaParameters {
    edgingDifficulty: number;        // 1-10
    minEdgesBeforeOrgasm: number;
    intensityRampSpeed: number;
    teaseLevel: number;
    favoriteModes: string[];
    // Weitere Parameter für zukünftige Modi...
}