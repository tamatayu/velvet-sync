import { Router } from 'express';
import { container } from 'tsyringe';
import { ProfileService } from '../services/ProfileService';

const router = Router();
const profileService = container.resolve(ProfileService);

router.get('/', (req, res) => {
  res.json(profileService.getAllProfiles());
});

router.get('/current', (req, res) => {
  res.json(profileService.getCurrentProfile());
});

router.post('/', (req, res) => {
  try {
    const profile = profileService.createProfile(req.body);
    res.status(201).json(profile);
  } catch (e) {
    res.status(400).json({ error: 'Failed to create profile' });
  }
});

router.put('/:id', (req, res) => {
  const updated = profileService.updateProfile(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Profile not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const success = profileService.deleteProfile(req.params.id);
  if (!success) return res.status(404).json({ error: 'Profile not found' });
  res.json({ success: true });
});

router.post('/:id/switch', (req, res) => {
  const profile = profileService.switchProfile(req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

export default router;