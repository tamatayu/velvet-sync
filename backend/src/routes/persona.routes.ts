import { Router } from 'express';
import { container } from 'tsyringe';
import { PersonaService } from '../services/PersonaService';

const router = Router();
const personaService = container.resolve(PersonaService);

router.get('/', (req, res) => {
  res.json(personaService.getAllPersonas());
});

router.get('/:id', (req, res) => {
  const persona = personaService.getPersonaById(req.params.id);
  if (!persona) return res.status(404).json({ error: 'Persona not found' });
  res.json(persona);
});

router.post('/', (req, res) => {
  try {
    const persona = personaService.createPersona(req.body);
    res.status(201).json(persona);
  } catch (e) {
    res.status(400).json({ error: 'Invalid persona data' });
  }
});

router.put('/:id', (req, res) => {
  const updated = personaService.updatePersona(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Persona not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const success = personaService.deletePersona(req.params.id);
  if (!success) return res.status(404).json({ error: 'Persona not found' });
  res.json({ success: true });
});

export default router;