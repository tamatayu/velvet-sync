import { injectable } from 'tsyringe';
import { Persona, DEFAULT_PERSONAS } from '../core/entities/Persona';
import fs from 'node:fs';
import path from 'node:path';

@injectable()
export class PersonaService {
  private readonly personasFile: string;
  private personas: Map<string, Persona> = new Map();

  constructor() {
    this.personasFile = path.resolve('data/personas.json');
    this.loadPersonas();
  }

  private loadPersonas() {
    // Load defaults first
    DEFAULT_PERSONAS.forEach(p => this.personas.set(p.id, p));

    // Try to load custom personas from file
    try {
      if (fs.existsSync(this.personasFile)) {
        const data = JSON.parse(fs.readFileSync(this.personasFile, 'utf8'));
        data.forEach((p: any) => {
          this.personas.set(p.id, new Persona(p));
        });
      }
    } catch (e) {
      console.warn('[PersonaService] Could not load custom personas, using defaults only');
    }
  }

  getAllPersonas(): Persona[] {
    return Array.from(this.personas.values());
  }

  getPersonaById(id: string): Persona | undefined {
    return this.personas.get(id);
  }

  getDefaultPersona(): Persona {
    return this.personas.get('luna') || DEFAULT_PERSONAS[0];
  }

  createPersona(data: Partial<Persona> & { name: string; description: string }): Persona {
    const persona = new Persona(data);
    this.personas.set(persona.id, persona);
    this.savePersonas();
    return persona;
  }

  updatePersona(id: string, updates: Partial<Persona>): Persona | undefined {
    const existing = this.personas.get(id);
    if (!existing) return undefined;

    const updated = new Persona({ ...existing, ...updates, id });
    this.personas.set(id, updated);
    this.savePersonas();
    return updated;
  }

  deletePersona(id: string): boolean {
    const deleted = this.personas.delete(id);
    if (deleted) this.savePersonas();
    return deleted;
  }

  private savePersonas() {
    try {
      const dir = path.dirname(this.personasFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const data = Array.from(this.personas.values()).filter(p => !DEFAULT_PERSONAS.some(d => d.id === p.id));
      fs.writeFileSync(this.personasFile, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[PersonaService] Failed to save personas:', e);
    }
  }
}