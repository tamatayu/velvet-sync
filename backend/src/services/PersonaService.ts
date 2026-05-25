import { injectable } from 'tsyringe';
import fs from 'node:fs';
import path from 'node:path';
import { Persona } from '../core/entities/Persona';

@injectable()
export class PersonaService {
    private personas = new Map<string, Persona>();
    private currentPersonaId: string = 'vanilla';

    constructor() {
        this.loadPersonas();
    }

    private loadPersonas() {
        try {
            const filePath = path.resolve('data/personas.json');
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                data.forEach((p: Persona) => this.personas.set(p.id, p));
            } else {
                // Load defaults
           //     DEFAULT_PERSONAS.forEach(p => this.personas.set(p.id, p));
            }
        } catch (e) {
            console.warn('[PersonaService] Could not load personas, using defaults');
         //   DEFAULT_PERSONAS.forEach(p => this.personas.set(p.id, p));
        }
    }

    private savePersonas() {
        try {
            const filePath = path.resolve('data/personas.json');
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(Array.from(this.personas.values()), null, 2));
        } catch (e) {
            console.error('[PersonaService] Failed to save personas');
        }
    }

    getAllPersonas(): Persona[] {
        return Array.from(this.personas.values());
    }

    getPersonaById(id: string): Persona | undefined {
        return this.personas.get(id);
    }

    getCurrentPersona(): Persona | undefined {
        return this.personas.get(this.currentPersonaId);
    }

    setCurrentPersona(id: string): boolean {
        if (this.personas.has(id)) {
            this.currentPersonaId = id;
            return true;
        }
        return false;
    }

    getDefaultPersona(): Persona {
        return this.personas.get('vanilla') || DEFAULT_PERSONAS[0];
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

        Object.assign(existing, updates);
        this.savePersonas();
        return existing;
    }

    deletePersona(id: string): boolean {
        if (!this.personas.has(id)) return false;
        this.personas.delete(id);

        if (this.currentPersonaId === id) {
            this.currentPersonaId = 'vanilla';
        }
        this.savePersonas();
        return true;
    }
}