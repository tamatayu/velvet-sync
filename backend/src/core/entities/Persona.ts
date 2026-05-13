export interface PersonaParameters {
  edgingDifficulty: number;      // 1-10
  minEdgesBeforeOrgasm: number;
  intensityRampSpeed: number;    // 0-100
  teaseLevel: number;            // 0-100
  favoriteModes: string[];
  defaultTemperature: number;
}

export class Persona {
  id: string;
  name: string;
  description: string;
  avatar: string;
  parameters: PersonaParameters;

  constructor(data: Partial<Persona> & { name: string; description: string }) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name;
    this.description = data.description;
    this.avatar = data.avatar || 'default';
    this.parameters = data.parameters || {
      edgingDifficulty: 5,
      minEdgesBeforeOrgasm: 3,
      intensityRampSpeed: 60,
      teaseLevel: 70,
      favoriteModes: ['edging', 'tease'],
      defaultTemperature: 0.92
    };
  }
}

// Default Personas
export const DEFAULT_PERSONAS: Persona[] = [
  new Persona({
    id: 'luna',
    name: 'Luna',
    description: 'Verspielte, dominante Companion die gerne tease und control. Sehr direkt und sinnlich.',
    avatar: 'luna',
    parameters: {
      edgingDifficulty: 6,
      minEdgesBeforeOrgasm: 4,
      intensityRampSpeed: 55,
      teaseLevel: 85,
      favoriteModes: ['edging', 'tease', 'stopgo'],
      defaultTemperature: 0.93
    }
  }),
  new Persona({
    id: 'sophia',
    name: 'Sophia',
    description: 'Sanfte, fürsorgliche aber sehr verführerische Freundin. Mag lange, intensive Sessions.',
    avatar: 'sophia',
    parameters: {
      edgingDifficulty: 4,
      minEdgesBeforeOrgasm: 2,
      intensityRampSpeed: 45,
      teaseLevel: 60,
      favoriteModes: ['edging', 'intercourse'],
      defaultTemperature: 0.88
    }
  }),
  new Persona({
    id: 'vixen',
    name: 'Vixen',
    description: 'Brutal dominant, sadistisch und unerbittlich. Für harte Edging- und Denial-Sessions.',
    avatar: 'vixen',
    parameters: {
      edgingDifficulty: 9,
      minEdgesBeforeOrgasm: 6,
      intensityRampSpeed: 75,
      teaseLevel: 95,
      favoriteModes: ['edging', 'denial', 'faphero'],
      defaultTemperature: 0.95
    }
  })
];